from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from backend.app.database.base import Base

class CitizenCase(Base):
    __tablename__ = "citizen_cases"

    id = Column(String, primary_key=True, index=True)  # Format e.g., CAS_8921 or CAS-8921
    citizen_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    detected_service = Column(String, nullable=True)
    status = Column(String, default="clarification", nullable=False)
    visitguard_score = Column(Integer, default=70)
    risk_level = Column(String, default="Ready")
    created_at = Column(DateTime, default=datetime.utcnow)
