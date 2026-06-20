from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.db import get_db
from backend.app.models.trusted_source import TrustedSource
from backend.app.schemas.trusted_source_schema import (
    ServiceCreate, ServiceResponse,
    OfficeCreate, OfficeResponse,
    OfficerCreate, OfficerResponse
)

services_router = APIRouter()
offices_router = APIRouter()
officers_router = APIRouter()

# --- Services Endpoints ---

@services_router.get("/", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    services = db.query(TrustedSource).filter(TrustedSource.source_type == "service").all()
    return services

@services_router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(service_in: ServiceCreate, db: Session = Depends(get_db)):
    db_service = TrustedSource(
        source_type="service",
        name=service_in.name,
        description=service_in.description,
        category=service_in.category,
        fee=service_in.fee,
        processing_time=service_in.processing_time
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


# --- Offices Endpoints ---

@offices_router.get("/", response_model=List[OfficeResponse])
def get_offices(db: Session = Depends(get_db)):
    offices = db.query(TrustedSource).filter(TrustedSource.source_type == "office").all()
    return offices

@offices_router.post("/", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
def create_office(office_in: OfficeCreate, db: Session = Depends(get_db)):
    db_office = TrustedSource(
        source_type="office",
        name=office_in.name,
        description=office_in.description,
        district=office_in.district,
        office_type=office_in.office_type,
        address=office_in.address
    )
    db.add(db_office)
    db.commit()
    db.refresh(db_office)
    return db_office


# --- Officers Endpoints ---

@officers_router.get("/", response_model=List[OfficerResponse])
def get_officers(db: Session = Depends(get_db)):
    officers = db.query(TrustedSource).filter(TrustedSource.source_type == "officer").all()
    return officers

@officers_router.post("/", response_model=OfficerResponse, status_code=status.HTTP_201_CREATED)
def create_officer(officer_in: OfficerCreate, db: Session = Depends(get_db)):
    # Verify that the office exists if office_id is provided
    if officer_in.office_id:
        office = db.query(TrustedSource).filter(
            TrustedSource.id == officer_in.office_id,
            TrustedSource.source_type == "office"
        ).first()
        if not office:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Office with ID {officer_in.office_id} not found"
            )
            
    db_officer = TrustedSource(
        source_type="officer",
        name=officer_in.name,
        description=officer_in.description,
        office_id=officer_in.office_id,
        role=officer_in.role,
        room_number=officer_in.room_number,
        available_days=officer_in.available_days,
        available_time=officer_in.available_time,
        status=officer_in.status
    )
    db.add(db_officer)
    db.commit()
    db.refresh(db_officer)
    return db_officer
