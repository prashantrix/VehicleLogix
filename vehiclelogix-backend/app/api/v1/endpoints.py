from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...db import models
from ...schemas import vehicle as schemas
from ...services.vehicle_service import VehicleService, ServiceRecordService
from ...core.config import settings
from datetime import datetime

router = APIRouter()

# Dependency to get database session
def get_db():
    db = None
    try:
        # Replace this with your actual database session creation
        pass
        yield db
    finally:
        if db:
            db.close()

@router.post("/vehicles/", response_model=schemas.Vehicle)
def create_vehicle(vehicle: schemas.VehicleCreate, owner_id: int, db: Session = Depends(get_db)):
    return VehicleService.create_vehicle(db, vehicle, owner_id)

@router.get("/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = VehicleService.get_vehicle(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.get("/users/{owner_id}/vehicles/", response_model=List[schemas.Vehicle])
def get_user_vehicles(owner_id: int, db: Session = Depends(get_db)):
    return VehicleService.get_vehicles_by_owner(db, owner_id)

@router.post("/service-records/", response_model=schemas.ServiceRecord)
def create_service_record(record: schemas.ServiceRecordCreate, db: Session = Depends(get_db)):
    return ServiceRecordService.create_service_record(db, record)

@router.get("/vehicles/{vehicle_id}/service-history/", response_model=List[schemas.ServiceRecord])
def get_vehicle_service_history(vehicle_id: int, db: Session = Depends(get_db)):
    return ServiceRecordService.get_vehicle_service_history(db, vehicle_id)

@router.get("/service-records/upcoming/", response_model=List[schemas.ServiceRecord])
def get_upcoming_services(db: Session = Depends(get_db)):
    return ServiceRecordService.get_upcoming_services(db)