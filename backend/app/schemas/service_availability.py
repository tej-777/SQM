from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class ServiceAvailabilityBase(BaseModel):
    date: date
    total_slots: int = Field(..., gt=0)
    is_active: bool = True


class ServiceAvailabilityCreate(ServiceAvailabilityBase):
    hospital_service_id: UUID


class ServiceAvailabilityUpdate(BaseModel):
    total_slots: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class ServiceAvailabilityResponse(ServiceAvailabilityBase):
    id: UUID
    hospital_service_id: UUID
    booked_slots: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AvailableDateResponse(BaseModel):
    date: date
    available_slots: int
    total_slots: int
