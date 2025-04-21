from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
import string
from database.database import get_db
from models.url import URL
from schemas.url import URLCreate, URL as URLSchema

router = APIRouter()

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@router.post("/shorten", response_model=URLSchema)
def create_short_url(url: URLCreate, db: Session = Depends(get_db)):
    short_code = generate_short_code()

    # Check if the short code already exists
    while db.query(URL).filter(URL.short_code == short_code).first():
        short_code = generate_short_code()

    db_url = URL(original_url=str(url.original_url), short_code=short_code)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    return db_url

@router.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()

    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    db_url.clicks += 1
    db.commit()

    return {"url": db_url.original_url}

@router.get("/stats/{short_code}", response_model=URLSchema)
def get_url_stats(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()

    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    return db_url
