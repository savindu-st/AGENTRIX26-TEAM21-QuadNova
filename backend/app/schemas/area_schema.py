from pydantic import BaseModel
from typing import Optional

class AreaBase(BaseModel):
    name: str
    district: str
    description: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class AreaResponse(AreaBase):
    id: int

    class Config:
        from_attributes = True
