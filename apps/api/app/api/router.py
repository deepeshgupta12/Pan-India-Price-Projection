from fastapi import APIRouter

from app.api.routes.dictionaries import router as dictionaries_router
from app.api.routes.health import router as health_router
from app.api.routes.pricing import router as pricing_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(
    dictionaries_router,
    prefix="/dictionaries",
    tags=["Dictionaries"],
)
api_router.include_router(
    pricing_router,
    prefix="/pricing",
    tags=["Pricing"],
)