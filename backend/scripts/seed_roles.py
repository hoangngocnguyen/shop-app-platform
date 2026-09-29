from sqlalchemy.orm import Session

from src.app.modules.roles.model import Role


def seed_roles(db: Session) -> None:
    """Nạp dữ liệu mẫu cho bảng roles."""
    roles_data = [
        {"id": 1, "code": "ADMIN", "name": "Quản trị viên"},
        {"id": 2, "code": "USER", "name": "Khách hàng"},
        {"id": 3, "code": "STAFF", "name": "Nhân viên"},
    ]

    for item in roles_data:
        db.merge(Role(**item))

    db.commit()
    print("-> Roles seeded successfully.")
