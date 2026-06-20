from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from backend.app.database.db import get_db
from backend.app.models.citizen_case import CitizenCase
from backend.app.models.crowd_report import CrowdReport
from backend.app.models.trusted_source import TrustedSource

admin_router = APIRouter()

@admin_router.get("/stats")
def get_dashboard_stats(
    district: Optional[str] = Query(None, description="Filter by district/city"),
    db: Session = Depends(get_db)
):
    q = db.query(CitizenCase)
    if district:
        q = q.filter(CitizenCase.district == district)

    total_cases = q.count()
    high_risk   = q.filter(CitizenCase.risk_level == "High Risk").count()
    pending     = q.filter(CitizenCase.status != "resolved").count()

    # Crowd reports — join via office district
    rq = db.query(CrowdReport)
    if district:
        rq = rq.join(TrustedSource, CrowdReport.office_id == TrustedSource.id, isouter=True)\
               .filter(TrustedSource.district == district)
    verified_reports = rq.filter(CrowdReport.verification_status == "Verified").count()

    # Most requested service (district-filtered)
    most_req = q.with_entities(
        CitizenCase.detected_service,
        func.count(CitizenCase.detected_service).label("cnt")
    ).group_by(CitizenCase.detected_service)\
     .order_by(func.count(CitizenCase.detected_service).desc()).first()

    most_requested = most_req[0] if most_req and most_req[0] else "Passport Application"

    # Risk Distribution for pie chart
    risk_dist = q.with_entities(
        CitizenCase.risk_level,
        func.count(CitizenCase.risk_level).label("value")
    ).group_by(CitizenCase.risk_level).all()
    risk_data = [{"name": r[0] or "Unknown", "value": r[1]} for r in risk_dist]

    # Status Distribution for bar chart
    status_dist = q.with_entities(
        CitizenCase.status,
        func.count(CitizenCase.status).label("value")
    ).group_by(CitizenCase.status).all()
    status_data = [{"name": s[0] or "Unknown", "value": s[1]} for s in status_dist]

    return {
        "total_cases": total_cases,
        "high_risk_cases": high_risk,
        "pending_cases": pending,
        "verified_reports": verified_reports,
        "most_requested_service": most_requested,
        "district": district or "All Districts",
        "chart_data": {
            "risk_distribution": risk_data,
            "status_distribution": status_data
        }
    }

