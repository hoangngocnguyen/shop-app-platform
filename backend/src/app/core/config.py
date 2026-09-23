from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Cách lấy chính xác thư mục 'backend' (tìm thư mục chứa file .env hoặc folder src)
# Giả sử file này nằm đâu đó bên trong thư mục backend/
FILE_PATH = Path(__file__).resolve()

# Lặp lùi ngược cây thư mục cho tới khi tìm thấy folder 'backend' hoặc chứa file .env
BASE_DIR = FILE_PATH.parent
while BASE_DIR.name != "backend" and BASE_DIR != BASE_DIR.parent:
    BASE_DIR = BASE_DIR.parent

# Nếu không tìm thấy thư mục tên 'backend', lấy thư mục gốc hiện tại
if BASE_DIR == BASE_DIR.parent:
    BASE_DIR = Path.cwd()

# Uu tien doc file .env.local (chuyen dung cho Local Dev), neu khong co se fallback ve .env
ENV_LOCAL_PATH = BASE_DIR / ".env.local"
ENV_DEFAULT_PATH = BASE_DIR / ".env"
ENV_FILE_PATH = ENV_LOCAL_PATH if ENV_LOCAL_PATH.exists() else ENV_DEFAULT_PATH


class Settings(BaseSettings):
    PROJECT_NAME: str = "Shop App Backend"
    DEBUG: bool = False
    PORT: int = 8000

    DATABASE_URL: str = Field(default="")
    SECRET_KEY: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Thêm 2 dòng print này để debug kiểm tra ngay khi khởi chạy app:
print(f"--> Dang doc file env tai: {ENV_FILE_PATH}")
print(f"-->DATABASE_URL nhan duoc: {settings.DATABASE_URL}")
