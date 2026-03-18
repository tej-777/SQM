from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
import enum
import uuid

class AppointmentStatus(str, enum.Enum):
    WAITING = "WAITING"
    CALLED = "CALLED"
    SERVED = "SERVED"
    SKIPPED = "SKIPPED"
    NO_SHOW = "NO_SHOW"
    CANCELLED = "CANCELLED"

class AppointmentCreate(BaseModel):
    hospital_service_id: uuid.UUID
    appointment_date: date
    patient_name: str = Field(..., min_length=1, max_length=200)
    patient_phone: str = Field(..., pattern=r"^\d{10}$")

class AppointmentResponse(BaseModel):
    id: uuid.UUID
    hospital_service_id: uuid.UUID
    appointment_date: date
    patient_name: str
    patient_phone: str
    token_number: int
    status: AppointmentStatus
    created_at: datetime

    model_config = {"from_attributes": True}

class ServiceAvailabilityBase(BaseModel):
    date: date
    is_available: bool = True
    max_tokens_override: Optional[int] = Field(None, ge=1)

class ServiceAvailabilityCreate(ServiceAvailabilityBase):
    hospital_service_id: uuid.UUID

class ServiceAvailabilityResponse(ServiceAvailabilityBase):
    id: uuid.UUID
    hospital_service_id: uuid.UUID

    model_config = {"from_attributes": True}
