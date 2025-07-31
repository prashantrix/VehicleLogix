from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    make: str
    model: str
    year: int
    license_plate: str

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class ServiceRecordBase(BaseModel):
    service_type: str
    description: str
    mileage: float
    service_date: datetime
    next_service_date: Optional[datetime] = None
    cost: float

class ServiceRecordCreate(ServiceRecordBase):
    vehicle_id: int

class ServiceRecord(ServiceRecordBase):
    id: int
    vehicle_id: int

    class Config:
        from_attributes = True