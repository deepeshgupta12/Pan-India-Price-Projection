from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DeveloperResponse(BaseModel):
    id: int
    developer_code: str
    developer_name: str
    city_presence_count: int | None
    completed_projects_count: int | None
    under_construction_count: int | None
    avg_delivery_delay_months: float | None
    on_time_delivery_score: float | None
    brand_score: float | None
    quality_score: float | None
    litigation_risk_score: float | None
    consumer_sentiment_score: float | None
    premium_index_vs_market: float | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)