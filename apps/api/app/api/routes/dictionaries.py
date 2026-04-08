from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.city import City
from app.models.developer import Developer
from app.models.infrastructure_record import InfrastructureRecord
from app.models.locality import Locality
from app.models.micromarket import Micromarket
from app.models.project import Project
from app.models.scenario_profile import ScenarioProfile
from app.models.variable_definition import VariableDefinition
from app.schemas.city import CityResponse
from app.schemas.developer import DeveloperResponse
from app.schemas.infrastructure_record import InfrastructureRecordResponse
from app.schemas.locality import LocalityResponse
from app.schemas.micromarket import MicromarketResponse
from app.schemas.project import ProjectResponse
from app.schemas.scenario_profile import ScenarioProfileResponse
from app.schemas.variable_definition import VariableDefinitionResponse

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/cities", response_model=list[CityResponse], summary="List cities")
def list_cities(
    db: DbSession,
    active_only: bool = Query(default=True),
) -> list[City]:
    query = select(City).order_by(City.city_name.asc())

    if active_only:
        query = query.where(City.is_active.is_(True))

    return list(db.scalars(query).all())


@router.get(
    "/micromarkets",
    response_model=list[MicromarketResponse],
    summary="List micromarkets",
)
def list_micromarkets(
    db: DbSession,
    city_id: int | None = Query(default=None),
    active_only: bool = Query(default=True),
) -> list[Micromarket]:
    query = select(Micromarket).order_by(Micromarket.micromarket_name.asc())

    if city_id is not None:
        query = query.where(Micromarket.city_id == city_id)

    if active_only:
        query = query.where(Micromarket.is_active.is_(True))

    return list(db.scalars(query).all())


@router.get(
    "/localities",
    response_model=list[LocalityResponse],
    summary="List localities",
)
def list_localities(
    db: DbSession,
    city_id: int | None = Query(default=None),
    micromarket_id: int | None = Query(default=None),
    active_only: bool = Query(default=True),
) -> list[Locality]:
    query = select(Locality).order_by(Locality.locality_name.asc())

    if city_id is not None:
        query = query.where(Locality.city_id == city_id)

    if micromarket_id is not None:
        query = query.where(Locality.micromarket_id == micromarket_id)

    if active_only:
        query = query.where(Locality.is_active.is_(True))

    return list(db.scalars(query).all())


@router.get(
    "/developers",
    response_model=list[DeveloperResponse],
    summary="List developers",
)
def list_developers(
    db: DbSession,
    active_only: bool = Query(default=True),
) -> list[Developer]:
    query = select(Developer).order_by(Developer.developer_name.asc())

    if active_only:
        query = query.where(Developer.is_active.is_(True))

    return list(db.scalars(query).all())


@router.get(
    "/projects",
    response_model=list[ProjectResponse],
    summary="List or search projects",
)
def list_projects(
    db: DbSession,
    q: str | None = Query(default=None, description="Project search query"),
    city_id: int | None = Query(default=None),
    micromarket_id: int | None = Query(default=None),
    locality_id: int | None = Query(default=None),
    developer_id: int | None = Query(default=None),
    active_only: bool = Query(default=True),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[Project]:
    query = select(Project).order_by(Project.project_name.asc())

    if q:
        search_term = f"%{q.strip()}%"
        query = query.where(Project.project_name.ilike(search_term))

    if city_id is not None:
        query = query.where(Project.city_id == city_id)

    if micromarket_id is not None:
        query = query.where(Project.micromarket_id == micromarket_id)

    if locality_id is not None:
        query = query.where(Project.locality_id == locality_id)

    if developer_id is not None:
        query = query.where(Project.developer_id == developer_id)

    if active_only:
        query = query.where(Project.is_active.is_(True))

    query = query.limit(limit)

    return list(db.scalars(query).all())


@router.get(
    "/variable-definitions",
    response_model=list[VariableDefinitionResponse],
    summary="List variable definitions",
)
def list_variable_definitions(
    db: DbSession,
    category: str | None = Query(default=None),
    active_only: bool = Query(default=True),
) -> list[VariableDefinition]:
    query = select(VariableDefinition).order_by(
        VariableDefinition.sort_order.asc(),
        VariableDefinition.display_name.asc(),
    )

    if category:
        query = query.where(VariableDefinition.category == category)

    if active_only:
        query = query.where(VariableDefinition.is_active.is_(True))

    return list(db.scalars(query).all())


@router.get(
    "/infrastructure-records",
    response_model=list[InfrastructureRecordResponse],
    summary="List infrastructure records",
)
def list_infrastructure_records(
    db: DbSession,
    city_id: int | None = Query(default=None),
    micromarket_id: int | None = Query(default=None),
    locality_id: int | None = Query(default=None),
    infra_type: str | None = Query(default=None),
    active_only: bool = Query(default=True),
) -> list[InfrastructureRecord]:
    query = select(InfrastructureRecord).order_by(InfrastructureRecord.infra_name.asc())

    if city_id is not None:
        query = query.where(InfrastructureRecord.city_id == city_id)

    if micromarket_id is not None:
        query = query.where(InfrastructureRecord.micromarket_id == micromarket_id)

    if locality_id is not None:
        query = query.where(InfrastructureRecord.locality_id == locality_id)

    if infra_type:
        query = query.where(InfrastructureRecord.infra_type == infra_type)

    if active_only:
        query = query.where(InfrastructureRecord.is_active.is_(True))

    return list(db.scalars(query).all())


@router.get(
    "/scenario-profiles",
    response_model=list[ScenarioProfileResponse],
    summary="List scenario profiles",
)
def list_scenario_profiles(
    db: DbSession,
    active_only: bool = Query(default=True),
) -> list[ScenarioProfile]:
    query = select(ScenarioProfile).order_by(ScenarioProfile.id.asc())

    if active_only:
        query = query.where(ScenarioProfile.is_active.is_(True))

    return list(db.scalars(query).all())