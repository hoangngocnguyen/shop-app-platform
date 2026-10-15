from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_backend_dir() -> Path:
    base_dir = Path(__file__).resolve().parent
    while base_dir.name != "backend" and base_dir != base_dir.parent:
        base_dir = base_dir.parent
    return base_dir if base_dir.name == "backend" else Path.cwd()


BACKEND_DIR = _find_backend_dir()
ENV_LOCAL_PATH = BACKEND_DIR / ".env.local"
ENV_DEFAULT_PATH = BACKEND_DIR / ".env"
ENV_FILE_PATH = ENV_LOCAL_PATH if ENV_LOCAL_PATH.exists() else ENV_DEFAULT_PATH


class Settings(BaseSettings):
    PROJECT_NAME: str = "Shop App Backend"
    DEBUG: bool = False
    PORT: int = 8000

    DATABASE_URL: str = Field(default="")
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
