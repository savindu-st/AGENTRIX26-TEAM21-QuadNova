from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.db import get_db
from backend.app.models.citizen_case import CitizenCase
from backend.app.models.crowd_report import CrowdReport

admin_router = APIRouter()

@admin_router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_cases = db.query(CitizenCase).count()
    high_risk_cases = db.query(CitizenCase).filter(CitizenCase.risk_level == "High Risk").count()
    pending_cases = db.query(CitizenCase).filter(CitizenCase.status != "resolved").count()
    verified_reports = db.query(CrowdReport).filter(CrowdReport.verification_status == "Verified").count()
    
    # Most requested service
    most_requested = "None"
    most_req_query = db.query(
        CitizenCase.detected_service, 
        func.count(CitizenCase.detected_service).label("cnt")
    ).group_by(CitizenCase.detected_service).order_by(func.count(CitizenCase.detected_service).desc()).first()
    
    if most_req_query and most_req_query[0]:
        most_requested = most_req_query[0]
    else:
        most_requested = "Passport Application"
        
    return {
        "total_cases": total_cases,
        "high_risk_cases": high_risk_cases,
        "pending_cases": pending_cases,
        "verified_reports": verified_reports,
        "most_requested_service": most_requested
    }
