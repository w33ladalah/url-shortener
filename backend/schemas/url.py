from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class URLBase(BaseModel):
    original_url: HttpUrl

class URLCreate(URLBase):
    pass

class URL(URLBase):
    id: int
    short_code: str
    created_at: datetime
    clicks: int

    class Config:
        orm_mode = True
