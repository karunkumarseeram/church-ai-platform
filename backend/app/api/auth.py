from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models.chr_models import User, OTP, RoleEnum
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import SendOTP, VerifyOTP, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

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
        role=RoleEnum.MEMBER,  # default
        is_active=True,
        is_approved=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 🔹 Send OTP
@router.post("/send-otp", response_model=dict)
def send_otp(data: SendOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = str(random.randint(100000, 999999))
    expires = datetime.utcnow() + timedelta(minutes=5)

    otp_entry = OTP(email=data.email, otp=otp_code, expires_at=expires, is_used=False)
    db.add(otp_entry)
    db.commit()

    # TODO: send otp_code via email
    print(f"OTP for {data.email}: {otp_code}")  # temporary

    return {"message": "OTP sent successfully"}

# 🔹 Verify OTP & login
@router.post("/verify-otp", response_model=Token)
def verify_otp(data: VerifyOTP, db: Session = Depends(get_db)):
    otp_entry = (
        db.query(OTP)
        .filter(OTP.email == data.email, OTP.otp == data.otp, OTP.is_used == False)
        .first()
    )

    if not otp_entry or otp_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp_entry.is_used = True
    db.commit()

    user = db.query(User).filter(User.email == data.email).first()
    if not user.is_approved:
        raise HTTPException(status_code=403, detail="User not approved by admin")

    access_token = create_access_token({"user_id": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}