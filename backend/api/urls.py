from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import random
import string
from database.database import get_db
from database.redis import redis_client
from models.url import URL
from models.user import User
from schemas.url import URLCreate, URL as URLSchema
from api.auth import get_current_user
from typing import Optional

router = APIRouter()

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@router.post("/shorten", response_model=URLSchema)
def create_short_url(
    url: URLCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Use custom short code if provided and valid
    if url.custom_short_code:
        # Check if custom short code already exists
        existing_url = db.query(URL).filter(URL.short_code == url.custom_short_code).first()
        if existing_url:
            raise HTTPException(
                status_code=400,
                detail="This custom short code is already in use. Please choose another one."
            )
        short_code = url.custom_short_code
    else:
        # Generate random short code if not provided
        short_code = generate_short_code()
        # Check if the short code already exists
        while db.query(URL).filter(URL.short_code == short_code).first():
            short_code = generate_short_code()

    db_url = URL(
        original_url=str(url.original_url),
        short_code=short_code,
        user_id=current_user.id if current_user else None
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    return db_url

@router.post("/claim/{short_code}", response_model=URLSchema)
def claim_url(
    short_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")

    if db_url.user_id:
        if db_url.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="You already own this URL")
        raise HTTPException(status_code=400, detail="This URL is already claimed by another user")

    db_url.user_id = current_user.id
    db.commit()
    db.refresh(db_url)
    return db_url

@router.get("/stats/{short_code}", response_model=URLSchema)
def get_url_stats(
    short_code: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()

    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    if db_url.user_id and db_url.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this URL's stats")

    return db_url

@router.get("/my-urls", response_model=list[URLSchema])
def get_user_urls(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(URL).filter(URL.user_id == current_user.id).all()

@router.get("/unclaimed", response_model=list[URLSchema])
def get_unclaimed_urls(db: Session = Depends(get_db)):
    return db.query(URL).filter(URL.user_id == None).all()
