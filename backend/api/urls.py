from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import random
import string
from database.database import get_db
from database.redis import redis_client
from models.url import URL
from schemas.url import URLCreate, URL as URLSchema
from fastapi.responses import RedirectResponse

router = APIRouter()

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@router.post("/shorten", response_model=URLSchema)
def create_short_url(url: URLCreate, db: Session = Depends(get_db)):
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

    db_url = URL(original_url=str(url.original_url), short_code=short_code)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    return db_url

@router.get("/stats/{short_code}", response_model=URLSchema)
def get_url_stats(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()

    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    return db_url

@router.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    # Try to get URL from Redis cache first
    cached_url = redis_client.get(f"url:{short_code}")

    original_url = None

    if cached_url:
        # Increment clicks in Redis
        redis_client.incr(f"clicks:{short_code}")
        # Update DB clicks periodically (every 10 clicks)
        cached_clicks = int(redis_client.get(f"clicks:{short_code}") or 0)
        if cached_clicks % 10 == 0:
            db_url = db.query(URL).filter(URL.short_code == short_code).first()
            if db_url:
                db_url.clicks = cached_clicks
                db.commit()
        original_url = cached_url.decode('utf-8')
    else:
        # If not in cache, get from DB
        db_url = db.query(URL).filter(URL.short_code == short_code).first()

        if db_url is None:
            raise HTTPException(status_code=404, detail="URL not found")

        # Cache the URL and initialize click counter
        redis_client.set(f"url:{short_code}", db_url.original_url)
        redis_client.set(f"clicks:{short_code}", db_url.clicks)

        # Increment clicks
        db_url.clicks += 1
        db.commit()

        original_url = db_url.original_url

    # Make sure the URL has http:// or https:// prefix
    if not original_url.startswith(('http://', 'https://')):
        original_url = 'http://' + original_url

    # Return a redirect response
    return RedirectResponse(url=original_url, status_code=307)
