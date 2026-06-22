from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AreaBase(BaseModel):
    name: str
    description: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class AreaResponse(AreaBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
