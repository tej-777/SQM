from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum

class StaffRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"

class StaffBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., min_length=5, max_length=255)
    role: StaffRole = StaffRole.STAFF

class StaffCreate(StaffBase):
    hospital_id: UUID
    password: str = Field(..., min_length=6, max_length=100)

class StaffUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[str] = Field(None, min_length=5, max_length=255)
    role: Optional[StaffRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)

class StaffResponse(StaffBase):
    id: UUID
    hospital_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class StaffLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    staff: StaffResponse

    model_config = {"from_attributes": True}
