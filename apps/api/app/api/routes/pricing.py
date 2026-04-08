from fastapi import APIRouter

from app.schemas.pricing import (
    PricingAnalysisInput,
    PricingAnalysisResponse,
    ProjectionAnalysisResponse,
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