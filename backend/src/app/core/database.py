from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from src.app.core.config import settings


class Base(DeclarativeBase):
    pass


# Fallback SQLite In-Memory nếu môi trường local/test chưa cấu hình DATABASE_URL
DEFAULT_DB_URL = "sqlite:///:memory:"
db_url = settings.DATABASE_URL.strip() if settings.DATABASE_URL else DEFAULT_DB_URL

engine = create_engine(
    db_url,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db():
    if not settings.DATABASE_URL:
        from src.app.core.exceptions import AppException

        raise AppException(
            status_code=500,
            message="Chưa cấu hình DATABASE_URL trong file .env.local trên backend",
            error_code="DATABASE_CONFIG_ERROR",
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
