import os
from typing import Optional

from urllib.parse import quote_plus
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

# ✅ ENV is decided first (VERY IMPORTANT)
ENV = os.getenv("ENV", "dev")

# ✅ Choose env file
ENV_PATH = (
    os.path.join(BASE_DIR, ".env.prod")
    if ENV == "prod"
    else os.path.join(BASE_DIR, ".env.dev")
)


class Settings(BaseSettings):

    # ==========================
    # ENV
    # ==========================
    ENV: str = "dev"

    # ==========================
    # DEV DB (local postgres)
    # ==========================
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DEV_DB_NAME: Optional[str] = None

    # ==========================
    # PROD DB (Neon)
    # ==========================
    PROD_DATABASE_URL: Optional[str] = None

    # ==========================
    # SECURITY
    # ==========================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ==========================
    # OPTIONAL
    # ==========================
    REDIS_URL: Optional[str] = None
    RAZORPAY_KEY: Optional[str] = None
    RAZORPAY_SECRET: Optional[str] = None

    BANK_NAME: Optional[str] = None
    ACCOUNT_NUMBER: Optional[str] = None
    IFSC: Optional[str] = None
    UPI: Optional[str] = None

    ADMIN_EMAIL: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ==========================
    # DATABASE SWITCH LOGIC
    # ==========================
    @property
    def DATABASE_URL(self) -> str:

        # ================= DEV =================
        if self.ENV == "dev":

            password = quote_plus(self.DB_PASSWORD or "")

            return (
                f"postgresql://"
                f"{self.DB_USER}:{password}"
                f"@{self.DB_HOST}:{self.DB_PORT}"
                f"/{self.DEV_DB_NAME}"
            )

        # ================= PROD =================
        if self.ENV == "prod":

            if not self.PROD_DATABASE_URL:
                raise ValueError("PROD_DATABASE_URL is missing in .env.prod")

            return self.PROD_DATABASE_URL

        raise ValueError("ENV must be either 'dev' or 'prod'")


settings = Settings()

print("===================================")
print("ENV :", settings.ENV)
print("DB  :", settings.DATABASE_URL)
print("===================================")