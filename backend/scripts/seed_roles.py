from sqlalchemy.orm import Session

from src.app.modules.roles.model import Role


def seed_roles(db: Session) -> None:
    """Nạp dữ liệu mẫu cho bảng roles."""
    roles_data = [
        {"id": 1, "name": "ROLE_ADMIN"},
        {"id": 2, "name": "ROLE_USER"},
        {"id": 3, "name": "ROLE_STAFF"},
    ]

    for item in roles_data:
        db.merge(Role(**item))

    db.commit()
    print("-> Roles seeded successfully.")
