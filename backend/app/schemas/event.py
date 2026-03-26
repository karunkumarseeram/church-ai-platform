from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class EventCreate(BaseModel):
    title: str
    description: str


class EventOut(BaseModel):
    id: UUID
    title: str
    description: str
    event_date: datetime

    class Config:
        from_attributes = True