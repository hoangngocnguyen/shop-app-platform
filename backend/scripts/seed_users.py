import uuid
from datetime import date, datetime
from sqlalchemy.orm import Session
from src.app.modules.users.model import User

# Định nghĩa các UUID cố định cho tài khoản mẫu
ADMIN_USER_ID = uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
CUSTOMER_USER_ID = uuid.UUID("b1ffcd88-8b0a-4fe7-aa5c-5aa8ac270b22")


def seed_users(db: Session) -> None:
    """Nạp dữ liệu mẫu cho bảng users."""
    users_data = [
        {
            "user_id": ADMIN_USER_ID,
            "name": "Quản Trị Viên Hệ Thống",
            "username": "admin",
            "password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret: admin123
            "email": "admin@shopapp.com",
            "phone": "0901234567",
            "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
            "is_blocked": False,
            "avatar_url": "https://res.cloudinary.com/dojey70x3/image/upload/v1754451108/admin_avatar.png",
            "date_of_birth": date(1995, 1, 1),
            "provider": "LOCAL",
            "role_id": 1,  # ROLE_ADMIN
            "last_login": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "user_id": CUSTOMER_USER_ID,
            "name": "Nguyễn Văn Khách Hàng",
            "username": "customer",
            "password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret: admin123
            "email": "customer@gmail.com",
            "phone": "0987654321",
            "address": "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
            "is_blocked": False,
            "avatar_url": "https://res.cloudinary.com/dojey70x3/image/upload/v1754451108/user_avatar.png",
            "date_of_birth": date(2000, 5, 20),
            "provider": "LOCAL",
            "role_id": 2,  # ROLE_USER
            "last_login": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
    ]

    for item in users_data:
        db.merge(User(**item))

    db.commit()
    print("-> Users seeded successfully.")
