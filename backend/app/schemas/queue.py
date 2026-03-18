from pydantic import BaseModel
from datetime import date
from typing import Optional
import uuid


class QueueStatusResponse(BaseModel):
    hospital_service_id: uuid.UUID
    appointment_date: date
    current_token: Optional[int]
    next_token: Optional[int]
    waiting_count: int
    served_count: int
    skipped_count: int

    model_config = {"from_attributes": True}


class CallNextTokenRequest(BaseModel):
    hospital_service_id: uuid.UUID
    appointment_date: date


class PatientQueueStatusResponse(BaseModel):
    appointment_id: uuid.UUID
    token_number: int
    patients_ahead: int
    estimated_wait_time_minutes: int
    status: str
