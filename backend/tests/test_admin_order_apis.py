"""
Bộ kiểm thử toàn diện cho Admin Order Management API.
Sử dụng SQLite in-memory để kiểm thử độc lập, không phụ thuộc cơ sở dữ liệu thật.
Bao gồm:
1. GET /api/v1/admin/orders (Danh sách, phân trang, tìm kiếm, lọc)
2. GET /api/v1/admin/orders/statistics (Đếm số lượng theo trạng thái cho Tabs UI)
3. GET /api/v1/admin/orders/{order_id} (Chi tiết đơn hàng)
4. PATCH /api/v1/admin/orders/confirm & /{order_id}/confirm (Xác nhận đơn hàng)
5. PATCH /api/v1/admin/orders/shipping & /{order_id}/shipping (Chuyển giao hàng)
6. PATCH /api/v1/admin/orders/delivered & /{order_id}/delivered (Xác nhận đã giao, COD -> PAID)
7. PATCH /api/v1/admin/orders/{order_id}/cancel (Admin hủy đơn)
8. Phân quyền RBAC (Role-based access control: chỉ ADMIN và STAFF được truy cập).
"""

import os
import sys
import uuid
from datetime import UTC, datetime
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Đảm bảo PYTHONPATH nhận diện thư mục backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from src.app.core.database import Base, get_db
from src.app.core.deps import get_current_user
from src.app.main import app
from src.app.modules.categories.model import Category
from src.app.modules.orders.model import Order, OrderDetail, OrderLog
from src.app.modules.products.model import Product
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User

