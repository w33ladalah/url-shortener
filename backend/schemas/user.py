from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from .url import URL

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    urls: List[URL] = []

    class Config:
        from_attributes = True
