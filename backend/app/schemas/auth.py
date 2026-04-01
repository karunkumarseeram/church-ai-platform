from pydantic import BaseModel, EmailStr


class SendOTP(BaseModel):
    email: EmailStr


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


# ✅ ADD THIS
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# 🔹 Forgot Password Schema
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# 🔹 Reset Password Schema
class ResetPasswordRequest(BaseModel):
    token: str
    password: str