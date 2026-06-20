from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from backend.app.database.db import get_db
from backend.app.models.crowd_report import CrowdReport
from backend.app.models.trusted_source import TrustedSource
from backend.app.schemas.crowd_report_schema import (
    CrowdReportCreate, CrowdReportResponse, CrowdReportVerify
)

crowd_reports_router = APIRouter()

@crowd_reports_router.post("/", response_model=CrowdReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(report_in: CrowdReportCreate, db: Session = Depends(get_db)):
    # Verify office exists if office_id is provided
    if report_in.office_id:
        office = db.query(TrustedSource).filter(
            TrustedSource.id == report_in.office_id,
            TrustedSource.source_type == "office"
        ).first()
        if not office:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Office with ID {report_in.office_id} not found"
            )

    # Build a rich report_text from structured payload if provided
    if report_in.office or report_in.comments:
        structured = {
            "office": report_in.office or "",
            "counter": report_in.counter or "",
            "friction_tags": report_in.friction_tags or [],
            "comments": report_in.comments or "",
        }
        report_text = json.dumps(structured)
    else:
        report_text = report_in.report_text or ""

    db_report = CrowdReport(
        case_id=report_in.case_id,
        office_id=report_in.office_id,
        report_text=report_text,
        verification_status="Pending"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report



@crowd_reports_router.get("/", response_model=List[CrowdReportResponse])
def get_reports(db: Session = Depends(get_db)):
    return db.query(CrowdReport).all()


@crowd_reports_router.patch("/{report_id}/verify", response_model=CrowdReportResponse)
def verify_report(report_id: int, verify_in: CrowdReportVerify, db: Session = Depends(get_db)):
    db_report = db.query(CrowdReport).filter(CrowdReport.id == report_id).first()
    if not db_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crowd report with ID {report_id} not found"
        )
    db_report.verification_status = verify_in.verification_status
    db.commit()
    db.refresh(db_report)
    return db_report
