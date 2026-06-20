from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from backend.app.database.base import Base

class AIResponse(Base):
    __tablename__ = "ai_responses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("citizen_cases.id", ondelete="CASCADE"), nullable=False)
    response_text = Column(Text, nullable=False)  # JSON-serialized AI analysis details (questions, visitPlan, timeline etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
