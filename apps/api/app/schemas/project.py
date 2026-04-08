from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ProjectResponse(BaseModel):
    id: int
    project_code: str
    project_name: str
    developer_id: int | None
    city_id: int
    micromarket_id: int | None
    locality_id: int | None
    address_text: str | None
    asset_class: str | None
    project_stage: str | None
    launch_date: date | None
    expected_possession_date: date | None
    total_land_acres: float | None
    total_units: int | None
    towers_count: int | None
    floors_count: int | None
    unit_mix_summary: dict | list | None
    avg_unit_size_sqft: float | None
    density_units_per_acre: float | None
    parking_ratio: float | None
    open_space_pct: float | None
    amenity_score: float | None
    construction_quality_score: float | None
    legal_clarity_score: float | None
    rera_status: str | None
    benchmark_current_asking_price: float | None
    benchmark_radius_km: float | None
    source: str | None
    last_data_refreshed_at: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)