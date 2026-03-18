from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class HospitalServiceBase(BaseModel):
    hospital_id: UUID = Field(..., description="Hospital ID")
    service_id: UUID = Field(..., description="Service ID")
    default_max_tokens_per_day: int = Field(..., gt=0, description="Maximum tokens per day")
    avg_consultation_time_minutes: int = Field(..., gt=0, description="Average consultation time in minutes")
    active_counters: int = Field(1, gt=0, description="Number of active counters")


class HospitalServiceCreate(HospitalServiceBase):
    """Schema for creating a new hospital service."""
    pass


class HospitalServiceUpdate(BaseModel):
    """Schema for updating an existing hospital service."""
    default_max_tokens_per_day: Optional[int] = Field(None, gt=0, description="Maximum tokens per day")
    avg_consultation_time_minutes: Optional[int] = Field(None, gt=0, description="Average consultation time in minutes")
    active_counters: Optional[int] = Field(None, gt=0, description="Number of active counters")


class HospitalServiceResponse(HospitalServiceBase):
    """Schema for hospital service response."""
    id: UUID
    created_at: Optional[datetime] = None
    service_name: Optional[str] = None

    model_config = {"from_attributes": True}
