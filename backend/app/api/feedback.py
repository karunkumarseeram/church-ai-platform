from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import feedback_service
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackReplyCreate,
    FeedbackStatusUpdate,
    feedback_list_payload,
    feedback_to_response,
)

from app.core.dependencies import get_current_user
from app.models.chr_models import User


router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)


# ================= USER SUBMIT FEEDBACK =================
@router.post("")
def create_feedback(
    payload: FeedbackCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    feedback = feedback_service.create_feedback(
        db=db,
        payload=payload,
        user_id=current_user.id if current_user else None,
        ip_address=request.client.host
    )

    return {
        "message": "Feedback submitted successfully",
        "data": feedback
    }


# ================= ADMIN REPLY =================
@router.post("/admin/{feedback_id}/reply")
def reply_feedback(
    feedback_id: str,
    payload: FeedbackReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    normalized_payload = payload
    if not normalized_payload.reply_text:
        raise HTTPException(status_code=422, detail="Reply message is required")

    feedback = feedback_service.reply_feedback(
        db=db,
        feedback_id=feedback_id,
        payload=FeedbackReplyCreate(message=normalized_payload.reply_text),
        admin_id=current_user.id
    )

    if not feedback:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    return {
        "message": "Reply added successfully",
        "data": feedback_to_response(feedback)
    }


# ================= ADMIN ALL FEEDBACK =================
@router.get("/admin/all")
def get_all_feedbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = feedback_service.get_all_feedbacks(db)
    return feedback_list_payload(result["items"], result["total"])


# ================= USER GET OWN FEEDBACK =================
@router.get("/my")
def get_my_feedbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    feedbacks = feedback_service.get_user_feedbacks(
        db,
        current_user.id
    )
    return [feedback_to_response(feedback) for feedback in feedbacks]


# ================= SINGLE FEEDBACK =================
@router.get("/{feedback_id}")
def get_feedback(
    feedback_id: str,
    db: Session = Depends(get_db)
):

    feedback = feedback_service.get_feedback(
        db,
        feedback_id
    )

    if not feedback:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    return feedback_to_response(feedback)


# ================= STATUS UPDATE =================
@router.patch("/admin/{feedback_id}/status")
def update_status(
    feedback_id: str,
    payload: FeedbackStatusUpdate,
    db: Session = Depends(get_db),
):

    return feedback_service.update_feedback_status(
        db,
        feedback_id,
        payload
    )


# ================= DELETE =================
@router.delete("/admin/{feedback_id}")
def delete_feedback(
    feedback_id: str,
    db: Session = Depends(get_db)
):

    return feedback_service.delete_feedback(
        db,
        feedback_id
    )