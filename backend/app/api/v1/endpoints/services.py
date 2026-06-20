from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.database.db import get_db
from app.models.trusted_source import TrustedSource
from app.schemas import (
    ServiceCreate, ServiceResponse,
    OfficeCreate, OfficeResponse,
    OfficerCreate, OfficerResponse
)

# Services router
router = APIRouter()

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(service_in: ServiceCreate, db: Session = Depends(get_db)):
    db_service = TrustedSource(
        title=service_in.name,
        content=service_in.description,
        source_type="service",
        category=service_in.category,
        fee=service_in.fee,
        processing_time=service_in.processing_time,
        required_documents=json.dumps(service_in.required_documents)
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    
    return ServiceResponse(
        id=db_service.id,
        name=db_service.title,
        category=db_service.category or "",
        description=db_service.content,
        fee=db_service.fee,
        processing_time=db_service.processing_time or "",
        required_documents=json.loads(db_service.required_documents) if db_service.required_documents else []
    )

@router.get("", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    db_services = db.query(TrustedSource).filter(TrustedSource.source_type == "service").all()
    results = []
    for s in db_services:
        try:
            req_docs = json.loads(s.required_documents) if s.required_documents else []
        except Exception:
            req_docs = []
        results.append(
            ServiceResponse(
                id=s.id,
                name=s.title,
                category=s.category or "",
                description=s.content,
                fee=s.fee,
                processing_time=s.processing_time or "",
                required_documents=req_docs
            )
        )
    return results


# Offices router
offices_router = APIRouter()

@offices_router.post("", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
def create_office(office_in: OfficeCreate, db: Session = Depends(get_db)):
    db_office = TrustedSource(
        title=office_in.name,
        content=office_in.notes or "Local office guidelines",
        source_type="office",
        category=office_in.district,
        office_type=office_in.office_type,
        address=office_in.address
    )
    db.add(db_office)
    db.commit()
    db.refresh(db_office)
    
    return OfficeResponse(
        id=db_office.id,
        name=db_office.title,
        district=db_office.category or "",
        office_type=db_office.office_type or "",
        address=db_office.address or "",
        notes=db_office.content
    )

@offices_router.get("", response_model=List[OfficeResponse])
def get_offices(db: Session = Depends(get_db)):
    db_offices = db.query(TrustedSource).filter(TrustedSource.source_type == "office").all()
    results = []
    for o in db_offices:
        results.append(
            OfficeResponse(
                id=o.id,
                name=o.title,
                district=o.category or "",
                office_type=o.office_type or "",
                address=o.address or "",
                notes=o.content
            )
        )
    return results


# Officers router
officers_router = APIRouter()

@officers_router.post("", response_model=OfficerResponse, status_code=status.HTTP_201_CREATED)
def create_officer(officer_in: OfficerCreate, db: Session = Depends(get_db)):
    db_officer = TrustedSource(
        title=officer_in.officer_name,
        content="Office staff member availability",
        source_type="officer",
        category=officer_in.office_name,
        officer_role=officer_in.officer_role,
        room_number=officer_in.room_number,
        available_days=officer_in.available_days,
        available_time=officer_in.available_time,
        status=officer_in.status
    )
    db.add(db_officer)
    db.commit()
    db.refresh(db_officer)
    
    return OfficerResponse(
        id=db_officer.id,
        office_name=db_officer.category or "",
        officer_name=db_officer.title,
        officer_role=db_officer.officer_role or "",
        room_number=db_officer.room_number or "",
        available_days=db_officer.available_days or "",
        available_time=db_officer.available_time or "",
        status=db_officer.status or ""
    )

@officers_router.get("", response_model=List[OfficerResponse])
def get_officers(db: Session = Depends(get_db)):
    db_officers = db.query(TrustedSource).filter(TrustedSource.source_type == "officer").all()
    results = []
    for o in db_officers:
        results.append(
            OfficerResponse(
                id=o.id,
                office_name=o.category or "",
                officer_name=o.title,
                officer_role=o.officer_role or "",
                room_number=o.room_number or "",
                available_days=o.available_days or "",
                available_time=o.available_time or "",
                status=o.status or ""
            )
        )
    return results
