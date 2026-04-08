from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CityResponse(BaseModel):
    id: int
    city_code: str
    city_name: str
    state_name: str
    zone: str | None
    tier: str | None
    demand_index: float | None
    affordability_index: float | None
    macro_growth_index: float | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)