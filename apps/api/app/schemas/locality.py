from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LocalityResponse(BaseModel):
    id: int
    locality_code: str
    locality_name: str
    city_id: int
    micromarket_id: int
    avg_price: float | None
    avg_rent: float | None
    search_demand_index: float | None
    livability_index: float | None
    social_infra_index: float | None
    connectivity_index: float | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)