from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class InfrastructureRecordResponse(BaseModel):
    id: int
    infra_code: str
    infra_name: str
    infra_type: str
    city_id: int | None
    micromarket_id: int | None
    locality_id: int | None
    latitude: float | None
    longitude: float | None
    status: str
    planned_start_date: date | None
    expected_completion_date: date | None
    confidence_level: str | None
    source_name: str | None
    source_url: str | None
    distance_to_project_km: float | None
    type_weight: float | None
    status_weight: float | None
    probability_weight: float | None
    time_relevance_weight_1y: float | None
    time_relevance_weight_3y: float | None
    time_relevance_weight_5y: float | None
    estimated_uplift_min_pct: float | None
    estimated_uplift_max_pct: float | None
    remarks: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)