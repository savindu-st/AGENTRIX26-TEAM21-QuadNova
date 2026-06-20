from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class CrowdReport(Base):
    __tablename__ = "crowd_reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("citizen_cases.id"), nullable=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    office_name = Column(String, index=True, nullable=False)
    report_text = Column(Text, nullable=False)
    verification_status = Column(String, default="Pending")    # "Pending", "Verified", "Rejected"
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    case = relationship("CitizenCase", back_populates="crowd_reports")
    area = relationship("Area")
