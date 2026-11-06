import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_backend_dir() -> Path:
    base_dir = Path(__file__).resolve().parent
    while base_dir.name != "backend" and base_dir != base_dir.parent:
        base_dir = base_dir.parent
    return base_dir if base_dir.name == "backend" else Path.cwd()


BACKEND_DIR = _find_backend_dir()
PROJECT_ROOT = BACKEND_DIR.parent
ENV_CANDIDATES = [
    BACKEND_DIR / ".env.local",
    PROJECT_ROOT / ".env.local",
    BACKEND_DIR / ".env",
    PROJECT_ROOT / ".env",
    BACKEND_DIR / ".env.local.example",
    PROJECT_ROOT / ".env.local.example",
    BACKEND_DIR / ".env.example",
    PROJECT_ROOT / ".env.example",
]
ENV_FILE_PATH = next((path for path in ENV_CANDIDATES if path.exists()), ENV_CANDIDATES[0])


def _default_database_url() -> str:
    user = os.getenv("POSTGRES_USER", "shop_app_platform")
    password = os.getenv("POSTGRES_PASSWORD", "shop_app_secret_password_2026")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5433")
    db_name = os.getenv("POSTGRES_DB", "shop_app_platform")
    return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{db_name}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Shop App Backend"
    DEBUG: bool = False
    PORT: int = 8000

    DATABASE_URL: str = Field(default_factory=_default_database_url)
    SECRET_KEY: str = Field(default="")
    SUPABASE_URL: str = Field(default="")

    CLOUDINARY_CLOUD_NAME: str = Field(default="")
    CLOUDINARY_API_KEY: str = Field(default="")
    CLOUDINARY_API_SECRET: str = Field(default="")

    VNP_TMN_CODE: str = Field(default="")
    VNP_HASH_SECRET: str = Field(default="")
    VNP_URL: str = Field(default="")
    VNP_RETURN_URL: str = Field(default="")
    VNP_IPN_URL: str = Field(default="")

    @property
    def JWKS_URL(self) -> str:
        return f"{self.SUPABASE_URL}/auth/v1/.well-known/jwks.json"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
