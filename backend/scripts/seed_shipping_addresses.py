from sqlalchemy.orm import Session

from scripts.seed_users import CUSTOMER_USER_ID
from src.app.modules.shipping_addresses.model import ShippingAddress


def seed_shipping_addresses(db: Session) -> None:
    """Nạp dữ liệu mẫu cho sổ địa chỉ nhận hàng."""

    addresses_data = [
        {
            "id": 1,
            "recipient_name": "Nguyễn Văn Khách Hàng (Nhà riêng)",
            "phone": "0987654321",
            "user_id": CUSTOMER_USER_ID,
            "province_code": "56",
            "ward_code": "22333",
            "address_line": "123 Nguyễn Huệ",
            "is_default": True,
        },
        {
            "id": 2,
            "recipient_name": "Nguyễn Văn Khách Hàng (Văn phòng)",
            "phone": "0987654321",
            "user_id": CUSTOMER_USER_ID,
            "province_code": "56",
            "ward_code": "22333",
            "address_line": "Tầng 5, Tòa nhà Landmark 81",
            "is_default": False,
        },
    ]

    for item in addresses_data:
        db.merge(ShippingAddress(**item))

    db.commit()
    print("-> Shipping addresses seeded successfully.")
