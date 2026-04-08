from __future__ import annotations

from dataclasses import dataclass, replace

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


def _to_float(value: str | None, default: float = 0.0) -> float:
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


@dataclass
class PricingComputation:
    benchmark_price_psf: float
    specification_adjustment_pct: float
    market_adjustment_pct: float
    connectivity_adjustment_pct: float
    risk_adjustment_pct: float
    total_adjustment_pct: float
    current_fair_price_psf: float
    lower_fair_price_psf: float
    upper_fair_price_psf: float
    premium_discount_vs_benchmark_pct: float
    confidence_score: float
    data_completeness_score: float
    factors: list[PricingFactorBreakdown]
    summary: str


def _calculate_data_completeness(payload: PricingAnalysisInput) -> float:
    tracked_fields = [
        payload.project_name,
        payload.project_stage,
        payload.total_land_acres,
        payload.total_units,
        payload.avg_unit_size_sqft,
        payload.density_units_per_acre,
        payload.parking_ratio,
        payload.open_space_pct,
        payload.amenity_score,
        payload.construction_quality_score,
        payload.legal_clarity_score,
        payload.benchmark_current_asking_price,
        payload.benchmark_radius_km,
        payload.avg_rent,
        payload.inventory_overhang_months,
        payload.distance_to_metro_km,
        payload.social_infra_score,
    ]
    filled_count = sum(1 for value in tracked_fields if str(value).strip() != "")
    return round((filled_count / len(tracked_fields)) * 100, 2)


def _scenario_adjustment_pct(scenario_code: str) -> float:
    scenario_map = {
        "bear": -0.02,
        "base": 0.0,
        "bull": 0.025,
    }
    return scenario_map.get(scenario_code.lower(), 0.0)


def _scenario_name(scenario_code: str) -> str:
    scenario_map = {
        "bear": "Bear",
        "base": "Base",
        "bull": "Bull",
    }
    return scenario_map.get(scenario_code.lower(), scenario_code.title())


def _projection_growth_rate(payload: PricingAnalysisInput, scenario_code: str) -> float:
    amenity_score = _to_float(payload.amenity_score, 0.0)
    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    social_infra_score = _to_float(payload.social_infra_score, 0.0)

    scenario_base_growth_map = {
        "bear": 0.045,
        "base": 0.085,
        "bull": 0.125,
    }
    base_growth = scenario_base_growth_map.get(scenario_code.lower(), 0.085)

    amenity_growth = max((amenity_score - 5.0) * 0.004, 0.0)
    connectivity_growth = max((3.0 - distance_to_metro_km) * 0.003, 0.0)
    infra_growth = max((social_infra_score - 5.0) * 0.003, 0.0)
    supply_drag = max((inventory_overhang_months - 12.0) * 0.0025, 0.0)

    growth_rate = _clamp(
        base_growth + amenity_growth + connectivity_growth + infra_growth - supply_drag,
        0.02,
        0.18,
    )
    return round(growth_rate, 6)


def _confidence_explanation(score: float) -> ConfidenceExplanation:
    if score >= 85:
        return ConfidenceExplanation(
            score=score,
            label="High confidence",
            explanation=(
                "The analysis has strong input completeness and enough populated "
                "drivers to support a comparatively stable output."
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
            "The output should be treated cautiously because several important inputs "
            "are missing or under-specified."
        ),
    )


def _build_interpretation_bullets(
    payload: PricingAnalysisInput,
    base: PricingComputation,
) -> list[str]:
    bullets: list[str] = []

    if base.premium_discount_vs_benchmark_pct >= 0:
        bullets.append(
            f"The project currently screens at a {base.premium_discount_vs_benchmark_pct:.2f}% premium "
            f"to the provided benchmark."
        )
    else:
        bullets.append(
            f"The project currently screens at a {abs(base.premium_discount_vs_benchmark_pct):.2f}% discount "
            f"to the provided benchmark."
        )

    amenity_score = _to_float(payload.amenity_score, 0.0)
    if amenity_score >= 8:
        bullets.append(
            "Amenity quality is materially supportive of pricing strength and future retention."
        )
    elif amenity_score <= 5:
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

    return bullets[:4]


def _build_risk_flags(payload: PricingAnalysisInput) -> list[str]:
    flags: list[str] = []

    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    if inventory_overhang_months >= 18:
        flags.append("High inventory overhang may suppress short-term pricing power.")

    legal_clarity_score = _to_float(payload.legal_clarity_score, 0.0)
    if 0 < legal_clarity_score < 7:
        flags.append("Legal clarity score is below comfort threshold.")

    density_units_per_acre = _to_float(payload.density_units_per_acre, 0.0)
    if density_units_per_acre > 90:
        flags.append("High project density may cap premium realization.")

    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    if distance_to_metro_km > 4:
        flags.append("Metro access is relatively weak for a premium-led pricing stance.")

    if not flags:
        flags.append("No major model-based risk flag is currently triggered.")

    return flags[:4]


