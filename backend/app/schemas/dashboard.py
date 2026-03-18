from pydantic import BaseModel
from typing import List, Optional
import uuid


class DashboardSummaryResponse(BaseModel):
    total_tokens_today: int
    waiting: int
    called: int
    served: int
    cancelled: int
    currently_serving: int


class DashboardQueueItem(BaseModel):
    id: uuid.UUID
    token_number: int
    patient_name: str
    status: str


class DashboardQueueResponse(BaseModel):
    queue: List[DashboardQueueItem]
