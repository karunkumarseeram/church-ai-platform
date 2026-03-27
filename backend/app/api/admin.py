from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import User
from app.core.dependencies import get_db, require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

# ✅ Approve user
@router.post("/approve/{user_id}")
def approve_user(user_id: str, admin=Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    user.is_approved = True
    db.commit()
    return {"message": f"{user.name} approved successfully"}

# ✅ List pending users
@router.get("/pending")
def pending_users(admin=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_approved == False).all()
    return users