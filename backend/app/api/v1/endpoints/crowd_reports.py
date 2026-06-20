from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.crowd_report import CrowdReport
from app.schemas.crowd_report_schema import CrowdReportCreate, CrowdReportResponse, CrowdReportVerify

router = APIRouter()

@router.post("", response_model=CrowdReportResponse, status_code=status.HTTP_201_CREATED)
def create_crowd_report(report_in: CrowdReportCreate, db: Session = Depends(get_db)):
    db_report = CrowdReport(
        case_id=report_in.case_id,
        area_id=report_in.area_id,
        office_name=report_in.office_name,
        report_text=report_in.report_text,
        verification_status="Pending",
        upvotes=0
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("", response_model=List[CrowdReportResponse])
def get_crowd_reports(db: Session = Depends(get_db)):
    return db.query(CrowdReport).all()

@router.patch("/{report_id}/verify", response_model=CrowdReportResponse)
def verify_crowd_report(report_id: int, verify_in: CrowdReportVerify, db: Session = Depends(get_db)):
    db_report = db.query(CrowdReport).filter(CrowdReport.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Crowd report not found")
    db_report.verification_status = verify_in.verification_status
    db.commit()
    db.refresh(db_report)
    return db_report
