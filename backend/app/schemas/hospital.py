from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from enum import Enum
import re

class HospitalType(str, Enum):
    PRIVATE = "private"
    GOVERNMENT = "government"
    TRUST = "trust"

class HospitalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    registration_number: Optional[str] = Field(None, min_length=1, max_length=100)
    hospital_type: HospitalType = HospitalType.PRIVATE
    established_year: Optional[int] = None
    address: str = Field(..., min_length=5, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=10)
    phone_number: str = Field(..., min_length=10, max_length=20)
    email: EmailStr

    @validator('pincode')
    def validate_pincode(cls, v):
        if not re.match(r'^\d{6}$', v):
            raise ValueError('Pincode must be exactly 6 digits')
        return v

    @validator('phone_number')
    def validate_phone(cls, v):
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Phone number must be exactly 10 digits')
        return v

    @validator('established_year')
    def validate_year(cls, v):
        if v and (v < 1800 or v > datetime.now().year):
            raise ValueError('Invalid year')
        return v

class HospitalCreate(HospitalBase):
    pass

class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    staff_id: str
    staff_password: str

    @validator('name', 'staff_id')
    def strip_name_fields(cls, v):
        return v.strip() if isinstance(v, str) else v

    @validator('password', 'staff_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class HospitalServiceCreate(BaseModel):
    service_id: UUID
    avg_consultation_time_minutes: int = Field(..., gt=0)
    default_max_tokens_per_day: int = Field(..., gt=0)

class HospitalRegisterRequest(BaseModel):
    hospital: HospitalCreate
    admin: AdminCreate
    services: List[HospitalServiceCreate] = []

class HospitalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    registration_number: Optional[str] = Field(None, min_length=1, max_length=100)
    hospital_type: Optional[HospitalType] = None
    address: Optional[str] = Field(None, min_length=5, max_length=500)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    pincode: Optional[str] = Field(None, min_length=6, max_length=10)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None

class HospitalResponse(HospitalBase):
    id: UUID
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class StaffResponse(BaseModel):
    id: UUID
    hospital_id: UUID
    name: str
    email: str
    role: str
    staff_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class HospitalRegistrationResponse(BaseModel):
    hospital: HospitalResponse
    admin: StaffResponse
    access_token: str

    model_config = {"from_attributes": True}
