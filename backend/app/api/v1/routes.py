from fastapi import APIRouter
from backend.app.api.v1.endpoints.citizen_cases import cases_router
from backend.app.api.v1.endpoints.ai import ai_router
from backend.app.api.v1.endpoints.services import services_router, offices_router, officers_router
from backend.app.api.v1.endpoints.crowd_reports import crowd_reports_router
from backend.app.api.v1.endpoints.admin import admin_router
from backend.app.api.v1.endpoints.auth import auth_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(cases_router, prefix="/cases", tags=["cases"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(services_router, prefix="/services", tags=["services"])
api_router.include_router(offices_router, prefix="/offices", tags=["offices"])
api_router.include_router(officers_router, prefix="/officers", tags=["officers"])
api_router.include_router(crowd_reports_router, prefix="/crowd-reports", tags=["crowd-reports"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])

