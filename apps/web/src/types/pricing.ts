export type PricingFactorBreakdown = {
  factor_name: string;
  value: number;
  explanation: string;
};

export type ProjectionPoint = {
  label: string;
  year: number;
  projected_price_psf: number;
};

export type ScenarioProjectionSummary = {
  scenario_code: string;
  scenario_name: string;
  projected_1y_price_psf: number;
  projected_3y_price_psf: number;
  projected_5y_price_psf: number;
  annualized_growth_pct: number;
};

export type SensitivityScenario = {
  variable_key: string;
  variable_label: string;
  downside_price_psf: number;
  base_price_psf: number;
  upside_price_psf: number;
  downside_change_pct: number;
  upside_change_pct: number;
  interpretation: string;
};

export type ConfidenceExplanation = {
  score: number;
  label: string;
  explanation: string;
};

export type PricingAnalysisRequest = {
  project_name: string;
  city_id: number | null;
  micromarket_id: number | null;
  locality_id: number | null;
  project_stage: string;
  launch_date: string;
  expected_possession_date: string;
  total_land_acres: string;
  total_units: string;
  towers_count: string;
  floors_count: string;
  avg_unit_size_sqft: string;
  density_units_per_acre: string;
  parking_ratio: string;
  open_space_pct: string;
  amenity_score: string;
  construction_quality_score: string;
  legal_clarity_score: string;
  benchmark_current_asking_price: string;
  benchmark_radius_km: string;
  avg_rent: string;
  inventory_overhang_months: string;
  distance_to_metro_km: string;
  social_infra_score: string;
  scenario_code: string;
};

export type PricingAnalysisResponse = {
  project_name: string;
  scenario_code: string;
  benchmark_price_psf: number;
  current_fair_price_psf: number;
  lower_fair_price_psf: number;
  upper_fair_price_psf: number;
  premium_discount_vs_benchmark_pct: number;
  confidence_score: number;
  data_completeness_score: number;
  factors: PricingFactorBreakdown[];
  summary: string;
};

export type ProjectionAnalysisResponse = {
  project_name: string;
  scenario_code: string;
  benchmark_price_psf: number;
  current_fair_price_psf: number;
  lower_fair_price_psf: number;
  upper_fair_price_psf: number;
  premium_discount_vs_benchmark_pct: number;
  confidence_score: number;
  data_completeness_score: number;
  factors: PricingFactorBreakdown[];
  summary: string;
  selected_scenario_projection_points: ProjectionPoint[];
  scenario_comparison: ScenarioProjectionSummary[];
  selected_scenario_growth_summary: string;
  interpretation_bullets: string[];
  risk_flags: string[];
  confidence_explanation: ConfidenceExplanation;
  sensitivity_scenarios: SensitivityScenario[];
  top_sensitivity_driver: string;
};