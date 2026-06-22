from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from backend.app.database.base import Base

class WebSource(Base):
    __tablename__ = "web_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
