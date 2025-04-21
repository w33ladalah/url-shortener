from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api.urls import router as urls_router
from database.database import engine
from models.url import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="URL Shortener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(urls_router, prefix="/api/urls", tags=["urls"])

@app.get("/")
async def root():
    return {"message": "URL Shortener API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
