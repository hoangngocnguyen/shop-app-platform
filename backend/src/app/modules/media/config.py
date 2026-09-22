import cloudinary

from src.app.core.config import settings


def setup_cloudinary() -> None:
    """Khởi tạo cấu hình Cloudinary một lần duy nhất khi ứng dụng startup."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
