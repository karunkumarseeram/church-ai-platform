from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, model_validator

from app.models.chr_models import FeedbackCategory, FeedbackStatus

from app.models.chr_models import FeedbackCategory

# ================= CREATE =================
class FeedbackCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    rating: int

    category: Optional[FeedbackCategory] = FeedbackCategory.GENERAL

    is_anonymous: Optional[bool] = False

    page: Optional[str] = None
    browser: Optional[str] = None
    device: Optional[str] = None
    location: Optional[str] = None

class FeedbackReplyResponse(BaseModel):
    id: UUID
    admin_id: UUID
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
# ================= UPDATE USER (optional) =================
class FeedbackUpdate(BaseModel):
    subject: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None
    category: Optional[FeedbackCategory] = None


# ================= ADMIN REPLY =================
class FeedbackReplyCreate(BaseModel):
    message: Optional[str] = None
    admin_reply: Optional[str] = None

    model_config = {
        "extra": "ignore"
    }

    @model_validator(mode="after")
    def normalize_reply_text(self):
        reply_text = (self.message or self.admin_reply or "").strip()
        if not reply_text:
            raise ValueError("message or admin_reply is required")

        self.message = reply_text
        return self

    @property
    def reply_text(self) -> str:
        return (self.message or self.admin_reply or "").strip()


# ================= STATUS UPDATE =================
class FeedbackStatusUpdate(BaseModel):
    status: FeedbackStatus


# ================= RESPONSE =================
class FeedbackResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]

    name: str
    email: str
    subject: str
    message: str
    rating: int

    category: FeedbackCategory
    status: FeedbackStatus

    replies: List[FeedbackReplyResponse] = []
    admin_reply: Optional[str] = None

    is_anonymous: bool

    page: Optional[str]
    browser: Optional[str]
    device: Optional[str]
    location: Optional[str]

    created_at: datetime
    updated_at: datetime

    @model_validator(mode="after")
    def populate_admin_reply(self):
        if self.replies:
            self.admin_reply = self.replies[-1].message
        return self

    class Config:
        from_attributes = True


# ================= LIST RESPONSE =================
class FeedbackListResponse(BaseModel):
    items: List[FeedbackResponse]
    total: int


def feedback_to_response(feedback_obj) -> dict:
    response = FeedbackResponse.model_validate(feedback_obj)
    data = response.model_dump(mode="json")
    if getattr(feedback_obj, "replies", None):
        data["replies"] = [
            {
                "id": reply.id,
                "admin_id": reply.admin_id,
                "message": reply.message,
                "created_at": reply.created_at.isoformat() if reply.created_at else None,
            }
            for reply in feedback_obj.replies
        ]
    data["admin_reply"] = data["replies"][-1]["message"] if data.get("replies") else None
    return data


def feedback_list_to_response(feedback_objs) -> list[dict]:
    return [feedback_to_response(feedback) for feedback in feedback_objs]


def feedback_list_payload(feedback_objs, total: int) -> dict:
    return {
        "items": feedback_list_to_response(feedback_objs),
        "total": total,
    }