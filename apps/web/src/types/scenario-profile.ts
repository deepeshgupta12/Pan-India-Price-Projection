export type ScenarioProfile = {
  id: number;
  scenario_code: string;
  scenario_name: string;
  description: string | null;
  market_cagr: number | null;
  supply_stress_adjustment: number | null;
  infra_realization_adjustment: number | null;
  affordability_drag_adjustment: number | null;
  developer_premium_drift: number | null;
  risk_drag_adjustment: number | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};