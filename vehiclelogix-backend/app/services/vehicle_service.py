from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from ..db import models
from ..schemas import vehicle as schemas

class VehicleService:
    @staticmethod
    def get_vehicle(db: Session, vehicle_id: int) -> Optional[models.Vehicle]:
        return db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()

    @staticmethod
    def get_vehicles_by_owner(db: Session, owner_id: int) -> List[models.Vehicle]:
        return db.query(models.Vehicle).filter(models.Vehicle.owner_id == owner_id).all()

    @staticmethod
    def create_vehicle(db: Session, vehicle: schemas.VehicleCreate, owner_id: int) -> models.Vehicle:
        db_vehicle = models.Vehicle(**vehicle.dict(), owner_id=owner_id)
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle

class ServiceRecordService:
    @staticmethod
    def create_service_record(db: Session, record: schemas.ServiceRecordCreate) -> models.ServiceRecord:
        db_record = models.ServiceRecord(**record.dict())
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record

    @staticmethod
    def get_vehicle_service_history(db: Session, vehicle_id: int) -> List[models.ServiceRecord]:
        return db.query(models.ServiceRecord).filter(
            models.ServiceRecord.vehicle_id == vehicle_id
        ).order_by(models.ServiceRecord.service_date.desc()).all()

    @staticmethod
    def get_upcoming_services(db: Session) -> List[models.ServiceRecord]:
        return db.query(models.ServiceRecord).filter(
            models.ServiceRecord.next_service_date >= datetime.utcnow()
        ).order_by(models.ServiceRecord.next_service_date.asc()).all()