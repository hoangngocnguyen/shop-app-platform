from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from scripts.seed_users import CUSTOMER_USER_ID, ADMIN_USER_ID
from src.app.modules.orders.model import Order, OrderDetail, OrderLog


def seed_orders(db: Session) -> None:
    """Nap du lieu mau cho don hang, chi tiet don hang va nhat ky don hang."""
    orders_data = [
        {
            "order_id": "ORD202609230001",
            "user_id": CUSTOMER_USER_ID,
            "order_date": datetime.utcnow(),
            "status": "COMPLETED",
            "total": Decimal("24990000.00"),
            "shipping_address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            "receiver_name": "Nguyễn Văn Khách Hàng",
            "shipping_phone": "0987654321",
            "payment_method": "VNPAY",
            "payment_status": "PAID",
            "payment_date": datetime.utcnow(),
            "delivery_date": datetime.utcnow(),
            "return_period_day": 7,
        },
        {
            "order_id": "ORD202609230002",
            "user_id": CUSTOMER_USER_ID,
            "order_date": datetime.utcnow(),
            "status": "PENDING",
            "total": Decimal("15500000.00"),
            "shipping_address": "Tầng 5, Tòa nhà Landmark 81, Bình Thạnh, TP. Hồ Chí Minh",
            "receiver_name": "Nguyễn Văn Khách Hàng",
            "shipping_phone": "0987654321",
            "payment_method": "COD",
            "payment_status": "PENDING",
            "payment_date": None,
            "delivery_date": None,
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
            "log_date": datetime.utcnow(),
        },
        {
            "id": 2,
            "order_id": "ORD202609230001",
            "status": "PAID",
            "description": "Thanh toan truc tuyen VNPAY thanh cong",
            "user_id": CUSTOMER_USER_ID,
            "log_date": datetime.utcnow(),
        },
        {
            "id": 3,
            "order_id": "ORD202609230001",
            "status": "COMPLETED",
            "description": "Giao hang thanh cong va hoan tat don hang",
            "user_id": ADMIN_USER_ID,
            "log_date": datetime.utcnow(),
        },
        {
            "id": 4,
            "order_id": "ORD202609230002",
            "status": "PENDING",
            "description": "Don hang moi dang cho xac nhan",
            "user_id": CUSTOMER_USER_ID,
            "log_date": datetime.utcnow(),
        },
    ]

    for item in order_logs_data:
        db.merge(OrderLog(**item))

    db.commit()
    print("-> Orders, OrderDetails, and OrderLogs seeded successfully.")
