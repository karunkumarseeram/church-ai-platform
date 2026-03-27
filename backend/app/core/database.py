from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 🔗 Engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True if settings.ENV == "dev" else False  # show SQL logs in dev
)

# 📦 Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 🧱 Base
Base = declarative_base()

# 🔹 Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()