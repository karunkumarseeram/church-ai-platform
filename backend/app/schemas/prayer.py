from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class PrayerCreate(BaseModel):
    name: Optional[str]
    request: str


class PrayerOut(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    name: Optional[str]
    request: str
    is_approved: bool

    class Config:
        from_attributes = True