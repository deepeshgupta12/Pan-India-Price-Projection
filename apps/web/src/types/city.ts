export type City = {
  id: number;
  city_code: string;
  city_name: string;
  state_name: string;
  zone: string | null;
  tier: string | null;
  demand_index: number | null;
  affordability_index: number | null;
  macro_growth_index: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};