from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Khai báo các biến môi trường
    PROJECT_NAME: str = "Shop App Backend"
    DEBUG: bool = False
    PORT: int = 8000

    # Biến bắt buộc phải có trong .env (không gán giá trị mặc định)
    DATABASE_URL: str = " "
    SECRET_KEY: str = " "

    # Cấu hình tự động đọc file .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Bỏ qua các biến thừa trong .env nếu không khai báo
    )


settings = Settings()
