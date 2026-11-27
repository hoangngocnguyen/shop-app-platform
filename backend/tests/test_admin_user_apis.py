"""
Bộ kiểm thử toàn diện cho module Admin User Management (src/app/modules/admin/users).
Sử dụng SQLite in-memory để kiểm thử độc lập, không phụ thuộc CSDL bên ngoài.
Bao gồm:
1. GET /api/v1/admin/users (Danh sách, phân trang, tìm kiếm, lọc theo vai trò & trạng thái, sắp xếp)
2. GET /api/v1/admin/users/stats (Thống kê số lượng người dùng theo vai trò & trạng thái)
3. GET /api/v1/admin/users/{userId} (Chi tiết người dùng & trường hợp 404)
4. PATCH /api/v1/admin/users/{userId}/block (Khóa có lý do, mở khóa, validation)
5. PATCH /api/v1/admin/users/{userId}/role (Cập nhật vai trò hệ thống)
6. DELETE /api/v1/admin/users/{userId} (Xóa thành công & chặn xóa khi có đơn hàng liên kết)
7. Phân quyền RBAC (Chỉ ADMIN được phép truy cập, role khác bị 403 Forbidden).
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

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from src.app.core.database import Base, get_db
from src.app.core.deps import get_current_user
from src.app.main import app
from src.app.modules.orders.model import Order
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User

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
    """Khởi tạo schema và seed dữ liệu mẫu cho mỗi test case."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # 1. Seed Roles
    admin_role = Role(id=1, code="ADMIN", name="Quản trị viên")
    customer_role = Role(id=2, code="CUSTOMER", name="Khách hàng")
    staff_role = Role(id=3, code="STAFF", name="Nhân viên")
    session.add_all([admin_role, customer_role, staff_role])
    session.commit()

    # 2. Seed Users
    admin_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="admin_test",
        email="admin@shopapp.vn",
        name="Admin User",
        role_id=1,
        is_blocked=False,
    )
    cust_free = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="cust_free",
        email="free@shopapp.vn",
        name="Customer Free",
        phone="0911222333",
        role_id=2,
        is_blocked=False,
    )
    cust_with_order = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="cust_order",
        email="hasorder@shopapp.vn",
        name="Customer Order",
        phone="0988777666",
        role_id=2,
        is_blocked=False,
    )
    cust_blocked = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="cust_blocked",
        email="blocked@shopapp.vn",
        name="Customer Blocked",
        role_id=2,
        is_blocked=True,
    )
    session.add_all([admin_user, cust_free, cust_with_order, cust_blocked])
    session.commit()

    # 3. Seed Order cho cust_with_order để test ràng buộc toàn vẹn khi xóa
    sample_order = Order(
        order_id="OD_TEST_USER_ORDER_01",
        user_id=cust_with_order.user_id,
        order_date=datetime.now(UTC),
        status="COMPLETED",
        total=Decimal("500000.00"),
        shipping_recipient_name="Customer Order",
        shipping_phone="0988777666",
        shipping_province_code="79",
        shipping_province_name="TP. Hồ Chí Minh",
        shipping_ward_code="001",
        shipping_ward_name="Bến Nghé",
        shipping_address_line="123 Lê Lợi, Q1",
        payment_method="COD",
        payment_status="PAID",
    )
    session.add(sample_order)
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def admin_client(db_session):
    def override_get_db():
        yield db_session

    admin_user = (
        db_session.query(User).filter(User.username == "admin_test").first()
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
    def override_get_db():
        yield db_session

    customer = (
        db_session.query(User).filter(User.username == "cust_free").first()
    )

    def override_get_current_user():
        return customer

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ==============================================================================
# TEST CASES
# ==============================================================================


def test_01_get_users_paginated(admin_client):
    """Kiểm tra API lấy danh sách người dùng phân trang."""
    response = admin_client.get("/api/v1/admin/users?page=0&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert data["data"]["total"] >= 4
    assert len(data["data"]["content"]) >= 4


def test_02_get_users_search(admin_client):
    """Kiểm tra tìm kiếm người dùng theo email hoặc số điện thoại."""
    response = admin_client.get("/api/v1/admin/users?search=free@shopapp.vn")
    assert response.status_code == 200
    items = response.json()["data"]["content"]
    assert len(items) == 1
    assert items[0]["email"] == "free@shopapp.vn"


def test_03_get_users_filter_role_and_status(admin_client):
    """Kiểm tra lọc người dùng theo Role và Status."""
    # Lọc vai trò ADMIN
    res_admin = admin_client.get("/api/v1/admin/users?role=ADMIN")
    assert res_admin.status_code == 200
    items_admin = res_admin.json()["data"]["content"]
    assert all(u["role"] == "ADMIN" for u in items_admin)

    # Lọc trạng thái BLOCKED
    res_blocked = admin_client.get("/api/v1/admin/users?status=BLOCKED")
    assert res_blocked.status_code == 200
    items_blocked = res_blocked.json()["data"]["content"]
    assert len(items_blocked) == 1
    assert items_blocked[0]["status"] == "BLOCKED"


def test_04_get_user_stats(admin_client):
    """Kiểm tra API số liệu thống kê người dùng."""
    response = admin_client.get("/api/v1/admin/users/stats")
    assert response.status_code == 200
    stats = response.json()["data"]
    assert stats["total"] >= 4
    assert stats["customers"] >= 3
    assert stats["admins"] >= 1
    assert stats["blocked"] >= 1


def test_05_get_user_by_id(admin_client, db_session):
    """Kiểm tra lấy chi tiết người dùng và trường hợp 404."""
    user = db_session.query(User).filter(User.username == "cust_free").first()
    res = admin_client.get(f"/api/v1/admin/users/{user.user_id}")
    assert res.status_code == 200
    assert res.json()["data"]["email"] == "free@shopapp.vn"

    # 404 Not Found
    res_404 = admin_client.get(f"/api/v1/admin/users/{uuid.uuid4()}")
    assert res_404.status_code == 404


def test_06_block_and_unblock_user(admin_client, db_session):
    """Kiểm tra chức năng khóa và mở khóa tài khoản người dùng."""
    user = db_session.query(User).filter(User.username == "cust_free").first()

    # Khóa nhưng không gửi lý do -> 422 Unprocessable Entity
    bad_req = admin_client.patch(
        f"/api/v1/admin/users/{user.user_id}/block",
        json={"isBlocked": True, "reason": ""},
    )
    assert bad_req.status_code == 422

    # Khóa hợp lệ kèm lý do
    block_res = admin_client.patch(
        f"/api/v1/admin/users/{user.user_id}/block",
        json={"isBlocked": True, "reason": "Gian lận voucher khuyến mãi"},
    )
    assert block_res.status_code == 200
    assert block_res.json()["data"]["status"] == "BLOCKED"

    # Mở khóa tài khoản
    unblock_res = admin_client.patch(
        f"/api/v1/admin/users/{user.user_id}/block",
        json={"isBlocked": False},
    )
    assert unblock_res.status_code == 200
    assert unblock_res.json()["data"]["status"] == "ACTIVE"


def test_07_update_user_role(admin_client, db_session):
    """Kiểm tra cập nhật vai trò người dùng (thăng cấp lên STAFF)."""
    user = db_session.query(User).filter(User.username == "cust_free").first()
    res = admin_client.patch(
        f"/api/v1/admin/users/{user.user_id}/role",
        json={"role": "STAFF"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["role"] == "STAFF"


def test_08_delete_user_constraints(admin_client, db_session):
    """Kiểm tra xóa người dùng: không được xóa user đã có đơn hàng; xóa thành công user chưa có đơn."""
    user_with_order = (
        db_session.query(User).filter(User.username == "cust_order").first()
    )
    # Thử xóa user đã có đơn hàng -> 409 Conflict
    conflict_res = admin_client.delete(f"/api/v1/admin/users/{user_with_order.user_id}")
    assert conflict_res.status_code == 409

    # Xóa user chưa có đơn hàng -> 200 OK
    user_free = (
        db_session.query(User).filter(User.username == "cust_free").first()
    )
    delete_res = admin_client.delete(f"/api/v1/admin/users/{user_free.user_id}")
    assert delete_res.status_code == 200

    # Lấy lại user vừa xóa -> 404
    get_res = admin_client.get(f"/api/v1/admin/users/{user_free.user_id}")
    assert get_res.status_code == 404


def test_09_rbac_protection(customer_client):
    """Kiểm tra bảo mật RBAC: Khách hàng thông thường gọi API Admin bị từ chối 403."""
    res = customer_client.get("/api/v1/admin/users")
    assert res.status_code == 403
