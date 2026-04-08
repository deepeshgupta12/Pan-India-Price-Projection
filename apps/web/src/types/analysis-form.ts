export type AnalysisFormValues = {
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
};

export type AnalysisFieldConfig = {
  key: keyof AnalysisFormValues;
  label: string;
  placeholder: string;
  helpText: string;
  inputType?: "text" | "number" | "date";
  unit?: string;
};