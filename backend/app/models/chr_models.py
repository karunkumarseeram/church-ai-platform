import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


# ================= BASE MODEL =================
class BaseModel:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


# ================= ENUMS =================
class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"


class PaymentMethod(str, enum.Enum):
    GPAY = "GPAY"
    PHONEPE = "PHONEPE"
    CASH = "CASH"
    CARD = "CARD"


# ================= USERS =================
class User(Base, BaseModel):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    password = Column(String, nullable=False)

    role = Column(Enum(RoleEnum), default=RoleEnum.USER)

    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)   # 🔥 ADMIN APPROVAL
    last_login = Column(DateTime(timezone=True), nullable=True)


# ================= MEMBERS =================
class Member(Base, BaseModel):
    __tablename__ = "members"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    full_name = Column(String)
    address = Column(String)
    age = Column(String)


# ================= EVENTS =================
class Event(Base, BaseModel):
    __tablename__ = "events"

    title = Column(String, nullable=False)
    description = Column(String)
    event_date = Column(DateTime(timezone=True), default=datetime.utcnow)


# ================= DONATIONS =================
class Donation(Base, BaseModel):
    __tablename__ = "donations"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    donor_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    payment_method = Column(Enum(PaymentMethod))
    transaction_id = Column(String)

    location = Column(String)
    ip_address = Column(String)

    donated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


# ================= VERSES =================
class Verse(Base, BaseModel):
    __tablename__ = "verses"

    title = Column(String)
    content = Column(String, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))


# ================= PRAYER REQUESTS =================
class PrayerRequest(Base, BaseModel):
    __tablename__ = "prayer_requests"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    name = Column(String)
    request = Column(String, nullable=False)

    is_approved = Column(Boolean, default=False)


# ================= ADMIN ACTION LOG =================
class AdminActionLog(Base, BaseModel):
    __tablename__ = "admin_action_logs"

    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    action = Column(String)

    location = Column(String)
    ip_address = Column(String)