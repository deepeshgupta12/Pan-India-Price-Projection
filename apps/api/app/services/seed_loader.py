import json
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.city import City
from app.models.developer import Developer
from app.models.infrastructure_record import InfrastructureRecord
from app.models.locality import Locality
from app.models.micromarket import Micromarket
from app.models.project import Project
from app.models.scenario_profile import ScenarioProfile
from app.models.variable_definition import VariableDefinition


REPO_ROOT = Path(__file__).resolve().parents[4]
SEED_DIR = REPO_ROOT / "data" / "seeds"


def _read_seed_file(filename: str) -> list[dict[str, Any]]:
    file_path = SEED_DIR / filename
    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def _table_has_rows(db: Session, model: type) -> bool:
    return db.scalar(select(model.id).limit(1)) is not None


def _insert_records(db: Session, model: type, filename: str) -> None:
    records = _read_seed_file(filename)
    for record in records:
        db.add(model(**record))


def seed_database(db: Session) -> None:
    seed_plan: list[tuple[type, str]] = [
        (City, "cities.json"),
        (Micromarket, "micromarkets.json"),
        (Locality, "localities.json"),
        (Developer, "developers.json"),
        (Project, "projects.json"),
        (VariableDefinition, "variable_definitions.json"),
        (InfrastructureRecord, "infrastructure_records.json"),
        (ScenarioProfile, "scenario_profiles.json"),
    ]

    for model, filename in seed_plan:
        if _table_has_rows(db, model):
            continue
        _insert_records(db, model, filename)

    db.commit()