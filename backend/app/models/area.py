from sqlalchemy import Column, Integer, String, Text
from app.database.base import Base

class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # E.g., "Matara"
    district = Column(String, nullable=False)                     # E.g., "Matara District"
    description = Column(Text, nullable=True)
