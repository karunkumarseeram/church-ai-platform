import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from urllib.parse import quote_plus
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, ".env")
class Settings(BaseSettings):
    # ================= ENV =================
    ENV: str = "dev"

    # ================= DB =================
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DEV_DB_NAME: str
    PROD_DB_NAME: str

    # ================= SECURITY =================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ================= REDIS =================
    REDIS_URL: Optional[str] = None  # <- optional now

    # ================= PAYMENTS =================
    RAZORPAY_KEY: Optional[str] = None  # <- optional now
    RAZORPAY_SECRET: Optional[str] = None  # <- optional now

    # ================= Pydantic Config =================
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # ================= DB URL =================
    @property
    def DATABASE_URL(self) -> str:
        db_name = self.DEV_DB_NAME if self.ENV == "dev" else self.PROD_DB_NAME
        password = quote_plus(self.DB_PASSWORD)
        return f"postgresql://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{db_name}"

# ✅ Load settings
settings = Settings()

# 🔍 Debug (remove in production)
print("✅ Loaded ENV:", settings.ENV)
print("📁 .env path:", ENV_PATH)
# print("🛢️ DB:", settings.DATABASE_URL)