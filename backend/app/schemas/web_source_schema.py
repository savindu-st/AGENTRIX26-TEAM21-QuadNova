from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class WebSourceBase(BaseModel):
    title: str
    url: str
    content: str

class WebSourceCreate(WebSourceBase):
    pass

class WebSourceResponse(WebSourceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
