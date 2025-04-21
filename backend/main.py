from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api.urls import router as urls_router
from api.users import router as users_router
from database.database import engine
from models.url import Base as URLBase
from models.user import Base as UserBase

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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
