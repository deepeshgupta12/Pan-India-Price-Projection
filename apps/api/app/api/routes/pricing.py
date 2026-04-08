from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from app.schemas.pricing import (
    PricingAnalysisInput,
    PricingAnalysisResponse,
    ProjectionAnalysisResponse,
    SaveAnalysisRequest,
    SavedAnalysisDetailResponse,
    SavedAnalysisListItem,
)
from app.services.analysis_store import (
    build_csv_content,
    get_saved_analysis,
    list_saved_analyses,
    save_analysis,
)
from app.services.pricing_engine import (
    compute_current_fair_price,
    compute_projection_analysis,
)

router = APIRouter()


@router.post(
    "/current-fair-price",
    response_model=PricingAnalysisResponse,
    summary="Run current fair price analysis",
)
def run_current_fair_price_analysis(
    payload: PricingAnalysisInput,
) -> PricingAnalysisResponse:
    return compute_current_fair_price(payload)


@router.post(
    "/projection-summary",
    response_model=ProjectionAnalysisResponse,
    summary="Run projection summary analysis",
)
def run_projection_summary_analysis(
    payload: PricingAnalysisInput,
) -> ProjectionAnalysisResponse:
    return compute_projection_analysis(payload)


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
) -> str:
    result = compute_projection_analysis(payload)
    return build_csv_content(result)