from fastapi import APIRouter

from app.schemas.pricing import PricingAnalysisInput, PricingAnalysisResponse
from app.services.pricing_engine import compute_current_fair_price

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