# app/api/admin.py
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import uuid

from app.models.chr_models import User, RoleEnum, AdminActionLog
from app.core.dependencies import get_db, admin_required
from app.core.security import hash_password
from app.services.email_service import send_invite_email, send_welcome_email, send_account_status_email

router = APIRouter(prefix="/admin", tags=["admin"])


class InviteUserRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    role: str = RoleEnum.MEMBER.value


def log_admin_action(
    db: Session,
    admin_id: str,
    action: str,
    target_user_id: str = None,
    location: str = None,
    ip_address: str = None
):
    """Log admin actions for audit trail"""
    log_entry = AdminActionLog(
        admin_id=admin_id,
        target_user_id=target_user_id,
        action=action,
        location=location,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()


# ✅ List pending users (for notifications)


# ✅ Admin-only members list
# @router.get("/members")
# def list_members(db: Session = Depends(get_db), admin=Depends(admin_required)):
#     members = db.query(User).all()  # you can filter only MEMBER roles if needed
#     return [
#         {
#             "id": str(u.id),
#             "name": u.name,
#             "email": u.email,
#             "phone": u.phone,
#             "role": u.role,
#             "is_approved": u.is_approved,
#             "created_at": u.created_at
#         } for u in members
#     ]
@router.get("/members")
def list_members(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    offset = (page - 1) * limit
    query = db.query(User)
    total = query.count()
    users = query.offset(offset).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "members": [
            {
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "role": u.role,
                "is_approved": u.is_approved,
                "created_at": u.created_at
            } for u in users
        ]
    }

# Invite user
@router.post("/members/invite")
def invite_user(
    payload: InviteUserRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        role_enum = RoleEnum(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")

    temp_password = uuid.uuid4().hex[:10]
    hashed_password = hash_password(temp_password)

    new_user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hashed_password,
        role=role_enum,
        is_active=True,
        is_approved=True,
        token_version=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        send_invite_email(
            new_user.email,
            new_user.name,
            new_user.role.value,
            temp_password
        )
    except Exception as exc:
        # If invite email fails, keep the user but report the failure clearly.
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send invitation email: {exc}"
        )

    log_admin_action(
        db=db,
        admin_id=str(admin.id),
        action=f"Invited {new_user.role.value.lower()}: {new_user.name} ({new_user.email})",
        target_user_id=str(new_user.id),
        ip_address=request.client.host if request.client else None
    )

    return {"message": f"Invitation sent to {new_user.email}"}


# Approve user
@router.put("/members/{user_id}/approve")
def approve_user(user_id: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db), admin=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = True
    user.role = RoleEnum.MEMBER  # default role when approved
    db.commit()

    background_tasks.add_task(send_welcome_email, user.email, user.name)

    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=str(admin.id),
        action=f"Approved user: {user.name} ({user.email})",
        target_user_id=user_id,
        ip_address=request.client.host if request.client else None
    )

    return {"message": f"{user.name} approved successfully"}

# Revoke user
@router.put("/members/{user_id}/revoke")
def revoke_user(user_id: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db), admin=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = False
    db.commit()

    background_tasks.add_task(
        send_account_status_email,
        user.email,
        user.name,
        False
    )

    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=str(admin.id),
        action=f"Revoked user access: {user.name} ({user.email})",
        target_user_id=user_id,
        ip_address=request.client.host if request.client else None
    )

    return {"message": f"{user.name} access revoked"}

# List pending users for bell notifications
@router.get("/pending")
def pending_users(db: Session = Depends(get_db), admin=Depends(admin_required)):
    pending = db.query(User).filter(User.is_approved == False).order_by(User.created_at.desc()).all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at,
        } for u in pending
    ]