# ==============================================================================
# CẤU HÌNH DATABASE TEST (SQLite In-Memory)
# ==============================================================================
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="function")
def db_session():
    """Khởi tạo database in-memory và seed dữ liệu cho mỗi test case."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # 1. Seed Roles
    admin_role = Role(id=1, code="ADMIN", name="Quản trị viên")
    user_role = Role(id=2, code="USER", name="Khách hàng")
    staff_role = Role(id=3, code="STAFF", name="Nhân viên")
    session.add_all([admin_role, user_role, staff_role])
    session.commit()

    # 2. Seed Users
    admin_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="admin_user",
        email="admin@shopapp.vn",
        name="Quản Trị Viên",
        role_id=1,
        is_blocked=False,
    )
    customer_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="customer_user",
        email="customer@shopapp.vn",
        name="Nguyễn Văn A",
        role_id=2,
        is_blocked=False,
    )
    session.add_all([admin_user, customer_user])
    session.commit()

    # 3. Seed Category & Product
    cat = Category(
        category_id=1,
        category_name="Điện thoại",
        parent_id=None,
        slug="dien-thoai",
    )
    session.add(cat)
    session.commit()

    product = Product(
        product_id=1,
        product_name="iPhone 15 Pro Max 256GB",
        price=Decimal("30000000.00"),
        sale_price=Decimal("28000000.00"),
        discount_percent=6,
        quantity=50,
        sold=10,
        brand="Apple",
        origin="VN/A",
        description="Flagship smartphone",
        category_id=1,
    )
    session.add(product)
    session.commit()

    # 4. Seed Test Orders with various states
    # Đơn 1: PENDING, BANK_TRANSFER, Payment PENDING
    order1 = Order(
        order_id="OD2611040001AAAAAA",
        user_id=customer_user.user_id,
        order_date=datetime.now(UTC),
        status="PENDING",
        total=Decimal("28000000.00"),
        shipping_recipient_name="Nguyễn Văn A",
        shipping_phone="0912345678",
        shipping_province_code="79",
        shipping_province_name="TP. Hồ Chí Minh",
        shipping_ward_code="26740",
        shipping_ward_name="Bến Nghé",
        shipping_address_line="123 Lê Lợi, Quận 1",
        payment_method="BANK_TRANSFER",
        payment_status="PENDING",
    )
    # Đơn 2: PROCESSING, COD, Payment PENDING
    order2 = Order(
        order_id="OD2611040002BBBBBB",
        user_id=customer_user.user_id,
        order_date=datetime.now(UTC),
        status="PROCESSING",
        total=Decimal("1500000.00"),
        shipping_recipient_name="Trần Thị B",
        shipping_phone="0987654321",
        shipping_province_code="01",
        shipping_province_name="Hà Nội",
        shipping_ward_code="00001",
        shipping_ward_name="Tràng Tiền",
        shipping_address_line="456 Phố Huế, Hoàn Kiếm",
        payment_method="COD",
        payment_status="PENDING",
    )
    # Đơn 3: SHIPPING, COD, Payment PENDING
    order3 = Order(
        order_id="OD2611040003CCCCCC",
        user_id=customer_user.user_id,
        order_date=datetime.now(UTC),
        status="SHIPPING",
        total=Decimal("500000.00"),
        shipping_recipient_name="Lê Văn C",
        shipping_phone="0909090909",
        shipping_province_code="48",
        shipping_province_name="Đà Nẵng",
        shipping_ward_code="20202",
        shipping_ward_name="Hải Châu",
        shipping_address_line="789 Bạch Đằng",
        payment_method="COD",
        payment_status="PENDING",
    )
    session.add_all([order1, order2, order3])
    session.commit()

    # Seed order items for order 1
    detail1 = OrderDetail(
        order_detail_id=1,
        order_id="OD2611040001AAAAAA",
        product_id=1,
        quantity=1,
        price=Decimal("28000000.00"),
    )
    session.add(detail1)
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def admin_client(db_session):
    """Test client xác thực với quyền ADMIN."""
    def override_get_db():
        yield db_session

    admin_user = (
        db_session.query(User).filter(User.username == "admin_user").first()
    )

    def override_get_current_user():
        return admin_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def customer_client(db_session):
    """Test client xác thực với quyền USER thông thường (để test RBAC)."""
    def override_get_db():
        yield db_session

    customer_user = (
        db_session.query(User).filter(User.username == "customer_user").first()
    )

    def override_get_current_user():
        return customer_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ==============================================================================
# CÁC TEST CASES CHO ADMIN ORDER APIS
# ==============================================================================


def test_01_get_order_statistics(admin_client):
    """Kiểm tra API thống kê số lượng đơn theo từng trạng thái."""
    response = admin_client.get("/api/v1/admin/orders/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    stats = data["data"]

    # Phải có ít nhất ALL, PENDING, PROCESSING, SHIPPING
    stat_dict = {item["status"]: item["count"] for item in stats}
    assert stat_dict.get("ALL") == 3
    assert stat_dict.get("PENDING") == 1
    assert stat_dict.get("PROCESSING") == 1
    assert stat_dict.get("SHIPPING") == 1
    assert stat_dict.get("DELIVERED") == 0


def test_02_get_admin_orders_list_and_filters(admin_client):
    """Kiểm tra API danh sách đơn hàng cho Admin, phân trang và tìm kiếm."""
    # 1. Danh sách mặc định
    response = admin_client.get("/api/v1/admin/orders?page=1&page_size=10")
    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["total"] == 3
    assert len(payload["items"]) == 3

    # 2. Lọc theo trạng thái PENDING
    res_filter = admin_client.get("/api/v1/admin/orders?order_status=PENDING")
    assert res_filter.status_code == 200
    items = res_filter.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["order_id"] == "OD2611040001AAAAAA"

    # 3. Tìm kiếm theo tên người nhận
    res_search = admin_client.get("/api/v1/admin/orders?search=Trần Thị B")
    assert res_search.status_code == 200
    items_search = res_search.json()["data"]["items"]
    assert len(items_search) == 1
    assert items_search[0]["order_id"] == "OD2611040002BBBBBB"

    # 4. Tìm kiếm theo mã đơn
    res_search_id = admin_client.get("/api/v1/admin/orders?search=OD2611040003")
    assert res_search_id.status_code == 200
    assert len(res_search_id.json()["data"]["items"]) == 1


def test_03_get_admin_order_detail(admin_client):
    """Kiểm tra API xem chi tiết đơn hàng cho Admin."""
    # Đơn hàng tồn tại
    response = admin_client.get("/api/v1/admin/orders/OD2611040001AAAAAA")
    assert response.status_code == 200
    order_data = response.json()["data"]
    assert order_data["order_id"] == "OD2611040001AAAAAA"
    assert order_data["shipping_recipient_name"] == "Nguyễn Văn A"
    assert len(order_data["order_details"]) == 1
    assert order_data["order_details"][0]["product_name"] == "iPhone 15 Pro Max 256GB"

    # Đơn hàng không tồn tại -> 404
    res_404 = admin_client.get("/api/v1/admin/orders/OD_NON_EXISTENT")
    assert res_404.status_code == 404


def test_04_bulk_and_single_confirm_orders(admin_client, db_session):
    """Kiểm tra xác nhận đơn hàng (PENDING -> PROCESSING) kèm tự động cập nhật QR sang PAID."""
    # Xác nhận đơn 1 (BANK_TRANSFER, PENDING)
    payload = {
        "order_ids": ["OD2611040001AAAAAA"],
        "note": "Xác nhận chuyển khoản QR hợp lệ",
    }
    response = admin_client.patch("/api/v1/admin/orders/confirm", json=payload)
    assert response.status_code == 200
    result = response.json()["data"]
    assert result["success_count"] == 1
    assert result["failure_count"] == 0

    # Kiểm tra trong DB: status = PROCESSING, payment_status = PAID (vì BANK_TRANSFER)
    order = db_session.query(Order).filter(Order.order_id == "OD2611040001AAAAAA").first()
    assert order.status == "PROCESSING"
    assert order.payment_status == "PAID"
    assert order.payment_date is not None

    # Kiểm tra order_logs đã được ghi lại
    logs = db_session.query(OrderLog).filter(OrderLog.order_id == "OD2611040001AAAAAA").all()
    assert any(log.status == "PROCESSING" for log in logs)

    # Thử xác nhận lại đơn 1 (đã PROCESSING rồi) -> Single endpoint trả về 409 Conflict
    res_conflict = admin_client.patch("/api/v1/admin/orders/OD2611040001AAAAAA/confirm")
    assert res_conflict.status_code == 409


def test_05_start_shipping_orders(admin_client, db_session):
    """Kiểm tra chuyển đơn hàng sang trạng thái vận chuyển (PROCESSING -> SHIPPING)."""
    # Đơn 2 đang ở PROCESSING
    payload = {
        "order_ids": ["OD2611040002BBBBBB"],
        "note": "Đã bàn giao bưu tá Viettel Post",
    }
    response = admin_client.patch("/api/v1/admin/orders/shipping", json=payload)
    assert response.status_code == 200
    result = response.json()["data"]
    assert result["success_count"] == 1

    order = db_session.query(Order).filter(Order.order_id == "OD2611040002BBBBBB").first()
    assert order.status == "SHIPPING"


def test_06_complete_delivery_orders_cod_paid(admin_client, db_session):
    """Kiểm tra xác nhận đã giao (SHIPPING -> DELIVERED), tự động cập nhật COD -> PAID."""
    # Đơn 3 đang ở SHIPPING, COD, PENDING
    response = admin_client.patch("/api/v1/admin/orders/OD2611040003CCCCCC/delivered")
    assert response.status_code == 200

    order = db_session.query(Order).filter(Order.order_id == "OD2611040003CCCCCC").first()
    assert order.status == "DELIVERED"
    assert order.delivered_at is not None
    # COD tự động chuyển sang PAID khi giao hàng thành công
    assert order.payment_status == "PAID"
    assert order.payment_date is not None


def test_07_admin_cancel_order(admin_client, db_session):
    """Kiểm tra Admin hủy đơn hàng với lý do OUT_OF_STOCK."""
    cancel_payload = {
        "reason_code": "OUT_OF_STOCK",
        "detail": "Kho hết màu Titan tự nhiên",
    }
    response = admin_client.patch(
        "/api/v1/admin/orders/OD2611040001AAAAAA/cancel",
        json=cancel_payload,
    )
    assert response.status_code == 200
    order = db_session.query(Order).filter(Order.order_id == "OD2611040001AAAAAA").first()
    assert order.status == "CANCELLED"
    assert order.cancelled_by_type == "ADMIN"
    assert "Hết hàng" in order.cancel_reason or "OUT_OF_STOCK" in order.cancel_reason


def test_08_rbac_authorization(customer_client):
    """Kiểm tra RBAC: Khách hàng thông thường (USER) không được phép gọi Admin Order APIs."""
    res = customer_client.get("/api/v1/admin/orders")
    assert res.status_code == 403
    assert res.json()["error_code"] == "FORBIDDEN_ROLE"

    res_stats = customer_client.get("/api/v1/admin/orders/statistics")
    assert res_stats.status_code == 403
