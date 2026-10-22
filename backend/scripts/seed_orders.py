from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from scripts.seed_users import ADMIN_USER_ID, CUSTOMER_USER_ID
from src.app.modules.orders.model import Order, OrderDetail, OrderLog


def seed_orders(db: Session) -> None:
    """Nap du lieu mau cho don hang, chi tiet don hang va nhat ky don hang."""
    orders_data = [
        {
            "order_id": "ORD202609230001",
            "user_id": CUSTOMER_USER_ID,
            "address_id": 1,
            "order_date": datetime.now(UTC),
            "status": "COMPLETED",
            "total": Decimal("24990000.00"),
            "shipping_recipient_name": "Nguyễn Văn Khách Hàng",
            "shipping_phone": "0987654321",
            "shipping_province_code": "56",
            "shipping_province_name": "Hồ Chí Minh",
            "shipping_ward_code": "22333",
            "shipping_ward_name": "Phường Bến Nghé",
            "shipping_address_line": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            "payment_method": "VNPAY",
            "payment_status": "PAID",
            "payment_date": datetime.now(UTC),
            "estimated_delivery_date": datetime.now(UTC),
            "delivered_at": datetime.now(UTC),
            "return_period_day": 7,
        },
        {
            "order_id": "ORD202609230002",
            "user_id": CUSTOMER_USER_ID,
            "address_id": 2,
            "order_date": datetime.now(UTC),
            "status": "PENDING",
            "total": Decimal("15500000.00"),
            "shipping_recipient_name": "Nguyễn Văn Khách Hàng",
            "shipping_phone": "0987654321",
            "shipping_province_code": "56",
            "shipping_province_name": "Hồ Chí Minh",
            "shipping_ward_code": "22333",
            "shipping_ward_name": "Phường Bến Nghé",
            "shipping_address_line": "Tầng 5, Tòa nhà Landmark 81, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            "payment_method": "COD",
            "payment_status": "PENDING",
            "payment_date": None,
            "estimated_delivery_date": None,
            "delivered_at": None,
            "return_period_day": 7,
        },
    ]

    for item in orders_data:
        db.merge(Order(**item))

    db.flush()

    order_details_data = [
        {
            "order_detail_id": 1,
            "order_id": "ORD202609230001",
            "product_id": 1,
            "quantity": 1,
            "price": Decimal("24990000.00"),
        },
        {
            "order_detail_id": 2,
            "order_id": "ORD202609230002",
            "product_id": 2,
            "quantity": 1,
            "price": Decimal("15500000.00"),
        },
    ]

    for item in order_details_data:
        db.merge(OrderDetail(**item))

    order_logs_data = [
        {
            "id": 1,
            "order_id": "ORD202609230001",
            "status": "PENDING",
            "description": "Don hang duoc tao boi khach hang",
            "user_id": CUSTOMER_USER_ID,
            "log_date": datetime.now(UTC),
        },
        {
            "id": 2,
            "order_id": "ORD202609230001",
            "status": "PAID",
            "description": "Thanh toan truc tuyen VNPAY thanh cong",
            "user_id": CUSTOMER_USER_ID,
            "log_date": datetime.now(UTC),
        },
        {
            "id": 3,
            "order_id": "ORD202609230001",
            "status": "COMPLETED",
            "description": "Giao hang thanh cong va hoan tat don hang",
            "user_id": ADMIN_USER_ID,
            "log_date": datetime.now(UTC),
        },
        {
            "id": 4,
            "order_id": "ORD202609230002",
            "status": "PENDING",
            "description": "Don hang moi dang cho xac nhan",
            "user_id": CUSTOMER_USER_ID,
            "log_date": datetime.now(UTC),
        },
    ]

    for item in order_logs_data:
        db.merge(OrderLog(**item))

    db.commit()
    print("-> Orders, OrderDetails, and OrderLogs seeded successfully.")
