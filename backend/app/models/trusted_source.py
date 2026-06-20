from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from datetime import datetime
from backend.app.database.base import Base

class TrustedSource(Base):
    __tablename__ = "trusted_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, nullable=False, index=True) # "service", "office", "officer"
    
    # Common fields
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Service specific fields
    category = Column(String, nullable=True)
    fee = Column(Float, nullable=True)
    processing_time = Column(String, nullable=True)
    
    # Office / Officer specific fields
    district = Column(String, nullable=True)
    office_type = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # Officer specific fields
    office_id = Column(Integer, ForeignKey("trusted_sources.id", ondelete="SET NULL"), nullable=True)
    role = Column(String, nullable=True)
    room_number = Column(String, nullable=True)
    available_days = Column(String, nullable=True)
    available_time = Column(String, nullable=True)
    status = Column(String, nullable=True)
