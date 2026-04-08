from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MicromarketResponse(BaseModel):
    id: int
    micromarket_code: str
    micromarket_name: str
    city_id: int
    market_type: str | None
    avg_price: float | None
    avg_rent: float | None
    inventory_overhang_months: float | None
    absorption_index: float | None
    future_supply_index: float | None
    infra_momentum_index: float | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)