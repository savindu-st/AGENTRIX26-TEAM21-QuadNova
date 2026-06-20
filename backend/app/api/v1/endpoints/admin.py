from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.db import get_db
from app.models.citizen_case import CitizenCase
from app.models.crowd_report import CrowdReport

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_cases = db.query(CitizenCase).count()
    high_risk_cases = db.query(CitizenCase).filter(CitizenCase.risk_level == "High").count()
    pending_cases = db.query(CitizenCase).filter(CitizenCase.status == "Pending").count()
    verified_crowd_reports = db.query(CrowdReport).filter(CrowdReport.verification_status == "Verified").count()
    
    most_requested = db.query(
        CitizenCase.detected_service, 
        func.count(CitizenCase.detected_service)
    ).filter(CitizenCase.detected_service.isnot(None))\
     .group_by(CitizenCase.detected_service)\
     .order_by(func.count(CitizenCase.detected_service).desc())\
     .first()
     
    most_requested_service = most_requested[0] if most_requested else "None"
    
    return {
        "total_cases": total_cases,
        "high_risk_cases": high_risk_cases,
        "pending_cases": pending_cases,
        "verified_crowd_reports": verified_crowd_reports,
        "most_requested_service": most_requested_service
    }
