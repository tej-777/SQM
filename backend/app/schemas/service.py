from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class ServiceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class ServiceResponse(ServiceBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
