from pydantic import BaseModel, EmailStr


class SendOTP(BaseModel):
    email: EmailStr


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"