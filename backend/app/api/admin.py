from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, admin_required
from app.models.chr_models import User

router = APIRouter(prefix="/admin", tags=["Admin"])


# 🔹 GET PENDING USERS
@router.get("/pending-users")
def pending_users(db: Session = Depends(get_db), admin=Depends(admin_required)):
    return db.query(User).filter(User.is_active == False).all()


# 🔹 APPROVE USER
@router.put("/approve/{user_id}")
def approve(user_id: str, db: Session = Depends(get_db), admin=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    user.is_active = True
    db.commit()
    return {"msg": "User approved"}