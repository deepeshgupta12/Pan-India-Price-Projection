"""
Unit tests for the pricing engine.

Run with:  cd apps/api && python -m pytest tests/ -v
"""
import pytest

from app.schemas.pricing import PricingAnalysisInput
from app.services.pricing_engine import (
    _calculate_data_completeness,
    _clamp,
    _compute_base_pricing,
    _confidence_score,
    _get_scenario_cagr,
    _projection_growth_rate,
    _to_float,
    compute_current_fair_price,
    compute_projection_analysis,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_payload(**kwargs) -> PricingAnalysisInput:
    defaults = dict(
        project_name="Test Project",
        benchmark_current_asking_price="10000",
        scenario_code="base",
        scenario_market_cagr=0.08,
        scenario_supply_stress_adjustment=-0.01,
        scenario_infra_realization_adjustment=0.01,
        scenario_affordability_drag_adjustment=-0.01,
        scenario_developer_premium_drift=0.005,
        scenario_risk_drag_adjustment=-0.005,
    )
    defaults.update(kwargs)
    return PricingAnalysisInput(**defaults)


# ── _to_float ─────────────────────────────────────────────────────────────────

class TestToFloat:
    def test_integer_string(self):
        assert _to_float("1000") == 1000.0

    def test_float_string(self):
        assert _to_float("8.5") == 8.5

    def test_empty_string_returns_default(self):
        assert _to_float("", 5.0) == 5.0

    def test_none_returns_default(self):
        assert _to_float(None, 3.0) == 3.0

    def test_comma_separated(self):
        assert _to_float("1,00,000") == 100000.0

    def test_invalid_string(self):
        assert _to_float("abc", 7.0) == 7.0

    def test_numeric_float_passthrough(self):
        assert _to_float(9.2) == 9.2


# ── _clamp ────────────────────────────────────────────────────────────────────

class TestClamp:
    def test_within_range(self):
        assert _clamp(5.0, 0.0, 10.0) == 5.0

    def test_below_lower(self):
        assert _clamp(-1.0, 0.0, 10.0) == 0.0

    def test_above_upper(self):
        assert _clamp(15.0, 0.0, 10.0) == 10.0

    def test_at_boundaries(self):
        assert _clamp(0.0, 0.0, 10.0) == 0.0
        assert _clamp(10.0, 0.0, 10.0) == 10.0


# ── Data completeness ─────────────────────────────────────────────────────────

class TestDataCompleteness:
    def test_zero_fields_filled(self):
        payload = PricingAnalysisInput()
        score = _calculate_data_completeness(payload)
        # scenario_code="base" and rera_status="Registered" are non-empty defaults,
        # so a small non-zero score is expected.
        assert 0.0 <= score < 20.0

    def test_partial_fields_filled(self):
        payload = make_payload(
            amenity_score="8.0",
            construction_quality_score="8.5",
            legal_clarity_score="8.0",
        )
        score = _calculate_data_completeness(payload)
        assert 0 < score < 100

    def test_required_fields_filled(self):
        payload = make_payload(
            project_stage="New Launch",
            rera_status="Registered",
            total_units="800",
        )
        score = _calculate_data_completeness(payload)
        assert score > 0

    def test_score_is_percentage(self):
        payload = make_payload(
            project_stage="New Launch",
            rera_status="Registered",
        )
        score = _calculate_data_completeness(payload)
        assert 0 <= score <= 100


# ── Confidence score ──────────────────────────────────────────────────────────

class TestConfidenceScore:
    def test_minimum_floor(self):
        payload = PricingAnalysisInput()
        score = _confidence_score(payload, 0.0)
        assert score >= 50.0

    def test_maximum_cap(self):
        payload = make_payload(
            developer_brand_score="9.5",
            developer_on_time_score="9.0",
            inventory_overhang_months="15",
            absorption_rate_pct="60",
            legal_clarity_score="9.0",
            benchmark_radius_km="2.0",
        )
        score = _confidence_score(payload, 100.0)
        assert score <= 95.0

    def test_higher_completeness_gives_higher_score(self):
        payload_empty = make_payload()
        payload_full = make_payload(
            developer_brand_score="8.5",
            developer_on_time_score="8.5",
            inventory_overhang_months="15",
            absorption_rate_pct="55",
            legal_clarity_score="8.5",
        )
        s_empty = _confidence_score(payload_empty, 20.0)
        s_full = _confidence_score(payload_full, 80.0)
        assert s_full > s_empty


# ── Scenario CAGR ─────────────────────────────────────────────────────────────

class TestScenarioCAGR:
    def test_db_injected_base(self):
        payload = make_payload(scenario_market_cagr=0.08)
        assert _get_scenario_cagr(payload) == pytest.approx(0.08)

    def test_db_injected_bear(self):
        payload = make_payload(scenario_code="bear", scenario_market_cagr=0.04)
        assert _get_scenario_cagr(payload) == pytest.approx(0.04)

    def test_custom_scenario_uses_custom_rate(self):
        payload = make_payload(
            scenario_code="custom",
            scenario_market_cagr=0.08,
            custom_growth_rate_pct="11.5",
        )
        rate = _get_scenario_cagr(payload)
        assert rate == pytest.approx(0.115)

    def test_fallback_without_db_injection(self):
        payload = PricingAnalysisInput(scenario_code="base")
        rate = _get_scenario_cagr(payload)
        # Should fall through to hardcoded default of 8%
        assert rate == pytest.approx(0.08)


# ── Projection growth rate ────────────────────────────────────────────────────

class TestProjectionGrowthRate:
    def test_base_within_bounds(self):
        payload = make_payload()
        rate = _projection_growth_rate(payload, "base")
        assert 0.01 <= rate <= 0.20

    def test_bull_gt_bear(self):
        payload = make_payload()
        bear_payload = make_payload(
            scenario_code="bear",
            scenario_market_cagr=0.04,
        )
        bull_payload = make_payload(
            scenario_code="bull",
            scenario_market_cagr=0.12,
        )
        rate_bear = _projection_growth_rate(bear_payload, "bear")
        rate_bull = _projection_growth_rate(bull_payload, "bull")
        assert rate_bull > rate_bear

    def test_high_overhang_reduces_rate(self):
        low_payload = make_payload(inventory_overhang_months="5")
        high_payload = make_payload(inventory_overhang_months="30")
        r_low = _projection_growth_rate(low_payload, "base")
        r_high = _projection_growth_rate(high_payload, "base")
        assert r_low > r_high

    def test_metro_proximity_increases_rate(self):
        far = make_payload(distance_to_metro_km="10")
        near = make_payload(distance_to_metro_km="0.5")
        r_far = _projection_growth_rate(far, "base")
        r_near = _projection_growth_rate(near, "base")
        assert r_near > r_far


# ── Core pricing computation ──────────────────────────────────────────────────

class TestComputeBasePricing:
    def test_returns_positive_fair_price(self):
        payload = make_payload(benchmark_current_asking_price="15000")
        result = _compute_base_pricing(payload)
        assert result.current_fair_price_psf > 0

    def test_fair_price_close_to_benchmark_when_neutral(self):
        """With no adjustments at all, fair price should be close to benchmark."""
        payload = PricingAnalysisInput(
            benchmark_current_asking_price="10000",
            scenario_code="base",
        )
        result = _compute_base_pricing(payload)
        # Should be within ±25% of benchmark given clamping
        assert 7500 <= result.current_fair_price_psf <= 13000

    def test_lower_band_lt_fair_price_lt_upper_band(self):
        payload = make_payload(benchmark_current_asking_price="12000")
        result = _compute_base_pricing(payload)
        assert result.lower_fair_price_psf < result.current_fair_price_psf < result.upper_fair_price_psf

    def test_factors_list_has_six_entries(self):
        payload = make_payload()
        result = _compute_base_pricing(payload)
        assert len(result.factors) == 6

    def test_high_amenity_increases_price(self):
        low = make_payload(amenity_score="3.0")
        high = make_payload(amenity_score="9.5")
        low_result = _compute_base_pricing(low)
        high_result = _compute_base_pricing(high)
        assert high_result.current_fair_price_psf > low_result.current_fair_price_psf

    def test_high_developer_brand_increases_price(self):
        low = make_payload(developer_brand_score="3.0")
        high = make_payload(developer_brand_score="9.5")
        low_result = _compute_base_pricing(low)
        high_result = _compute_base_pricing(high)
        assert high_result.current_fair_price_psf > low_result.current_fair_price_psf

    def test_unregistered_rera_discounts_price(self):
        registered = make_payload(rera_status="Registered")
        unregistered = make_payload(rera_status="Not Registered")
        r_reg = _compute_base_pricing(registered)
        r_unreg = _compute_base_pricing(unregistered)
        assert r_unreg.current_fair_price_psf < r_reg.current_fair_price_psf

    def test_high_density_reduces_price(self):
        low_density = make_payload(density_units_per_acre="40")
        high_density = make_payload(density_units_per_acre="150")
        low_result = _compute_base_pricing(low_density)
        high_result = _compute_base_pricing(high_density)
        assert low_result.current_fair_price_psf > high_result.current_fair_price_psf

    def test_high_overhang_reduces_price(self):
        low = make_payload(inventory_overhang_months="5")
        high = make_payload(inventory_overhang_months="48")
        low_result = _compute_base_pricing(low)
        high_result = _compute_base_pricing(high)
        assert low_result.current_fair_price_psf > high_result.current_fair_price_psf

    def test_infra_uplift_increases_price(self):
        no_infra = make_payload(infra_uplift_pct="0")
        with_infra = make_payload(infra_uplift_pct="8.0")
        no_result = _compute_base_pricing(no_infra)
        with_result = _compute_base_pricing(with_infra)
        assert with_result.current_fair_price_psf > no_result.current_fair_price_psf

    def test_summary_contains_project_name(self):
        payload = make_payload(project_name="My Test Project")
        result = _compute_base_pricing(payload)
        assert "My Test Project" in result.summary


# ── Full API functions ────────────────────────────────────────────────────────

class TestComputeCurrentFairPrice:
    def test_returns_pricing_analysis_response(self):
        payload = make_payload(benchmark_current_asking_price="14000")
        result = compute_current_fair_price(payload)
        assert result.current_fair_price_psf > 0
        assert result.confidence_score >= 50
        assert result.data_completeness_score >= 0

    def test_scenario_code_preserved(self):
        payload = make_payload(scenario_code="bull", scenario_market_cagr=0.12)
        result = compute_current_fair_price(payload)
        assert result.scenario_code == "bull"


class TestComputeProjectionAnalysis:
    def test_has_four_projection_points(self):
        payload = make_payload(benchmark_current_asking_price="12000")
        result = compute_projection_analysis(payload)
        assert len(result.selected_scenario_projection_points) == 4

    def test_projection_labels_correct(self):
        payload = make_payload(benchmark_current_asking_price="12000")
        result = compute_projection_analysis(payload)
        labels = [p.label for p in result.selected_scenario_projection_points]
        assert labels == ["Current", "1Y", "3Y", "5Y"]

    def test_prices_increasing_in_bull_scenario(self):
        payload = make_payload(
            benchmark_current_asking_price="10000",
            scenario_code="bull",
            scenario_market_cagr=0.12,
        )
        result = compute_projection_analysis(payload)
        pts = result.selected_scenario_projection_points
        assert pts[0].projected_price_psf < pts[1].projected_price_psf < pts[3].projected_price_psf

    def test_has_three_scenario_comparisons(self):
        payload = make_payload(benchmark_current_asking_price="10000")
        result = compute_projection_analysis(payload)
        assert len(result.scenario_comparison) == 3

    def test_sensitivity_scenarios_present(self):
        payload = make_payload(benchmark_current_asking_price="10000")
        result = compute_projection_analysis(payload)
        assert len(result.sensitivity_scenarios) > 0

    def test_top_sensitivity_driver_not_empty(self):
        payload = make_payload(benchmark_current_asking_price="10000")
        result = compute_projection_analysis(payload)
        assert result.top_sensitivity_driver != ""

    def test_interpretation_bullets_present(self):
        payload = make_payload(benchmark_current_asking_price="10000")
        result = compute_projection_analysis(payload)
        assert len(result.interpretation_bullets) >= 1

    def test_risk_flags_present(self):
        payload = make_payload(benchmark_current_asking_price="10000")
        result = compute_projection_analysis(payload)
        assert len(result.risk_flags) >= 1

    def test_rera_not_registered_triggers_risk_flag(self):
        payload = make_payload(
            benchmark_current_asking_price="10000",
            rera_status="Not Registered",
        )
        result = compute_projection_analysis(payload)
        flag_text = " ".join(result.risk_flags).lower()
        assert "rera" in flag_text or "not registered" in flag_text or "regulatory" in flag_text

    def test_high_overhang_triggers_risk_flag(self):
        payload = make_payload(
            benchmark_current_asking_price="10000",
            inventory_overhang_months="25",
        )
        result = compute_projection_analysis(payload)
        flag_text = " ".join(result.risk_flags).lower()
        assert "overhang" in flag_text or "inventory" in flag_text
