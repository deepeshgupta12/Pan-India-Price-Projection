from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.pricing import (
    PricingAnalysisInput,
    PricingAnalysisResponse,
    ProjectionAnalysisResponse,
    SaveAnalysisRequest,
    SavedAnalysisDetailResponse,
    SavedAnalysisListItem,
    SensitivityScenario,
    StandaloneSensitivityRequest,
)
from app.services.analysis_store import (
    build_csv_content,
    get_saved_analysis,
    list_saved_analyses,
    save_analysis,
)
from app.services.pricing_engine import (
    _build_sensitivity_scenarios,
    _compute_base_pricing,
    compute_current_fair_price,
    compute_projection_analysis,
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _inject_scenario_profile(
    payload: PricingAnalysisInput,
    db: Session,
) -> PricingAnalysisInput:
    """
    Look up the ScenarioProfile for payload.scenario_code and inject all its
    numeric fields into the payload so the engine is fully data-driven.
    """
    from app.models.scenario_profile import ScenarioProfile

    profile = (
        db.query(ScenarioProfile)
        .filter(
            ScenarioProfile.scenario_code == payload.scenario_code.lower(),
            ScenarioProfile.is_active.is_(True),
        )
        .first()
    )
    if profile is None:
        # Fallback to base if the requested scenario is missing
        profile = (
            db.query(ScenarioProfile)
            .filter(
                ScenarioProfile.scenario_code == "base",
                ScenarioProfile.is_active.is_(True),
            )
            .first()
        )

    if profile is None:
        return payload  # no scenario data at all; engine uses internal defaults

    return payload.model_copy(
        update={
            "scenario_market_cagr": float(profile.market_cagr),
            "scenario_supply_stress_adjustment": float(profile.supply_stress_adjustment),
            "scenario_infra_realization_adjustment": float(profile.infra_realization_adjustment),
            "scenario_affordability_drag_adjustment": float(profile.affordability_drag_adjustment),
            "scenario_developer_premium_drift": float(profile.developer_premium_drift),
            "scenario_risk_drag_adjustment": float(profile.risk_drag_adjustment),
        }
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/current-fair-price",
    response_model=PricingAnalysisResponse,
    summary="Run current fair price analysis",
)
def run_current_fair_price_analysis(
    payload: PricingAnalysisInput,
    db: Session = Depends(get_db),
) -> PricingAnalysisResponse:
    enriched = _inject_scenario_profile(payload, db)
    return compute_current_fair_price(enriched)


@router.post(
    "/projection-summary",
    response_model=ProjectionAnalysisResponse,
    summary="Run projection summary analysis",
)
def run_projection_summary_analysis(
    payload: PricingAnalysisInput,
    db: Session = Depends(get_db),
) -> ProjectionAnalysisResponse:
    enriched = _inject_scenario_profile(payload, db)
    return compute_projection_analysis(enriched)


@router.post(
    "/sensitivity",
    response_model=list[SensitivityScenario],
    summary="Run standalone sensitivity analysis",
)
def run_standalone_sensitivity(
    body: StandaloneSensitivityRequest,
    db: Session = Depends(get_db),
) -> list[SensitivityScenario]:
    enriched = _inject_scenario_profile(body.input, db)
    base = _compute_base_pricing(enriched)
    scenarios, _ = _build_sensitivity_scenarios(enriched, base)
    return scenarios


@router.post(
    "/save-analysis",
    response_model=SavedAnalysisDetailResponse,
    summary="Save projection analysis",
)
def save_projection_analysis(
    payload: SaveAnalysisRequest,
) -> SavedAnalysisDetailResponse:
    return save_analysis(payload)


@router.get(
    "/saved-analyses",
    response_model=list[SavedAnalysisListItem],
    summary="List saved analyses",
)
def list_projection_analyses() -> list[SavedAnalysisListItem]:
    return list_saved_analyses()


@router.get(
    "/saved-analyses/{analysis_id}",
    response_model=SavedAnalysisDetailResponse,
    summary="Get saved analysis detail",
)
def get_projection_analysis(analysis_id: str) -> SavedAnalysisDetailResponse:
    analysis = get_saved_analysis(analysis_id)
    if analysis is None:
        raise HTTPException(status_code=404, detail="Saved analysis not found")
    return analysis


@router.post(
    "/export-csv",
    response_class=PlainTextResponse,
    summary="Export projection analysis as CSV text",
)
def export_projection_analysis_csv(
    payload: PricingAnalysisInput,
    db: Session = Depends(get_db),
) -> str:
    enriched = _inject_scenario_profile(payload, db)
    result = compute_projection_analysis(enriched)
    return build_csv_content(result)
