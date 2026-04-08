from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ScenarioProfileResponse(BaseModel):
    id: int
    scenario_code: str
    scenario_name: str
    description: str | None
    market_cagr: float | None
    supply_stress_adjustment: float | None
    infra_realization_adjustment: float | None
    affordability_drag_adjustment: float | None
    developer_premium_drift: float | None
    risk_drag_adjustment: float | None
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)