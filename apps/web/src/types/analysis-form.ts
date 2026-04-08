export type AnalysisFormValues = {
  // ── Project basics ────────────────────────────────────────────────────────
  project_name: string;
  city_id: number | null;
  micromarket_id: number | null;
  locality_id: number | null;
  project_stage: string;
  rera_status: string;
  launch_date: string;
  expected_possession_date: string;
  total_units: string;

  // ── Product configuration ─────────────────────────────────────────────────
  total_land_acres: string;
  towers_count: string;
  floors_count: string;
  avg_unit_size_sqft: string;
  density_units_per_acre: string;
  parking_ratio: string;
  open_space_pct: string;
  amenity_score: string;
  construction_quality_score: string;
  legal_clarity_score: string;

  // ── Market benchmark context ──────────────────────────────────────────────
  benchmark_current_asking_price: string;
  benchmark_radius_km: string;
  comparable_sold_psf: string;
  avg_rent: string;

  // ── Supply and demand ─────────────────────────────────────────────────────
  inventory_overhang_months: string;
  absorption_rate_pct: string;
  new_supply_upcoming_units: string;

  // ── Developer profile ─────────────────────────────────────────────────────
  developer_brand_score: string;
  developer_on_time_score: string;
  developer_litigation_score: string;

  // ── Macro inputs ──────────────────────────────────────────────────────────
  repo_rate_pct: string;
  inflation_rate_pct: string;
  gdp_growth_pct: string;

  // ── Connectivity ──────────────────────────────────────────────────────────
  distance_to_metro_km: string;
  distance_to_airport_km: string;
  distance_to_cbd_km: string;
  social_infra_score: string;

  // ── Infrastructure ────────────────────────────────────────────────────────
  infra_uplift_pct: string;

  // ── Scenario ──────────────────────────────────────────────────────────────
  scenario_code: string;
  custom_growth_rate_pct: string;
};

export type AnalysisFieldConfig = {
  key: keyof AnalysisFormValues;
  label: string;
  placeholder: string;
  helpText: string;
  inputType?: "text" | "number" | "date" | "select";
  unit?: string;
  min?: number;
  max?: number;
  required?: boolean;
  options?: string[];
};
