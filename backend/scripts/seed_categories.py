from sqlalchemy.orm import Session

from src.app.modules.categories.model import Category


def seed_categories(db: Session) -> None:
    categories_data = [
        {
            "category_id": 1,
            "category_name": "Điện thoại",
            "parent_id": None,
            "slug": "dien-thoai",
        },
        {
            "category_id": 2,
            "category_name": "Laptop",
            "parent_id": None,
            "slug": "laptop",
        },
        {
            "category_id": 3,
            "category_name": "Sạc dự phòng đẹp",
            "parent_id": None,
            "slug": "sac-du-phong-dep",
        },
        {
            "category_id": 18,
            "category_name": "Bàn phím",
            "parent_id": None,
            "slug": "ban-phim",
        },
        {
            "category_id": 43,
            "category_name": "Đồng hồ",
            "parent_id": None,
            "slug": "dong-ho",
        },
        {
            "category_id": 70,
            "category_name": "sách làm giàu",
            "parent_id": None,
            "slug": "sach-lam-giau",
        },
        {
            "category_id": 71,
            "category_name": "Phụ kiện",
            "parent_id": None,
            "slug": "phu-kien",
        },
    ]

    for item in categories_data:
        db.merge(Category(**item))

    db.commit()