def _build_sensitivity_input(
    payload: PricingAnalysisInput,
    field_name: str,
    new_value: float,
) -> PricingAnalysisInput:
    return payload.model_copy(update={field_name: str(round(new_value, 4))})


def _compute_base_pricing(payload: PricingAnalysisInput) -> PricingComputation:
    benchmark_price_psf = _to_float(payload.benchmark_current_asking_price, 0.0)
    if benchmark_price_psf <= 0:
        benchmark_price_psf = 1.0

    amenity_score = _to_float(payload.amenity_score, 0.0)
    construction_quality_score = _to_float(payload.construction_quality_score, 0.0)
    legal_clarity_score = _to_float(payload.legal_clarity_score, 0.0)
    open_space_pct = _to_float(payload.open_space_pct, 0.0)
    parking_ratio = _to_float(payload.parking_ratio, 0.0)
    density_units_per_acre = _to_float(payload.density_units_per_acre, 0.0)

    avg_rent = _to_float(payload.avg_rent, 0.0)
    inventory_overhang_months = _to_float(payload.inventory_overhang_months, 0.0)
    benchmark_radius_km = _to_float(payload.benchmark_radius_km, 0.0)

    distance_to_metro_km = _to_float(payload.distance_to_metro_km, 0.0)
    social_infra_score = _to_float(payload.social_infra_score, 0.0)

    specification_adjustment_pct = (
        ((amenity_score - 5.0) * 0.012)
        + ((construction_quality_score - 5.0) * 0.010)
        + ((legal_clarity_score - 5.0) * 0.008)
        + ((open_space_pct - 50.0) * 0.0015)
        + ((parking_ratio - 1.0) * 0.02)
        - max((density_units_per_acre - 75.0) * 0.0008, 0.0)
    )

    market_adjustment_pct = (
        min(avg_rent / 100000.0, 0.03)
        - max((inventory_overhang_months - 12.0) * 0.003, 0.0)
        - max((benchmark_radius_km - 3.0) * 0.005, 0.0)
    )

    connectivity_adjustment_pct = (
        max((3.0 - distance_to_metro_km) * 0.01, 0.0)
        + ((social_infra_score - 5.0) * 0.008)
    )

    risk_adjustment_pct = _scenario_adjustment_pct(payload.scenario_code)

    total_adjustment_pct = _clamp(
        specification_adjustment_pct
        + market_adjustment_pct
        + connectivity_adjustment_pct
        + risk_adjustment_pct,
        -0.20,
        0.25,
    )

    current_fair_price_psf = round(benchmark_price_psf * (1 + total_adjustment_pct), 2)
    lower_fair_price_psf = round(current_fair_price_psf * 0.95, 2)
    upper_fair_price_psf = round(current_fair_price_psf * 1.05, 2)
    premium_discount_vs_benchmark_pct = round(
        ((current_fair_price_psf - benchmark_price_psf) / benchmark_price_psf) * 100,
        2,
    )

    data_completeness_score = _calculate_data_completeness(payload)
    confidence_score = round(
        _clamp(55 + (data_completeness_score * 0.35), 50, 95),
        2,
    )

    factors = [
        PricingFactorBreakdown(
            factor_name="Specification adjustment",
            value=round(specification_adjustment_pct * 100, 2),
            explanation=(
                "Derived from amenity score, construction quality, legal clarity, "
                "open space, parking ratio, and density."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Market adjustment",
            value=round(market_adjustment_pct * 100, 2),
            explanation=(
                "Derived from rent benchmark, inventory overhang, and benchmark radius."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Connectivity adjustment",
            value=round(connectivity_adjustment_pct * 100, 2),
            explanation=(
                "Derived from metro accessibility and social infrastructure strength."
            ),
        ),
        PricingFactorBreakdown(
            factor_name="Scenario adjustment",
            value=round(risk_adjustment_pct * 100, 2),
            explanation=(
                "Derived from the selected scenario profile to reflect current stance."
            ),
        ),
    ]

    direction_text = "premium" if premium_discount_vs_benchmark_pct >= 0 else "discount"

    summary = (
        f"The model estimates a current fair asking price of ₹{current_fair_price_psf:,.0f} "
        f"per sq ft for {payload.project_name or 'the selected project'}, implying a "
        f"{abs(premium_discount_vs_benchmark_pct):.1f}% {direction_text} versus the provided "
        f"benchmark price."
    )

    return PricingComputation(
        benchmark_price_psf=round(benchmark_price_psf, 2),
        specification_adjustment_pct=specification_adjustment_pct,
        market_adjustment_pct=market_adjustment_pct,
        connectivity_adjustment_pct=connectivity_adjustment_pct,
        risk_adjustment_pct=risk_adjustment_pct,
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


def _build_sensitivity_scenarios(
    payload: PricingAnalysisInput,
    base: PricingComputation,
) -> tuple[list[SensitivityScenario], str]:
    definitions = [
        {
            "field": "amenity_score",
            "label": "Amenity score",
            "downside": max(_to_float(payload.amenity_score, 8.0) - 1.0, 0.0),
            "upside": _to_float(payload.amenity_score, 8.0) + 1.0,
            "interpretation": "Higher amenity quality usually improves premium retention.",
        },
        {
            "field": "inventory_overhang_months",
            "label": "Inventory overhang",
            "downside": max(_to_float(payload.inventory_overhang_months, 12.0) + 6.0, 0.0),
            "upside": max(_to_float(payload.inventory_overhang_months, 12.0) - 6.0, 0.0),
            "interpretation": "Lower overhang typically improves near-term pricing support.",
        },
        {
            "field": "distance_to_metro_km",
            "label": "Distance to metro",
            "downside": _to_float(payload.distance_to_metro_km, 2.0) + 1.0,
            "upside": max(_to_float(payload.distance_to_metro_km, 2.0) - 1.0, 0.1),
            "interpretation": "Better metro access often supports stronger pricing and growth.",
        },
        {
            "field": "benchmark_current_asking_price",
            "label": "Benchmark asking price",
            "downside": _to_float(payload.benchmark_current_asking_price, 10000.0) * 0.95,
            "upside": _to_float(payload.benchmark_current_asking_price, 10000.0) * 1.05,
            "interpretation": "Benchmark selection can materially shift the current fair price output.",
        },
    ]

    scenarios: list[SensitivityScenario] = []
    top_driver = ""
    top_driver_abs_change = -1.0

    for definition in definitions:
        downside_payload = _build_sensitivity_input(
            payload,
            definition["field"],
            float(definition["downside"]),
        )
        upside_payload = _build_sensitivity_input(
            payload,
            definition["field"],
            float(definition["upside"]),
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


def compute_current_fair_price(
    payload: PricingAnalysisInput,
) -> PricingAnalysisResponse:
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


def compute_projection_analysis(
    payload: PricingAnalysisInput,
) -> ProjectionAnalysisResponse:
    base = _compute_base_pricing(payload)

    selected_growth_rate = _projection_growth_rate(payload, payload.scenario_code)

    selected_points = [
        ProjectionPoint(
            label="Current",
            year=0,
            projected_price_psf=base.current_fair_price_psf,
        ),
        ProjectionPoint(
            label="1Y",
            year=1,
            projected_price_psf=round(
                base.current_fair_price_psf * ((1 + selected_growth_rate) ** 1),
                2,
            ),
        ),
        ProjectionPoint(
            label="3Y",
            year=3,
            projected_price_psf=round(
                base.current_fair_price_psf * ((1 + selected_growth_rate) ** 3),
                2,
            ),
        ),
        ProjectionPoint(
            label="5Y",
            year=5,
            projected_price_psf=round(
                base.current_fair_price_psf * ((1 + selected_growth_rate) ** 5),
                2,
            ),
        ),
    ]

    scenario_summaries: list[ScenarioProjectionSummary] = []
    for scenario_code in ["bear", "base", "bull"]:
        growth_rate = _projection_growth_rate(payload, scenario_code)
        scenario_summaries.append(
            ScenarioProjectionSummary(
                scenario_code=scenario_code,
                scenario_name=_scenario_name(scenario_code),
                projected_1y_price_psf=round(
                    base.current_fair_price_psf * ((1 + growth_rate) ** 1),
                    2,
                ),
                projected_3y_price_psf=round(
                    base.current_fair_price_psf * ((1 + growth_rate) ** 3),
                    2,
                ),
                projected_5y_price_psf=round(
                    base.current_fair_price_psf * ((1 + growth_rate) ** 5),
                    2,
                ),
                annualized_growth_pct=round(growth_rate * 100, 2),
            )
        )

    selected_growth_summary = (
        f"For the {_scenario_name(payload.scenario_code).lower()} scenario, the model "
        f"estimates an annualized forward growth rate of {selected_growth_rate * 100:.2f}% "
        f"from the current fair asking price baseline."
    )

    sensitivity_scenarios, top_sensitivity_driver = _build_sensitivity_scenarios(
        payload,
        base,
    )

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