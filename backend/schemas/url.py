from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from typing import Optional

class URLBase(BaseModel):
    original_url: HttpUrl

class URLCreate(URLBase):
    custom_short_code: Optional[str] = Field(None, min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_-]+$')

class URL(URLBase):
    id: int
    short_code: str
    created_at: datetime
    clicks: int

    class Config:
        orm_mode = True
