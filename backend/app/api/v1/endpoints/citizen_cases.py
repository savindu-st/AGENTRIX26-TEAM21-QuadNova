from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.citizen_case import CitizenCase
from app.schemas.citizen_case_schema import CitizenCaseCreate, CitizenCaseResponse, CitizenCaseUpdateStatus

router = APIRouter()

@router.post("", response_model=CitizenCaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CitizenCaseCreate, db: Session = Depends(get_db)):
    db_case = CitizenCase(
        citizen_name=case_in.citizen_name,
        district=case_in.district,
        description=case_in.description,
        user_id=case_in.user_id,
        status="Pending",
        visitguard_score=0,
        risk_level="Low"
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("", response_model=List[CitizenCaseResponse])
def get_cases(db: Session = Depends(get_db)):
    return db.query(CitizenCase).all()

@router.get("/{case_id}", response_model=CitizenCaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(CitizenCase).filter(CitizenCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case

@router.patch("/{case_id}/status", response_model=CitizenCaseResponse)
def update_case_status(case_id: int, status_in: CitizenCaseUpdateStatus, db: Session = Depends(get_db)):
    db_case = db.query(CitizenCase).filter(CitizenCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    db_case.status = status_in.status
    db.commit()
    db.refresh(db_case)
    return db_case
