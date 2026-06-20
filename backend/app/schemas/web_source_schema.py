from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WebSourceBase(BaseModel):
    title: str
    content: str
    url: Optional[str] = None

class WebSourceCreate(WebSourceBase):
    pass

class WebSourceResponse(WebSourceBase):
    id: int
    scraped_at: datetime

    class Config:
        from_attributes = True
