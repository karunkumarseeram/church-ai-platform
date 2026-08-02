from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from app.models.chr_models import Feedback,FeedbackReply,FeedbackStatus
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackReplyCreate,
    FeedbackStatusUpdate,
)


# ================= CREATE FEEDBACK =================
def create_feedback(db: Session, payload: FeedbackCreate, user_id=None, ip_address=None):
    feedback = Feedback(
        user_id=user_id,
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        rating=payload.rating,
        category=payload.category,
        is_anonymous=payload.is_anonymous,
        page=payload.page,
        browser=payload.browser,
        device=payload.device,
        location=payload.location,
        ip_address=ip_address,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


# ================= GET SINGLE =================
def get_feedback(db: Session, feedback_id):
    return (
        db.query(Feedback)
        .options(joinedload(Feedback.replies))
        .filter(
            Feedback.id == feedback_id,
            Feedback.is_deleted == False
        )
        .first()
    )


# ================= USER FEEDBACK =================
def get_user_feedbacks(db: Session, user_id):
    return (
        db.query(Feedback)
        .options(joinedload(Feedback.replies))
        .filter(
            Feedback.user_id == user_id,
            Feedback.is_deleted == False
        )
        .order_by(Feedback.created_at.desc())
        .all()
    )


# ================= ADMIN LIST (WITH PAGINATION) =================
def get_all_feedbacks(db: Session, skip=0, limit=20, status=None):
    query = db.query(Feedback).options(joinedload(Feedback.replies)).filter(Feedback.is_deleted == False)

    if status:
        query = query.filter(Feedback.status == status)

    total = query.count()

    items = (
        query.order_by(Feedback.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"items": items, "total": total}


# ================= UPDATE STATUS =================
def update_feedback_status(db: Session, feedback_id, payload: FeedbackStatusUpdate):
    feedback = get_feedback(db, feedback_id)
    if not feedback:
        return None

    feedback.status = payload.status
    db.commit()
    db.refresh(feedback)
    return feedback


# ================= ADMIN REPLY =================
def reply_feedback(
    db: Session,
    feedback_id,
    payload: FeedbackReplyCreate,
    admin_id,
):
    feedback = get_feedback(db, feedback_id)

    if not feedback:
        return None

    reply_text = payload.reply_text if hasattr(payload, "reply_text") else (payload.message or "")

    reply = FeedbackReply(
        feedback_id=feedback.id,
        admin_id=admin_id,
        message=reply_text,
    )

    db.add(reply)

    feedback.status = FeedbackStatus.REVIEWED
    feedback.replied_at = datetime.utcnow()

    db.commit()
    db.refresh(feedback)

    return feedback

# ================= DELETE (SOFT DELETE) =================
def delete_feedback(db: Session, feedback_id):
    feedback = get_feedback(db, feedback_id)
    if not feedback:
        return False

    feedback.is_deleted = True
    db.commit()
    return True