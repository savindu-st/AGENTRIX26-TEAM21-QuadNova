from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from backend.app.database.base import Base

class CrowdReport(Base):
    __tablename__ = "crowd_reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("citizen_cases.id", ondelete="SET NULL"), nullable=True)
    office_id = Column(Integer, ForeignKey("trusted_sources.id", ondelete="SET NULL"), nullable=True)
    report_text = Column(Text, nullable=False)
    verification_status = Column(String, default="Pending", nullable=False) # 'Pending', 'Verified', 'Rejected'
    created_at = Column(DateTime, default=datetime.utcnow)
