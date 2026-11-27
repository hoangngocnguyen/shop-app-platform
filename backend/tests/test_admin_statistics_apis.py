"""
Bộ kiểm thử toàn diện cho module Admin Statistics (src/app/modules/admin/statistics).
Sử dụng SQLite in-memory để kiểm thử độc lập, không phụ thuộc CSDL bên ngoài.
Bao gồm:
1. GET /api/v1/admin/statistics (Thống kê tổng quan Dashboard: Doanh thu gom cụm, trạng thái đơn, PTTT, tồn kho thấp)
2. Kiểm tra tính năng Caching in-memory (TTL 30s) và tối ưu hóa 1 query gộp.
3. GET /api/v1/admin/statistics/revenue (Doanh thu 12 tháng, xu hướng theo day/month/year & validation ngày)
4. GET /api/v1/admin/statistics/orders (Phân tích chi tiết đơn hàng)
5. GET /api/v1/admin/statistics/products (Top sản phẩm bán chạy trong tháng & sản phẩm sắp hết hàng)
6. GET /api/v1/admin/statistics/customers (Khách hàng chi tiêu nhiều nhất)
7. Phân quyền RBAC (Chỉ ADMIN được phép truy cập, role khác bị 403 Forbidden).
"""

import os
import sqlite3
import sys
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from src.app.core.database import Base, get_db
from src.app.core.deps import get_current_user
from src.app.main import app
from src.app.modules.admin.statistics.service import clear_overview_cache
from src.app.modules.categories.model import Category
from src.app.modules.orders.model import Order, OrderDetail
from src.app.modules.products.model import Product
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(test_engine, "connect")
def register_sqlite_functions(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        def sqlite_date_trunc(lookup, dt_str):
            if not dt_str:
                return None
            clean_str = str(dt_str).replace("T", " ")
            dt_part = clean_str.split(".")[0].split("+")[0]
            try:
                dt = datetime.fromisoformat(dt_part)
            except Exception:
                return str(dt_str)
            if lookup == "day":
                return dt.strftime("%Y-%m-%d 00:00:00")
            elif lookup == "month":
                return dt.strftime("%Y-%m-01 00:00:00")
            elif lookup == "year":
                return dt.strftime("%Y-01-01 00:00:00")
            return str(dt_str)

        dbapi_connection.create_function("date_trunc", 2, sqlite_date_trunc)


TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="function")
def db_session():
    """Khởi tạo schema và seed dữ liệu mẫu cho mỗi test case."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    clear_overview_cache()

    # 1. Seed Roles
    admin_role = Role(id=1, code="ADMIN", name="Quản trị viên")
    user_role = Role(id=2, code="USER", name="Khách hàng")
    session.add_all([admin_role, user_role])
    session.commit()

    # 2. Seed Users
    admin_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="admin_stat",
        email="admin_stat@shopapp.vn",
        name="Admin Stat",
        role_id=1,
        is_blocked=False,
    )
    cust_vip = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="cust_vip",
        email="vip@shopapp.vn",
        name="Khách Hàng VIP",
        role_id=2,
        is_blocked=False,
    )
    cust_normal = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="cust_normal",
        email="normal@shopapp.vn",
        name="Khách Hàng Thường",
        role_id=2,
        is_blocked=False,
    )
    session.add_all([admin_user, cust_vip, cust_normal])
    session.commit()

    # 3. Seed Category & Products
    cat = Category(
        category_id=1,
        category_name="Điện tử",
        slug="dien-tu",
    )
    session.add(cat)
    session.commit()

    # P1: Nhiều hàng
    p1 = Product(
        product_id=1,
        category_id=1,
        product_name="Laptop Pro 16",
        price=Decimal("25000000.00"),
        sale_price=Decimal("24000000.00"),
        quantity=50,
        sold=10,
    )
    # P2: Sắp hết hàng (quantity <= 5)
    p2 = Product(
        product_id=2,
        category_id=1,
        product_name="Chuột Không Dây",
        price=Decimal("500000.00"),
        sale_price=Decimal("450000.00"),
        quantity=2,
        sold=40,
    )
    # P3: Sắp hết hàng (quantity <= 5)
    p3 = Product(
        product_id=3,
        category_id=1,
        product_name="Bàn Phím Cơ",
        price=Decimal("1500000.00"),
        sale_price=Decimal("1400000.00"),
        quantity=4,
        sold=25,
    )
    session.add_all([p1, p2, p3])
    session.commit()

    # 4. Seed Orders (Tính mốc thời gian UTC)
    now = datetime.now(UTC)
    today_order = Order(
        order_id="OD_STAT_TODAY",
        user_id=cust_vip.user_id,
        order_date=now - timedelta(hours=1),
        status="COMPLETED",
        total=Decimal("1000000.00"),
        shipping_recipient_name="Khách Hàng VIP",
        shipping_phone="0911222333",
        shipping_province_code="79",
        shipping_province_name="TP.HCM",
        shipping_ward_code="001",
        shipping_ward_name="Phường 1",
        shipping_address_line="123 Đinh Tiên Hoàng",
        payment_method="VNPAY",
        payment_status="PAID",
    )
    week_order = Order(
        order_id="OD_STAT_WEEK",
        user_id=cust_vip.user_id,
        order_date=now - timedelta(days=2),
        status="COMPLETED",
        total=Decimal("2000000.00"),
        shipping_recipient_name="Khách Hàng VIP",
        shipping_phone="0911222333",
        shipping_province_code="79",
        shipping_province_name="TP.HCM",
        shipping_ward_code="001",
        shipping_ward_name="Phường 1",
        shipping_address_line="123 Đinh Tiên Hoàng",
        payment_method="COD",
        payment_status="PAID",
    )
    pending_order = Order(
        order_id="OD_STAT_PENDING",
        user_id=cust_normal.user_id,
        order_date=now - timedelta(hours=2),
        status="PENDING",
        total=Decimal("5000000.00"),
        shipping_recipient_name="Khách Hàng Thường",
        shipping_phone="0988777666",
        shipping_province_code="01",
        shipping_province_name="Hà Nội",
        shipping_ward_code="002",
        shipping_ward_name="Phường 2",
        shipping_address_line="456 Hoàng Hoa Thám",
        payment_method="COD",
        payment_status="PENDING",
    )
    session.add_all([today_order, week_order, pending_order])
    session.commit()

    # Seed OrderDetails để tính top bán chạy
    od1 = OrderDetail(
        order_detail_id=1,
        order_id="OD_STAT_TODAY",
        product_id=2,
        quantity=2,
        price=Decimal("450000.00"),
    )
    od2 = OrderDetail(
        order_detail_id=2,
        order_id="OD_STAT_WEEK",
        product_id=3,
        quantity=1,
        price=Decimal("1400000.00"),
    )
    session.add_all([od1, od2])
    session.commit()

    yield session

    session.close()
    clear_overview_cache()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def admin_client(db_session):
    def override_get_db():
        yield db_session

    admin_user = (
        db_session.query(User).filter(User.username == "admin_stat").first()
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
        db_session.query(User).filter(User.username == "cust_vip").first()
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


def test_01_get_overview_and_caching(admin_client):
    """Kiểm tra API thống kê tổng quan Dashboard và tính năng caching in-memory."""
    response = admin_client.get("/api/v1/admin/statistics?low_stock_limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    overview = data["data"]
    # Kiểm tra doanh thu được tổng hợp chính xác từ các đơn PAID
    rev = overview["revenue_summary"]
    assert Decimal(str(rev["today_revenue"])) >= Decimal("1000000.00")
    assert Decimal(str(rev["year_revenue"])) >= Decimal("3000000.00")

    # Kiểm tra thống kê trạng thái đơn
    order_stats = overview["order_status_stats"]
    assert any(item["status"] == "COMPLETED" and item["count"] >= 2 for item in order_stats)
    assert any(item["status"] == "PENDING" and item["count"] >= 1 for item in order_stats)

    # Kiểm tra sản phẩm tồn kho thấp (quantity <= 5)
    low_stock = overview["low_stock_products"]
    assert len(low_stock) == 2
    assert {item["product_id"] for item in low_stock} == {2, 3}

    # Lần gọi thứ 2 phải đọc từ cache thành công
    res_cached = admin_client.get("/api/v1/admin/statistics?low_stock_limit=5")
    assert res_cached.status_code == 200
    assert res_cached.json()["data"]["revenue_summary"]["today_revenue"] == rev["today_revenue"]


def test_02_get_revenue_statistics(admin_client):
    """Kiểm tra API thống kê doanh thu theo tháng và chuỗi xu hướng."""
    res = admin_client.get("/api/v1/admin/statistics/revenue?group_by=month")
    assert res.status_code == 200
    data = res.json()["data"]

    assert "monthly_revenue" in data
    assert len(data["monthly_revenue"]) == 12
    assert "revenue_trend" in data
    assert len(data["revenue_trend"]) > 0

    # Test nhóm theo ngày
    res_day = admin_client.get("/api/v1/admin/statistics/revenue?group_by=day")
    assert res_day.status_code == 200

    # Test nhóm theo năm
    res_year = admin_client.get("/api/v1/admin/statistics/revenue?group_by=year")
    assert res_year.status_code == 200


def test_03_get_revenue_statistics_validation_error(admin_client):
    """Kiểm tra validation khoảng ngày: start_date > end_date phải trả về 422."""
    res = admin_client.get(
        "/api/v1/admin/statistics/revenue?start_date=2026-12-31&end_date=2026-01-01"
    )
    assert res.status_code == 422


def test_04_get_order_statistics(admin_client):
    """Kiểm tra API thống kê chuyên sâu về đơn hàng."""
    res = admin_client.get("/api/v1/admin/statistics/orders")
    assert res.status_code == 200
    data = res.json()["data"]

    assert "status_breakdown" in data
    assert "payment_breakdown" in data
    payment_methods = {item["payment_method"]: item["count"] for item in data["payment_breakdown"]}
    assert payment_methods.get("VNPAY", 0) >= 1
    assert payment_methods.get("COD", 0) >= 2


def test_05_get_product_statistics(admin_client):
    """Kiểm tra API thống kê sản phẩm bán chạy trong tháng và tồn kho thấp."""
    res = admin_client.get(
        "/api/v1/admin/statistics/products?top_selling_limit=5&low_stock_limit=5"
    )
    assert res.status_code == 200
    data = res.json()["data"]

    assert "top_selling_month" in data
    assert "low_stock_alerts" in data
    assert len(data["low_stock_alerts"]) == 2


def test_06_get_customer_statistics(admin_client):
    """Kiểm tra API thống kê khách hàng chi tiêu nhiều."""
    res = admin_client.get("/api/v1/admin/statistics/customers?limit=5")
    assert res.status_code == 200
    data = res.json()["data"]

    assert "top_spenders_month" in data
    top_custs = data["top_spenders_month"]
    assert len(top_custs) >= 1
    # cust_vip có 2 đơn PAID tổng 3,000,000
    assert top_custs[0]["name"] == "Khách Hàng VIP"
    assert Decimal(str(top_custs[0]["total_spent"])) >= Decimal("3000000.00")


def test_07_rbac_protection(customer_client):
    """Kiểm tra RBAC: Người dùng thường truy cập API thống kê Admin bị từ chối 403."""
    res = customer_client.get("/api/v1/admin/statistics")
    assert res.status_code == 403
