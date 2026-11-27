from sqlalchemy import select
from sqlalchemy.orm import Session

from src.app.modules.banners.models import Banner, BannerPosition


def seed_banners(db: Session) -> None:
    """Khởi tạo dữ liệu mẫu cho các banner quảng cáo trên website."""
    print("Seeding banners...")

    banners_data = [
        {
            "title": "Siêu hội công nghệ - Giảm đến 50%",
            "image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80",
            "mobile_image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80",
            "alt_text": "Siêu hội công nghệ giảm giá lớn",
            "link_url": "/",
            "position": BannerPosition.HOME_HERO.value,
            "priority": 10,
            "is_active": True,
        },
        {
            "title": "Laptop chính hãng - Bảo hành 2 năm",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&auto=format&fit=crop&q=80",
            "mobile_image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
            "alt_text": "Laptop chính hãng",
            "link_url": "/",
            "position": BannerPosition.HOME_HERO.value,
            "priority": 5,
            "is_active": True,
        },
        {
            "title": "Phụ kiện giảm giá cuối tuần",
            "image_url": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80",
            "alt_text": "Phụ kiện giảm giá",
            "link_url": "/",
            "position": BannerPosition.HOME_BANNER_GRID.value,
            "priority": 1,
            "is_active": True,
        },
        {
            "title": "Ưu đãi độc quyền cho thành viên mới",
            "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
            "alt_text": "Popup ưu đãi thành viên mới",
            "link_url": "/register",
            "position": BannerPosition.POPUP.value,
            "priority": 100,
            "is_active": True,
        },
        {
            "title": "Danh mục Điện thoại thông minh",
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
            "alt_text": "Banner đầu trang điện thoại",
            "link_url": "/",
            "position": BannerPosition.CATEGORY_TOP.value,
            "priority": 1,
            "is_active": True,
        },
    ]

    for item in banners_data:
        existing = db.scalar(
            select(Banner).where(
                Banner.title == item["title"],
                Banner.position == item["position"],
            )
        )
        if not existing:
            banner = Banner(**item)
            db.add(banner)

    db.commit()
    print("Banners seeded successfully.")
