from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.schemas.pricing import (
    ProjectionAnalysisResponse,
    SaveAnalysisRequest,
    SavedAnalysisDetailResponse,
    SavedAnalysisListItem,
)


REPO_ROOT = Path(__file__).resolve().parents[4]
STORE_DIR = REPO_ROOT / "data" / "saved_analyses"
STORE_FILE = STORE_DIR / "saved_analyses.json"


def _ensure_store() -> None:
    STORE_DIR.mkdir(parents=True, exist_ok=True)
    if not STORE_FILE.exists():
        STORE_FILE.write_text("[]", encoding="utf-8")


def _read_records() -> list[dict[str, Any]]:
    _ensure_store()
    with STORE_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)
        return data if isinstance(data, list) else []


def _write_records(records: list[dict[str, Any]]) -> None:
    _ensure_store()
    with STORE_FILE.open("w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)


def save_analysis(payload: SaveAnalysisRequest) -> SavedAnalysisDetailResponse:
    records = _read_records()
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "analysis_id": str(uuid4()),
        "analysis_name": payload.analysis_name.strip(),
        "project_name": payload.result.project_name,
        "scenario_code": payload.result.scenario_code,
        "created_at": now,
        "updated_at": now,
        "result": payload.result.model_dump(),
    }

    records.insert(0, record)
    _write_records(records)

    return SavedAnalysisDetailResponse(**record)


def list_saved_analyses() -> list[SavedAnalysisListItem]:
    records = _read_records()
    items: list[SavedAnalysisListItem] = []

    for record in records:
        items.append(
            SavedAnalysisListItem(
                analysis_id=record["analysis_id"],
                analysis_name=record["analysis_name"],
                project_name=record["project_name"],
                scenario_code=record["scenario_code"],
                created_at=record["created_at"],
                updated_at=record["updated_at"],
            )
        )

    return items


def get_saved_analysis(analysis_id: str) -> SavedAnalysisDetailResponse | None:
    records = _read_records()

    for record in records:
        if record["analysis_id"] == analysis_id:
            return SavedAnalysisDetailResponse(**record)

    return None


def _result_to_csv_rows(result: ProjectionAnalysisResponse) -> list[list[str]]:
    rows: list[list[str]] = [
        ["Field", "Value"],
        ["Project name", result.project_name],
        ["Scenario code", result.scenario_code],
        ["Benchmark price psf", f"{result.benchmark_price_psf}"],
        ["Current fair price psf", f"{result.current_fair_price_psf}"],
        ["Lower fair price psf", f"{result.lower_fair_price_psf}"],
        ["Upper fair price psf", f"{result.upper_fair_price_psf}"],
        [
            "Premium discount vs benchmark pct",
            f"{result.premium_discount_vs_benchmark_pct}",
        ],
        ["Confidence score", f"{result.confidence_score}"],
        ["Data completeness score", f"{result.data_completeness_score}"],
        ["Summary", result.summary],
        ["Top sensitivity driver", result.top_sensitivity_driver],
        ["Selected scenario growth summary", result.selected_scenario_growth_summary],
        ["", ""],
        ["Factor", "Value %"],
    ]

    for factor in result.factors:
        rows.append([factor.factor_name, f"{factor.value}"])

    rows.extend(
        [
            ["", ""],
            ["Projection Label", "Projected Price PSF"],
        ]
    )

    for point in result.selected_scenario_projection_points:
        rows.append([point.label, f"{point.projected_price_psf}"])

    rows.extend(
        [
            ["", ""],
            ["Scenario", "1Y / 3Y / 5Y / Annualized Growth %"],
        ]
    )

    for scenario in result.scenario_comparison:
        rows.append(
            [
                scenario.scenario_name,
                (
                    f"{scenario.projected_1y_price_psf} / "
                    f"{scenario.projected_3y_price_psf} / "
                    f"{scenario.projected_5y_price_psf} / "
                    f"{scenario.annualized_growth_pct}"
                ),
            ]
        )

    rows.extend(
        [
            ["", ""],
            ["Sensitivity Variable", "Downside / Base / Upside"],
        ]
    )

    for sensitivity in result.sensitivity_scenarios:
        rows.append(
            [
                sensitivity.variable_label,
                (
                    f"{sensitivity.downside_price_psf} / "
                    f"{sensitivity.base_price_psf} / "
                    f"{sensitivity.upside_price_psf}"
                ),
            ]
        )

    return rows


def build_csv_content(result: ProjectionAnalysisResponse) -> str:
    rows = _result_to_csv_rows(result)
    escaped_rows: list[str] = []

    for row in rows:
        escaped_cells: list[str] = []
        for cell in row:
            normalized = cell.replace('"', '""')
            escaped_cells.append(f'"{normalized}"')
        escaped_rows.append(",".join(escaped_cells))

    return "\n".join(escaped_rows)