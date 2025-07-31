from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.api.v1.endpoints import router as api_router
from app.db.models import Base

app = FastAPI(
    title="VehicleLogix API",
    description="Smart vehicle service management solution API",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",    # Live Server default
        "http://127.0.0.1:5500",    # Live Server alternative
        "http://localhost:5501",    # Live Server secondary port
        "http://127.0.0.1:5501",    # Live Server secondary alternative
        "http://localhost:3000",    # Keep for compatibility
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to VehicleLogix API",
        "status": "running",
        "version": "1.0.0"
    }