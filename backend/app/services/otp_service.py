import random
import redis
from app.core.config import settings

r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def generate_otp():
    return str(random.randint(100000, 999999))


def save_otp(email: str, otp: str):
    r.setex(f"otp:{email}", 300, otp)  # 5 min expiry


def verify_otp(email: str, otp: str):
    stored = r.get(f"otp:{email}")
    return stored == otp