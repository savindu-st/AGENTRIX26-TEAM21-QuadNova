from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.database.base import Base

class TrustedSource(Base):
    __tablename__ = "trusted_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)           # E.g. "NIC Renewal Rules", "Matara Divisional Secretariat", or "Mr. K. L. Perera"
    content = Column(Text, nullable=False)                       # Detailed description, address, or bio
    source_type = Column(String, default="service")              # "service", "office", "officer", "circular", "statute"
    category = Column(String, nullable=True)                     # E.g. "Identity" (for service), "Colombo" (for office district), or "Matara Divisional Secretariat" (for officer's office name)
    fee = Column(Float, default=0.0)                             # Base service fee (for service)
    processing_time = Column(String, nullable=True)              # E.g. "3 days" (for service)
    required_documents = Column(Text, nullable=True)             # JSON list of document names (for service)
    url = Column(String, nullable=True)                          # URL or extra metadata
    
    # Columns for office/officer info
    office_type = Column(String, nullable=True)                  # E.g. "Divisional Secretariat"
    address = Column(String, nullable=True)
    officer_role = Column(String, nullable=True)                 # E.g. "Asst. Commissioner"
    room_number = Column(String, nullable=True)
    available_days = Column(String, nullable=True)               # E.g. "Monday, Wednesday"
    available_time = Column(String, nullable=True)               # E.g. "09:00 AM - 03:00 PM"
    status = Column(String, nullable=True)                       # E.g. "Available", "On Leave"

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
