from fastapi import APIRouter
from app.api.v1.endpoints import (
    citizen_cases,
    services,
    ai,
    admin,
    crowd_reports
)

api_router = APIRouter()

api_router.include_router(citizen_cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(services.offices_router, prefix="/offices", tags=["offices"])
api_router.include_router(services.officers_router, prefix="/officers", tags=["officers"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(crowd_reports.router, prefix="/crowd-reports", tags=["crowd-reports"])
