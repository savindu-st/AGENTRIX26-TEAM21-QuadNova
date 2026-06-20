from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class CitizenCase(Base):
    __tablename__ = "citizen_cases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    citizen_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    detected_service = Column(String, nullable=True)
    status = Column(String, default="Pending")  # "Pending", "Need More Information", "Ready to Visit", "Not Ready", "Resolved"
    visitguard_score = Column(Integer, default=0)
    risk_level = Column(String, default="Low")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    ai_responses = relationship("AIResponse", back_populates="case", cascade="all, delete-orphan")
    crowd_reports = relationship("CrowdReport", back_populates="case", cascade="all, delete-orphan")
