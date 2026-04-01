from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chr_models import PrayerRequest, User
from app.schemas.prayer import PrayerRequestCreate, PrayerRequestOut
from typing import List
import uuid
from app.core.security import get_current_user


router = APIRouter(prefix="/prayers", tags=["Prayers"])


# ✅ Create Prayer Request
@router.post("/", response_model=PrayerRequestOut)
def create_prayer(
    payload: PrayerRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # make sure you have this
):
    prayer = PrayerRequest(
        user_id=current_user.id,
        name=None if payload.is_anonymous else payload.name,
        request=payload.request
    )
    db.add(prayer)
    db.commit()
    db.refresh(prayer)
    return prayer


# ✅ Get Approved Prayers (Public)
@router.get("/", response_model=List[PrayerRequestOut])
def get_prayers(db: Session = Depends(get_db)):
    return db.query(PrayerRequest).filter(
        PrayerRequest.is_approved == True
    ).order_by(PrayerRequest.created_at.desc()).all()


# ✅ Admin: Get All
@router.get("/admin", response_model=List[PrayerRequestOut])
def get_all_prayers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "PASTOR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(PrayerRequest).order_by(PrayerRequest.created_at.desc()).all()


# ✅ Approve Prayer
@router.put("/{id}/approve")
def approve_prayer(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prayer = db.query(PrayerRequest).get(id)

    if not prayer:
        raise HTTPException(404, "Prayer not found")

    prayer.is_approved = True
    db.commit()

    return {"message": "Approved"}


# ✅ Delete Prayer
@router.delete("/{id}")
def delete_prayer(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prayer = db.query(PrayerRequest).get(id)

    if not prayer:
        raise HTTPException(404, "Not found")

    db.delete(prayer)
    db.commit()

    return {"message": "Deleted"}