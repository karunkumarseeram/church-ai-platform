# app/api/admin.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.chr_models import User, RoleEnum
from app.core.dependencies import get_db, admin_required
router = APIRouter(prefix="/admin", tags=["admin"])

# ✅ List pending users (for notifications)
# List pending users
# app/api/admin.py


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

# Approve user
@router.put("/members/{user_id}/approve")
def approve_user(user_id: str, db: Session = Depends(get_db), admin=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    user.is_approved = True
    user.role = RoleEnum.MEMBER  # default role when approved
    db.commit()
    return {"message": f"{user.name} approved successfully"}

# Revoke user
@router.put("/members/{user_id}/revoke")
def revoke_user(user_id: str, db: Session = Depends(get_db), admin=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    user.is_approved = False
    db.commit()
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