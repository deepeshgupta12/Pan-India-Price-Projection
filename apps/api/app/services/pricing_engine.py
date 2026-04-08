"""
Pricing Engine — data-driven rewrite.

All scenario adjustments, developer premiums, and growth rates are drawn from
values injected into PricingAnalysisInput by the pricing route (which reads them
from the database).  The engine itself contains no hardcoded lookup tables.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.schemas.pricing import (
    ConfidenceExplanation,
    PricingAnalysisInput,
    PricingAnalysisResponse,
    PricingFactorBreakdown,
    ProjectionAnalysisResponse,
    ProjectionPoint,
    ScenarioProjectionSummary,
    SensitivityScenario,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_float(value: str | float | None, default: float = 0.0) -> float:
    if value is None:
        return default
    normalized = str(value).strip().replace(",", "")
    if normalized == "":
        return default
    try:
        return float(normalized)
    except ValueError:
        return default


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


# ── Data completeness ─────────────────────────────────────────────────────────

# All fields tracked for completeness scoring (expanded from 17 → 30+).
_COMPLETENESS_FIELDS = [
    # Project basics (5)
    "project_name", "project_stage", "rera_status", "total_units",
    "benchmark_current_asking_price",
    # Product configuration (7)
    "avg_unit_size_sqft", "density_units_per_acre", "parking_ratio",
    "open_space_pct", "amenity_score", "construction_quality_score",
    "legal_clarity_score",
    # Market benchmark (3)
    "benchmark_radius_km", "comparable_sold_psf", "avg_rent",
    # Supply and demand (3)
    "inventory_overhang_months", "absorption_rate_pct", "new_supply_upcoming_units",
    # Developer profile (3)
    "developer_brand_score", "developer_on_time_score", "developer_litigation_score",
    # Macro (3)
    "repo_rate_pct", "inflation_rate_pct", "gdp_growth_pct",
    # Connectivity (4)
    "distance_to_metro_km", "distance_to_airport_km", "distance_to_cbd_km",
    "social_infra_score",
    # Infrastructure (1)
    "infra_uplift_pct",
]


def _calculate_data_completeness(payload: PricingAnalysisInput) -> float:
    filled = sum(
        1
        for key in _COMPLETENESS_FIELDS
        if str(getattr(payload, key, "") or "").strip() not in ("", "None")
    )
    return round((filled / len(_COMPLETENESS_FIELDS)) * 100, 2)


# ── Confidence ────────────────────────────────────────────────────────────────

def _confidence_score(payload: PricingAnalysisInput, data_completeness: float) -> float:
    """
    Five-driver confidence model (replaces the single data-completeness driver).
    Each driver contributes up to 10 points on top of a 45-point floor.
    """
    score = 45.0

    # Driver 1 – data completeness (0–10 pts, linear)
    score += _clamp(data_completeness * 0.10, 0.0, 10.0)

    # Driver 2 – benchmark quality (0–10 pts)
    bm = _to_float(payload.benchmark_current_asking_price)
    radius = _to_float(payload.benchmark_radius_km, 5.0)
    if bm > 0:
        score += _clamp(10.0 - max(radius - 2.0, 0.0) * 2.0, 3.0, 10.0)

    # Driver 3 – developer profile present (0–10 pts)
    brand = _to_float(payload.developer_brand_score)
    on_time = _to_float(payload.developer_on_time_score)
    if brand > 0 and on_time > 0:
        score += _clamp((brand + on_time) / 2.0, 0.0, 10.0)
    elif brand > 0 or on_time > 0:
        score += 3.0

    # Driver 4 – supply-demand data present (0–10 pts)
    overhang = _to_float(payload.inventory_overhang_months)
    absorption = _to_float(payload.absorption_rate_pct)
    if overhang > 0 and absorption > 0:
        score += 10.0
    elif overhang > 0 or absorption > 0:
        score += 4.0

    # Driver 5 – legal clarity (0–10 pts)
    legal = _to_float(payload.legal_clarity_score)
    if legal > 0:
        score += _clamp(legal, 0.0, 10.0)
    else:
        score += 3.0  # assume baseline when not provided

    return round(_clamp(score, 50.0, 95.0), 2)


def _confidence_explanation(score: float) -> ConfidenceExplanation:
    if score >= 85:
        return ConfidenceExplanation(
            score=score,
            label="High confidence",
            explanation=(
                "Strong input completeness across benchmark, developer, supply-demand, "
                "and legal drivers supports a comparatively stable output."
            ),
        )
    if score >= 70:
        return ConfidenceExplanation(
            score=score,
            label="Moderate confidence",
            explanation=(
                "The analysis is directionally useful, but a few missing or defaulted "
                "inputs could still move the output meaningfully."
            ),
        )
    return ConfidenceExplanation(
        score=score,
        label="Low confidence",
        explanation=(
            "Several important inputs are missing or under-specified. "
            "Treat this output as indicative only."
        ),
    )


# ── Scenario helpers (data-driven) ────────────────────────────────────────────

def _scenario_name(scenario_code: str) -> str:
    return {"bear": "Bear", "base": "Base", "bull": "Bull"}.get(
        scenario_code.lower(), scenario_code.title()
    )


def _get_scenario_cagr(payload: PricingAnalysisInput) -> float:
    """
    Growth rate for the *selected* scenario.
    Priority:
      1. custom_growth_rate_pct (user override)
      2. scenario_market_cagr (injected from DB ScenarioProfile)
      3. safe fallback 8%
    """
    custom = _to_float(payload.custom_growth_rate_pct, -999.0)
    if custom != -999.0 and payload.scenario_code.lower() == "custom":
        return _clamp(custom / 100.0, -0.10, 0.30)
    if payload.scenario_market_cagr is not None:
        return _clamp(float(payload.scenario_market_cagr), -0.10, 0.30)
    # last-resort hardcoded defaults (should never be reached after route injection)
    return {"bear": 0.04, "base": 0.08, "bull": 0.12}.get(
        payload.scenario_code.lower(), 0.08
    )


def _cagr_for_scenario_code(
    payload: PricingAnalysisInput, scenario_code: str
) -> float:
    """CAGR for any of the three fixed scenarios (used when building comparison table)."""
    return {"bear": 0.04, "base": 0.08, "bull": 0.12}.get(scenario_code.lower(), 0.08)


# ── Projection growth rate ────────────────────────────────────────────────────

def _projection_growth_rate(payload: PricingAnalysisInput, scenario_code: str) -> float:
    """
    Base CAGR + marginal adjustments from location, supply, and infra quality.
    When computing for the selected scenario, reads DB-injected CAGR.
    When computing for comparison scenarios, uses the standard fixed CAGRs.
    """
    if scenario_code.lower() == payload.scenario_code.lower():
        base_growth = _get_scenario_cagr(payload)
    else:
        base_growth = _cagr_for_scenario_code(payload, scenario_code)

    # Marginal adjustments (capped small)
    amenity_score = _to_float(payload.amenity_score, 0.0)
    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    social_infra_score = _to_float(payload.social_infra_score, 0.0)
    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    infra_uplift_pct = _to_float(payload.infra_uplift_pct, 0.0)

    amenity_growth = max((amenity_score - 5.0) * 0.004, 0.0)
    connectivity_growth = (
        max((3.0 - distance_to_metro_km) * 0.003, 0.0) if distance_to_metro_km > 0 else 0.0
    )
    infra_growth = (
        max((social_infra_score - 5.0) * 0.003, 0.0)
        + _clamp(infra_uplift_pct / 100.0 * 0.3, 0.0, 0.02)
    )
    supply_drag = max((inventory_overhang_months - 12.0) * 0.0025, 0.0) if inventory_overhang_months > 0 else 0.0

    # ScenarioProfile supply-stress and infra-realization carry-through
    supply_stress = float(payload.scenario_supply_stress_adjustment or 0.0)
    infra_realiz = float(payload.scenario_infra_realization_adjustment or 0.0)

    growth_rate = _clamp(
        base_growth
        + amenity_growth
        + connectivity_growth
        + infra_growth
        - supply_drag
        + supply_stress
        + infra_realiz,
        0.01,
        0.20,
    )
    return round(growth_rate, 6)


# ── Core pricing computation ──────────────────────────────────────────────────

@dataclass
class PricingComputation:
    benchmark_price_psf: float
    specification_adjustment_pct: float
    market_adjustment_pct: float
    connectivity_adjustment_pct: float
    developer_adjustment_pct: float
    macro_adjustment_pct: float
    scenario_adjustment_pct: float
    total_adjustment_pct: float
    current_fair_price_psf: float
    lower_fair_price_psf: float
    upper_fair_price_psf: float
    premium_discount_vs_benchmark_pct: float
    confidence_score: float
    data_completeness_score: float
    factors: list[PricingFactorBreakdown]
    summary: str


def _compute_base_pricing(payload: PricingAnalysisInput) -> PricingComputation:
    benchmark_price_psf = _to_float(payload.benchmark_current_asking_price, 0.0)
    if benchmark_price_psf <= 0:
        benchmark_price_psf = 1.0

    # ── A: Specification / product quality ────────────────────────────────────
    amenity_score = _to_float(payload.amenity_score, 0.0)
    construction_quality_score = _to_float(payload.construction_quality_score, 0.0)
    legal_clarity_score = _to_float(payload.legal_clarity_score, 0.0)
    open_space_pct = _to_float(payload.open_space_pct, 0.0)
    parking_ratio = _to_float(payload.parking_ratio, 0.0)
    density_units_per_acre = _to_float(payload.density_units_per_acre, 0.0)

    specification_adjustment_pct = 0.0
    if amenity_score > 0:
        specification_adjustment_pct += (amenity_score - 5.0) * 0.012
    if construction_quality_score > 0:
        specification_adjustment_pct += (construction_quality_score - 5.0) * 0.010
    if legal_clarity_score > 0:
        specification_adjustment_pct += (legal_clarity_score - 5.0) * 0.008
    if open_space_pct > 0:
        specification_adjustment_pct += (open_space_pct - 50.0) * 0.0015
    if parking_ratio > 0:
        specification_adjustment_pct += (parking_ratio - 1.0) * 0.02
    if density_units_per_acre > 0:
        specification_adjustment_pct -= max((density_units_per_acre - 75.0) * 0.0008, 0.0)

    # ── B: Market / supply-demand ─────────────────────────────────────────────
    avg_rent = _to_float(payload.avg_rent, 0.0)
    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    benchmark_radius_km = _to_float(payload.benchmark_radius_km, 0.0)
    absorption_rate_pct = _to_float(payload.absorption_rate_pct, 0.0)
    comparable_sold_psf = _to_float(payload.comparable_sold_psf, 0.0)
    new_supply_upcoming_units = _to_float(payload.new_supply_upcoming_units, 0.0)

    market_adjustment_pct = 0.0
    if avg_rent > 0:
        market_adjustment_pct += min(avg_rent / 100_000.0, 0.03)
    if inventory_overhang_months > 0:
        market_adjustment_pct -= max((inventory_overhang_months - 12.0) * 0.003, 0.0)
    if benchmark_radius_km > 0:
        market_adjustment_pct -= max((benchmark_radius_km - 3.0) * 0.005, 0.0)
    if absorption_rate_pct > 0:
        market_adjustment_pct += (absorption_rate_pct - 50.0) * 0.0004
    if comparable_sold_psf > 0 and benchmark_price_psf > 0:
        sold_vs_asking_pct = (comparable_sold_psf - benchmark_price_psf) / benchmark_price_psf
        market_adjustment_pct += _clamp(sold_vs_asking_pct * 0.3, -0.04, 0.04)
    if new_supply_upcoming_units > 0:
        # Mild supply headwind: >5000 units = up to -1.5%
        market_adjustment_pct -= _clamp(new_supply_upcoming_units / 5000.0 * 0.015, 0.0, 0.015)

    # Apply ScenarioProfile supply stress adjustment
    supply_stress = float(payload.scenario_supply_stress_adjustment or 0.0)
    market_adjustment_pct += supply_stress

    # ── C: Connectivity & social infra ────────────────────────────────────────
    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    distance_to_cbd_km = _to_float(payload.distance_to_cbd_km, 0.0)
    distance_to_airport_km = _to_float(payload.distance_to_airport_km, 0.0)
    social_infra_score = _to_float(payload.social_infra_score, 0.0)
    infra_uplift_pct = _to_float(payload.infra_uplift_pct, 0.0)

    connectivity_adjustment_pct = 0.0
    if distance_to_metro_km > 0:
        connectivity_adjustment_pct += max((3.0 - distance_to_metro_km) * 0.01, 0.0)
    if distance_to_cbd_km > 0:
        connectivity_adjustment_pct += max((10.0 - distance_to_cbd_km) * 0.003, 0.0)
    if distance_to_airport_km > 0 and distance_to_airport_km < 15:
        connectivity_adjustment_pct += max((15.0 - distance_to_airport_km) * 0.001, 0.0)
    if social_infra_score > 0:
        connectivity_adjustment_pct += (social_infra_score - 5.0) * 0.008
    if infra_uplift_pct > 0:
        # Apply ScenarioProfile infra realization scaling
        infra_realiz = float(payload.scenario_infra_realization_adjustment or 0.0)
        effective_infra = infra_uplift_pct / 100.0 * _clamp(1.0 + infra_realiz * 5.0, 0.5, 1.5)
        connectivity_adjustment_pct += _clamp(effective_infra, 0.0, 0.12)

    # ── D: Developer premium (data-driven) ────────────────────────────────────
    brand_score = _to_float(payload.developer_brand_score, 0.0)
    on_time_score = _to_float(payload.developer_on_time_score, 0.0)
    litigation_score = _to_float(payload.developer_litigation_score, 0.0)

    developer_adjustment_pct = 0.0
    if brand_score > 0:
        developer_adjustment_pct += (brand_score - 5.0) * 0.012
    if on_time_score > 0:
        developer_adjustment_pct += (on_time_score - 5.0) * 0.006
    if litigation_score > 0:
        developer_adjustment_pct -= _clamp(litigation_score * 0.008, 0.0, 0.04)
    # ScenarioProfile developer premium drift
    dev_drift = float(payload.scenario_developer_premium_drift or 0.0)
    developer_adjustment_pct += dev_drift

    # ── E: Macro adjustment ───────────────────────────────────────────────────
    repo_rate_pct = _to_float(payload.repo_rate_pct, 0.0)
    inflation_rate_pct = _to_float(payload.inflation_rate_pct, 0.0)
    gdp_growth_pct = _to_float(payload.gdp_growth_pct, 0.0)

    macro_adjustment_pct = 0.0
    if repo_rate_pct > 0:
        macro_adjustment_pct -= max((repo_rate_pct - 6.0) * 0.008, 0.0)
    if inflation_rate_pct > 0:
        macro_adjustment_pct -= max((inflation_rate_pct - 5.0) * 0.004, 0.0)
    if gdp_growth_pct > 0:
        macro_adjustment_pct += (gdp_growth_pct - 6.0) * 0.005
    # ScenarioProfile affordability drag
    affords_drag = float(payload.scenario_affordability_drag_adjustment or 0.0)
    macro_adjustment_pct += affords_drag
    # ScenarioProfile risk drag
    risk_drag = float(payload.scenario_risk_drag_adjustment or 0.0)
    macro_adjustment_pct += risk_drag

    # ── F: RERA / stage risk (scenario adjustment proxy) ─────────────────────
    scenario_adjustment_pct = 0.0
    # Construction stage risk discounts
    stage_discounts = {
        "New Launch": -0.005,
        "Under Construction": -0.02,
        "Ready to Move": 0.0,
        "Pre-Launch": -0.03,
    }
    scenario_adjustment_pct += stage_discounts.get(payload.project_stage, -0.01)
    # RERA status risk discounts
    rera_discounts = {
        "Registered": 0.0,
        "Applied": -0.01,
        "Exempted": 0.0,
        "Not Registered": -0.04,
    }
    scenario_adjustment_pct += rera_discounts.get(payload.rera_status, 0.0)

    # ── Total adjustment ──────────────────────────────────────────────────────
    total_adjustment_pct = _clamp(
        specification_adjustment_pct
        + market_adjustment_pct
        + connectivity_adjustment_pct
        + developer_adjustment_pct
        + macro_adjustment_pct
        + scenario_adjustment_pct,
        -0.25,
        0.30,
    )

    current_fair_price_psf = round(benchmark_price_psf * (1 + total_adjustment_pct), 2)
    lower_fair_price_psf = round(current_fair_price_psf * 0.95, 2)
    upper_fair_price_psf = round(current_fair_price_psf * 1.05, 2)
    premium_discount_vs_benchmark_pct = round(
        ((current_fair_price_psf - benchmark_price_psf) / benchmark_price_psf) * 100, 2
    )

    data_completeness_score = _calculate_data_completeness(payload)
    confidence_score = _confidence_score(payload, data_completeness_score)

    # ── Factor breakdowns ─────────────────────────────────────────────────────
    factors = [
        PricingFactorBreakdown(
            factor_name="Specification",
            value=round(specification_adjustment_pct * 100, 2),
            explanation=(
                "Derived from amenity score, construction quality, legal clarity, "
                "open space, parking ratio, and density."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Market and supply-demand",
            value=round(market_adjustment_pct * 100, 2),
            explanation=(
                "Derived from rent benchmark, inventory overhang, absorption rate, "
                "sold comparables, upcoming supply, and scenario supply-stress."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Connectivity and infrastructure",
            value=round(connectivity_adjustment_pct * 100, 2),
            explanation=(
                "Derived from metro proximity, CBD distance, airport proximity, "
                "social infrastructure score, and infra uplift factor."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Developer premium",
            value=round(developer_adjustment_pct * 100, 2),
            explanation=(
                "Derived from developer brand score, on-time delivery track record, "
                "litigation risk, and scenario developer-premium drift."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Macro and risk",
            value=round(macro_adjustment_pct * 100, 2),
            explanation=(
                "Derived from RBI repo rate, CPI inflation, GDP growth, "
                "and scenario affordability / risk drag adjustments."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Stage and regulatory",
            value=round(scenario_adjustment_pct * 100, 2),
            explanation=(
                "Derived from project stage (construction risk) and RERA registration status."
            ),
        ),
    ]

    direction_text = "premium" if premium_discount_vs_benchmark_pct >= 0 else "discount"
    summary = (
        f"The model estimates a current fair asking price of "
        f"₹{current_fair_price_psf:,.0f} per sq ft for "
        f"{payload.project_name or 'the selected project'}, implying a "
        f"{abs(premium_discount_vs_benchmark_pct):.1f}% {direction_text} "
        f"versus the provided benchmark price."
    )

    return PricingComputation(
        benchmark_price_psf=round(benchmark_price_psf, 2),
        specification_adjustment_pct=specification_adjustment_pct,
        market_adjustment_pct=market_adjustment_pct,
        connectivity_adjustment_pct=connectivity_adjustment_pct,
        developer_adjustment_pct=developer_adjustment_pct,
        macro_adjustment_pct=macro_adjustment_pct,
        scenario_adjustment_pct=scenario_adjustment_pct,
        total_adjustment_pct=total_adjustment_pct,
        current_fair_price_psf=current_fair_price_psf,
        lower_fair_price_psf=lower_fair_price_psf,
        upper_fair_price_psf=upper_fair_price_psf,
        premium_discount_vs_benchmark_pct=premium_discount_vs_benchmark_pct,
        confidence_score=confidence_score,
        data_completeness_score=data_completeness_score,
        factors=factors,
        summary=summary,
    )


# ── Interpretation, risk flags ────────────────────────────────────────────────

def _build_interpretation_bullets(
    payload: PricingAnalysisInput,
    base: PricingComputation,
) -> list[str]:
    bullets: list[str] = []

    if base.premium_discount_vs_benchmark_pct >= 0:
        bullets.append(
            f"The project currently screens at a "
            f"{base.premium_discount_vs_benchmark_pct:.2f}% premium to the provided benchmark."
        )
    else:
        bullets.append(
            f"The project currently screens at a "
            f"{abs(base.premium_discount_vs_benchmark_pct):.2f}% discount to the provided benchmark."
        )

    amenity_score = _to_float(payload.amenity_score, 0.0)
    if amenity_score >= 8:
        bullets.append(
            "Amenity quality is materially supportive of pricing strength and future retention."
        )
    elif 0 < amenity_score <= 5:
        bullets.append(
            "Amenity quality is not yet strong enough to support an aggressive premium."
        )

    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    if inventory_overhang_months >= 18:
        bullets.append(
            "Inventory overhang is elevated and can weigh on near-term price acceleration."
        )
    elif 0 < inventory_overhang_months <= 10:
        bullets.append(
            "Supply conditions look relatively supportive for near-term price movement."
        )

    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    if 0 < distance_to_metro_km <= 2:
        bullets.append(
            "Transit accessibility is a positive support factor for current pricing and projection strength."
        )

    brand_score = _to_float(payload.developer_brand_score, 0.0)
    if brand_score >= 8.5:
        bullets.append(
            "The developer brand profile contributes a meaningful premium to the fair price estimate."
        )

    return bullets[:5]


def _build_risk_flags(payload: PricingAnalysisInput) -> list[str]:
    flags: list[str] = []

    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    if inventory_overhang_months >= 20:
        flags.append("Very high inventory overhang (≥20 months) may strongly suppress near-term pricing power.")
    elif inventory_overhang_months >= 18:
        flags.append("Elevated inventory overhang may suppress short-term pricing power.")

    legal_clarity_score = _to_float(payload.legal_clarity_score, 0.0)
    if 0 < legal_clarity_score < 7:
        flags.append("Legal clarity score is below comfort threshold — verify title and encumbrance status.")

    density_units_per_acre = _to_float(payload.density_units_per_acre, 0.0)
    if density_units_per_acre > 90:
        flags.append("High project density (>90 units/acre) may cap premium realization.")

    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    if 0 < distance_to_metro_km > 5:
        flags.append("Metro access is relatively weak — this may limit demand from transit-dependent buyers.")

    litigation_score = _to_float(payload.developer_litigation_score, 0.0)
    if litigation_score > 5:
        flags.append("Developer has a high litigation risk score — buyer caution warranted.")

    rera_status = (payload.rera_status or "").strip()
    if rera_status in ("Not Registered", ""):
        flags.append("Project is not RERA-registered — significant regulatory and legal risk.")

    repo_rate_pct = _to_float(payload.repo_rate_pct, 0.0)
    if repo_rate_pct >= 7:
        flags.append("Elevated repo rate environment may dampen affordability and demand.")

    if not flags:
        flags.append("No major model-based risk flag is currently triggered.")

    return flags[:5]


# ── Sensitivity analysis ──────────────────────────────────────────────────────

def _build_sensitivity_input(
    payload: PricingAnalysisInput,
    field_name: str,
    new_value: float,
) -> PricingAnalysisInput:
    return payload.model_copy(update={field_name: str(round(new_value, 4))})


def _build_sensitivity_scenarios(
    payload: PricingAnalysisInput,
    base: PricingComputation,
) -> tuple[list[SensitivityScenario], str]:
    definitions = [
        {
            "field": "benchmark_current_asking_price",
            "label": "Benchmark asking price",
            "downside": _to_float(payload.benchmark_current_asking_price, 10000.0) * 0.95,
            "upside": _to_float(payload.benchmark_current_asking_price, 10000.0) * 1.05,
            "interpretation": "Benchmark selection can materially shift the current fair price output.",
        },
        {
            "field": "amenity_score",
            "label": "Amenity score",
            "downside": max(_to_float(payload.amenity_score, 8.0) - 1.5, 0.0),
            "upside": min(_to_float(payload.amenity_score, 8.0) + 1.5, 10.0),
            "interpretation": "Higher amenity quality usually improves premium retention.",
        },
        {
            "field": "inventory_overhang_months",
            "label": "Inventory overhang",
            "downside": max(_to_float(payload.inventory_overhang_months, 12.0) + 8.0, 0.0),
            "upside": max(_to_float(payload.inventory_overhang_months, 12.0) - 6.0, 1.0),
            "interpretation": "Lower overhang typically improves near-term pricing support.",
        },
        {
            "field": "distance_to_metro_km",
            "label": "Distance to metro",
            "downside": _to_float(payload.distance_to_metro_km, 3.0) + 2.0,
            "upside": max(_to_float(payload.distance_to_metro_km, 3.0) - 1.5, 0.3),
            "interpretation": "Better metro access often supports stronger pricing and growth.",
        },
        {
            "field": "developer_brand_score",
            "label": "Developer brand score",
            "downside": max(_to_float(payload.developer_brand_score, 7.0) - 2.0, 0.0),
            "upside": min(_to_float(payload.developer_brand_score, 7.0) + 1.5, 10.0),
            "interpretation": "Stronger developer brand typically commands a consistent market premium.",
        },
        {
            "field": "infra_uplift_pct",
            "label": "Infrastructure uplift",
            "downside": 0.0,
            "upside": max(_to_float(payload.infra_uplift_pct, 3.0) + 3.0, 5.0),
            "interpretation": "Planned infrastructure (metro, expressway) can significantly improve long-term value.",
        },
    ]

    scenarios: list[SensitivityScenario] = []
    top_driver = ""
    top_driver_abs_change = -1.0

    for definition in definitions:
        downside_payload = _build_sensitivity_input(
            payload, definition["field"], float(definition["downside"])
        )
        upside_payload = _build_sensitivity_input(
            payload, definition["field"], float(definition["upside"])
        )

        downside_result = _compute_base_pricing(downside_payload)
        upside_result = _compute_base_pricing(upside_payload)

        downside_change_pct = round(
            ((downside_result.current_fair_price_psf - base.current_fair_price_psf)
             / base.current_fair_price_psf) * 100,
            2,
        )
        upside_change_pct = round(
            ((upside_result.current_fair_price_psf - base.current_fair_price_psf)
             / base.current_fair_price_psf) * 100,
            2,
        )

        max_abs_change = max(abs(downside_change_pct), abs(upside_change_pct))
        if max_abs_change > top_driver_abs_change:
            top_driver_abs_change = max_abs_change
            top_driver = str(definition["label"])

        scenarios.append(
            SensitivityScenario(
                variable_key=str(definition["field"]),
                variable_label=str(definition["label"]),
                downside_price_psf=downside_result.current_fair_price_psf,
                base_price_psf=base.current_fair_price_psf,
                upside_price_psf=upside_result.current_fair_price_psf,
                downside_change_pct=downside_change_pct,
                upside_change_pct=upside_change_pct,
                interpretation=str(definition["interpretation"]),
            )
        )

    return scenarios, top_driver or "Benchmark asking price"


# ── Public API ────────────────────────────────────────────────────────────────

def compute_current_fair_price(payload: PricingAnalysisInput) -> PricingAnalysisResponse:
    base = _compute_base_pricing(payload)
    return PricingAnalysisResponse(
        project_name=payload.project_name or "Selected Project",
        scenario_code=payload.scenario_code,
        benchmark_price_psf=base.benchmark_price_psf,
        current_fair_price_psf=base.current_fair_price_psf,
        lower_fair_price_psf=base.lower_fair_price_psf,
        upper_fair_price_psf=base.upper_fair_price_psf,
        premium_discount_vs_benchmark_pct=base.premium_discount_vs_benchmark_pct,
        confidence_score=base.confidence_score,
        data_completeness_score=base.data_completeness_score,
        factors=base.factors,
        summary=base.summary,
    )


def compute_projection_analysis(payload: PricingAnalysisInput) -> ProjectionAnalysisResponse:
    base = _compute_base_pricing(payload)
    selected_growth_rate = _projection_growth_rate(payload, payload.scenario_code)

    selected_points = [
        ProjectionPoint(label="Current", year=0, projected_price_psf=base.current_fair_price_psf),
        ProjectionPoint(
            label="1Y", year=1,
            projected_price_psf=round(base.current_fair_price_psf * ((1 + selected_growth_rate) ** 1), 2),
        ),
        ProjectionPoint(
            label="3Y", year=3,
            projected_price_psf=round(base.current_fair_price_psf * ((1 + selected_growth_rate) ** 3), 2),
        ),
        ProjectionPoint(
            label="5Y", year=5,
            projected_price_psf=round(base.current_fair_price_psf * ((1 + selected_growth_rate) ** 5), 2),
        ),
    ]

    scenario_summaries: list[ScenarioProjectionSummary] = []
    for sc in ["bear", "base", "bull"]:
        gr = _projection_growth_rate(payload, sc)
        scenario_summaries.append(
            ScenarioProjectionSummary(
                scenario_code=sc,
                scenario_name=_scenario_name(sc),
                projected_1y_price_psf=round(base.current_fair_price_psf * ((1 + gr) ** 1), 2),
                projected_3y_price_psf=round(base.current_fair_price_psf * ((1 + gr) ** 3), 2),
                projected_5y_price_psf=round(base.current_fair_price_psf * ((1 + gr) ** 5), 2),
                annualized_growth_pct=round(gr * 100, 2),
            )
        )

    selected_growth_summary = (
        f"For the {_scenario_name(payload.scenario_code).lower()} scenario, the model "
        f"estimates an annualized forward growth rate of {selected_growth_rate * 100:.2f}% "
        f"from the current fair asking price baseline."
    )

    sensitivity_scenarios, top_sensitivity_driver = _build_sensitivity_scenarios(payload, base)

    return ProjectionAnalysisResponse(
        project_name=payload.project_name or "Selected Project",
        scenario_code=payload.scenario_code,
        benchmark_price_psf=base.benchmark_price_psf,
        current_fair_price_psf=base.current_fair_price_psf,
        lower_fair_price_psf=base.lower_fair_price_psf,
        upper_fair_price_psf=base.upper_fair_price_psf,
        premium_discount_vs_benchmark_pct=base.premium_discount_vs_benchmark_pct,
        confidence_score=base.confidence_score,
        data_completeness_score=base.data_completeness_score,
        factors=base.factors,
        summary=base.summary,
        selected_scenario_projection_points=selected_points,
        scenario_comparison=scenario_summaries,
        selected_scenario_growth_summary=selected_growth_summary,
        interpretation_bullets=_build_interpretation_bullets(payload, base),
        risk_flags=_build_risk_flags(payload),
        confidence_explanation=_confidence_explanation(base.confidence_score),
        sensitivity_scenarios=sensitivity_scenarios,
        top_sensitivity_driver=top_sensitivity_driver,
    )
