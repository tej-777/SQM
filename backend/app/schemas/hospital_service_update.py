from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class HospitalServiceCreate(BaseModel):
    hospital_id: UUID
    service_id: UUID
    avg_consultation_time_minutes: int = Field(..., gt=0)
    default_max_tokens_per_day: int = Field(..., gt=0)

class HospitalServiceUpdate(BaseModel):
    avg_consultation_time_minutes: Optional[int] = Field(None, gt=0)
    default_max_tokens_per_day: Optional[int] = Field(None, gt=0)
    active_counters: Optional[int] = Field(None, ge=1)

class HospitalServiceResponse(BaseModel):
    id: UUID
    hospital_id: UUID
    service_id: UUID
    avg_consultation_time_minutes: int
    default_max_tokens_per_day: int
    active_counters: int
    created_at: datetime

    model_config = {"from_attributes": True}
