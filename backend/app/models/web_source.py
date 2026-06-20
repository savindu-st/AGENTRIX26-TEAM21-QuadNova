from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.base import Base

class WebSource(Base):
    __tablename__ = "web_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    url = Column(String, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)
