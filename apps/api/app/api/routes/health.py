from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


class TableStatus(BaseModel):
    table: str
    row_count: int


class SeedStatusResponse(BaseModel):
    seed_loaded: bool
    tables: list[TableStatus]


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        environment=settings.app_env,
        version=settings.app_version,
        api_prefix=settings.api_v1_prefix,
    )


@router.get("/seed-status", response_model=SeedStatusResponse, summary="Seed data status")
def seed_status(db: DbSession) -> SeedStatusResponse:
    """Returns the row count for each seed table so clients can verify seed health."""
    tables_to_check = [
        "cities",
        "micromarkets",
        "localities",
        "developers",
        "projects",
        "variable_definitions",
        "infrastructure_records",
        "scenario_profiles",
    ]
    results: list[TableStatus] = []
    for table in tables_to_check:
        count = db.scalar(text(f"SELECT COUNT(*) FROM {table}")) or 0  # noqa: S608
        results.append(TableStatus(table=table, row_count=int(count)))

    seed_loaded = all(t.row_count > 0 for t in results)
    return SeedStatusResponse(seed_loaded=seed_loaded, tables=results)