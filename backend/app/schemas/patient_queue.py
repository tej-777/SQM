from pydantic import BaseModel
from datetime import datetime
import uuid


class PatientQueueView(BaseModel):
    appointment_id: uuid.UUID
    token_number: int
    status: str
    people_ahead: int
    estimated_wait_minutes: int
    estimated_call_time: datetime

    model_config = {"from_attributes": True}
