from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import uvicorn
from api.urls import router as urls_router
from api.users import router as users_router
from database.database import engine, get_db
from models.url import Base as URLBase, URL
from models.user import Base as UserBase
from database.redis import redis_client
from sqlalchemy.orm import Session

# Create database tables
URLBase.metadata.create_all(bind=engine)
UserBase.metadata.create_all(bind=engine)

app = FastAPI(title="URL Shortener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the routers
app.include_router(urls_router, prefix="/api/urls", tags=["urls"])
app.include_router(users_router, prefix="/api/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "URL Shortener API"}

@app.get("/{short_code}")
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
