from pydantic import BaseModel, Field


class PricingAnalysisInput(BaseModel):
    project_name: str = Field(default="")
    city_id: int | None = Field(default=None)
    micromarket_id: int | None = Field(default=None)
    locality_id: int | None = Field(default=None)
    project_stage: str = Field(default="")
    launch_date: str = Field(default="")
    expected_possession_date: str = Field(default="")

    total_land_acres: str = Field(default="")
    total_units: str = Field(default="")
    towers_count: str = Field(default="")
    floors_count: str = Field(default="")
    avg_unit_size_sqft: str = Field(default="")
    density_units_per_acre: str = Field(default="")
    parking_ratio: str = Field(default="")
    open_space_pct: str = Field(default="")
    amenity_score: str = Field(default="")
    construction_quality_score: str = Field(default="")
    legal_clarity_score: str = Field(default="")

    benchmark_current_asking_price: str = Field(default="")
    benchmark_radius_km: str = Field(default="")
    avg_rent: str = Field(default="")
    inventory_overhang_months: str = Field(default="")
    distance_to_metro_km: str = Field(default="")
    social_infra_score: str = Field(default="")

    scenario_code: str = Field(default="base")


class PricingFactorBreakdown(BaseModel):
    factor_name: str
    value: float
    explanation: str


class ProjectionPoint(BaseModel):
    label: str
    year: int
    projected_price_psf: float


class ScenarioProjectionSummary(BaseModel):
    scenario_code: str
    scenario_name: str
    projected_1y_price_psf: float
    projected_3y_price_psf: float
    projected_5y_price_psf: float
    annualized_growth_pct: float


class SensitivityScenario(BaseModel):
    variable_key: str
    variable_label: str
    downside_price_psf: float
    base_price_psf: float
    upside_price_psf: float
    downside_change_pct: float
    upside_change_pct: float
    interpretation: str


class ConfidenceExplanation(BaseModel):
    score: float
    label: str
    explanation: str


class PricingAnalysisResponse(BaseModel):
    project_name: str
    scenario_code: str
    benchmark_price_psf: float
    current_fair_price_psf: float
    lower_fair_price_psf: float
    upper_fair_price_psf: float
    premium_discount_vs_benchmark_pct: float
    confidence_score: float
    data_completeness_score: float
    factors: list[PricingFactorBreakdown]
    summary: str


class ProjectionAnalysisResponse(BaseModel):
    project_name: str
    scenario_code: str
    benchmark_price_psf: float
    current_fair_price_psf: float
    lower_fair_price_psf: float
    upper_fair_price_psf: float
    premium_discount_vs_benchmark_pct: float
    confidence_score: float
    data_completeness_score: float
    factors: list[PricingFactorBreakdown]
    summary: str
    selected_scenario_projection_points: list[ProjectionPoint]
    scenario_comparison: list[ScenarioProjectionSummary]
    selected_scenario_growth_summary: str
    interpretation_bullets: list[str]
    risk_flags: list[str]
    confidence_explanation: ConfidenceExplanation
    sensitivity_scenarios: list[SensitivityScenario]
    top_sensitivity_driver: str