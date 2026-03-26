from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import *
from app.models.chr_models import User
from app.core.dependencies import get_db
from app.services.otp_service import generate_otp, save_otp, verify_otp
from app.services.email_service import send_email
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# 🔹 SEND OTP
@router.post("/send-otp")
def send_otp(data: LoginOTPRequest):
    otp = generate_otp()
    save_otp(data.email, otp)

    send_email(data.email, otp)

    return {"msg": "OTP sent"}


# 🔹 VERIFY OTP
@router.post("/verify-otp")
def verify(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    if not verify_otp(data.email, data.otp):
        return {"error": "Invalid OTP"}

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"error": "User not found"}

    if not user.is_active:
        return {"error": "Waiting for admin approval"}

    token = create_access_token({"user_id": str(user.id)})

    return {
        "access_token": token,
        "role": user.role
    }


# 🔹 RESEND OTP
@router.post("/resend-otp")
def resend(data: ResendOTPRequest):
    otp = generate_otp()
    save_otp(data.email, otp)

    send_email(data.email, otp)

    return {"msg": "OTP resent"}