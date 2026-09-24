from sqlalchemy.orm import Session
from scripts.seed_users import CUSTOMER_USER_ID
from src.app.modules.shipping_addresses.model import ShippingAddress


def seed_shipping_addresses(db: Session) -> None:
    """Nạp dữ liệu mẫu cho sổ địa chỉ nhận hàng."""
    addresses_data = [
        {
            "id": 1,
            "receiver_name": "Nguyễn Văn Khách Hàng (Nhà riêng)",
            "phone": "0987654321",
            "address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            "user_id": CUSTOMER_USER_ID,
        },
        {
            "id": 2,
            "receiver_name": "Nguyễn Văn Khách Hàng (Văn phòng)",
            "phone": "0987654321",
            "address": "Tầng 5, Tòa nhà Landmark 81, Bình Thạnh, TP. Hồ Chí Minh",
            "user_id": CUSTOMER_USER_ID,
        },
    ]

    for item in addresses_data:
        db.merge(ShippingAddress(**item))

    db.commit()
    print("-> Shipping addresses seeded successfully.")
