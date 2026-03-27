from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models.chr_models import User, OTP, RoleEnum
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import SendOTP, VerifyOTP, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.services.email_service import send_email
from app.services.otp_service import create_otp,verify_otp

router = APIRouter(prefix="/auth", tags=["Auth"])

# 🔹 Signup
@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed,
        role=RoleEnum.MEMBER,  # ✅ lowercase
        is_active=True,
        is_approved=False
    )
    db.add(new_user)
    db.commit()
    # db.refresh(new_user)  # always refresh after commit
    return new_user

# 🔹 Send OTP

@router.post("/send-otp", response_model=dict)
def send_otp(data: SendOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = create_otp(db, data.email)  # save in DB
    send_email(data.email, otp_code)       # send via email
    print(f"OTP for {data.email}: {otp_code}") 

    return {"message": "OTP sent successfully"}


# 🔹 Verify OTP & login
@router.post("/verify-otp", response_model=Token)
def verify_otp_route(data: VerifyOTP, db: Session = Depends(get_db)):
    if not verify_otp(db, data.email, data.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == data.email).first()
    if not user.is_approved:
        raise HTTPException(status_code=403, detail="User not approved by admin")

    access_token = create_access_token({"user_id": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}