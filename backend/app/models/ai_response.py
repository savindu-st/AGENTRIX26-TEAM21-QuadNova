from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class AIResponse(Base):
    __tablename__ = "ai_responses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("citizen_cases.id"), nullable=False)
    answer = Column(Text, nullable=False)
    checklist = Column(Text, nullable=True)             # Stored as JSON string
    missing_documents = Column(Text, nullable=True)     # Stored as JSON string
    recommended_steps = Column(Text, nullable=True)     # Stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    case = relationship("CitizenCase", back_populates="ai_responses")
