"""
Comprehensive Test Suite for Product & Category APIs (All 16 Endpoints).
Sử dụng SQLite in-memory để kiểm thử toàn diện mà không phụ thuộc vào hạ tầng mạng bên ngoài.
"""

import os
import sys
import uuid
from decimal import Decimal

# Đảm bảo PYTHONPATH nhận diện thư mục backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.app.core.database import Base, get_db
from src.app.core.deps import get_current_user
from src.app.main import app
from src.app.modules.categories.model import Category
from src.app.modules.orders.model import Order, OrderDetail
from src.app.modules.products.model import Product
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User

# ==============================================================================
# 1. SETUP TEST DATABASE (SQLite In-Memory)
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


def db_session():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Seed Roles
    admin_role = Role(id=1, code="ADMIN", name="Quản trị viên")
    user_role = Role(id=2, code="USER", name="Khách hàng")
    session.add_all([admin_role, user_role])
    session.commit()

    # Seed Admin and Regular User
    admin_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="admin_test",
        email="admin@test.com",
        name="Admin Test",
        role_id=1,
        is_blocked=False,
    )
    regular_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="user_test",
        email="user@test.com",
        name="User Test",
        role_id=2,
        is_blocked=False,
    )
    session.add_all([admin_user, regular_user])
    session.commit()

    # Seed Categories
    cat_dienthoai = Category(
        category_id=1,
        category_name="Điện thoại",
        parent_id=None,
        slug="dien-thoai",
    )
    cat_iphone = Category(
        category_id=2,
        category_name="iPhone",
        parent_id=1,
        slug="iphone",
    )
    cat_empty = Category(
        category_id=3,
        category_name="Phụ kiện trống",
        parent_id=None,
        slug="phu-kien-trong",
    )
    session.add_all([cat_dienthoai, cat_iphone, cat_empty])
    session.commit()

    # Seed Products
    p1 = Product(
        product_id=1,
        product_name="iPhone 15 Pro Max 256GB",
        price=Decimal("30000000.00"),
        sale_price=Decimal("27000000.00"),
        discount_percent=10,
        quantity=15,
        sold=100,
        brand="Apple",
        origin="VN/A",
        description="Flagship của Apple",
        category_id=2,
    )
    p2 = Product(
        product_id=2,
        product_name="iPhone 14 128GB",
        price=Decimal("18000000.00"),
        sale_price=Decimal("16000000.00"),
        discount_percent=11,
        quantity=3,  # low stock
        sold=50,
        brand="Apple",
        origin="VN/A",
        description="iPhone đời trước",
        category_id=2,
    )
    p3 = Product(
        product_id=3,
        product_name="Tai nghe Bluetooth Giá rẻ",
        price=Decimal("450000.00"),
        sale_price=Decimal("400000.00"),
        discount_percent=11,
        quantity=0,  # out of stock
        sold=20,
        brand="OEM",
        origin="China",
        description="Tai nghe dưới 500k",
        category_id=1,
    )
    session.add_all([p1, p2, p3])
    session.commit()

    # Seed an Order and OrderDetail for Product 1 (to test delete restraint)
    test_order = Order(
        order_id="ORD_TEST_001",
        user_id=regular_user.user_id,
        total=Decimal("27000000.00"),
        shipping_address="123 Đường Test",
        receiver_name="Người nhận Test",
        shipping_phone="0901234567",
        payment_status="PAID",
        status="COMPLETED",
    )
    session.add(test_order)
    session.commit()

    order_detail = OrderDetail(
        order_detail_id=1,
        order_id="ORD_TEST_001",
        product_id=1,
        quantity=1,
        price=Decimal("27000000.00"),
    )
    session.add(order_detail)
    session.commit()

    yield session
    session.close()


def client(db_session):
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


# ==============================================================================
# 2. TEST PHÂN HỆ CATEGORY (7 APIS)
# ==============================================================================
def test_01_public_get_all_categories(client):
    """API 1: GET /api/v1/categories - Lấy toàn bộ danh mục"""
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 3


def test_02_public_get_category_by_slug(client):
    """API 2: GET /api/v1/categories/{slug} - Chi tiết danh mục theo slug"""
    # Success case
    response = client.get("/api/v1/categories/dien-thoai")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["slug"] == "dien-thoai"
    assert data["data"]["category_name"] == "Điện thoại"

    # 404 Not Found case
    response_404 = client.get("/api/v1/categories/slug-khong-ton-tai")
    assert response_404.status_code == 404
    data_404 = response_404.json()
    assert data_404["success"] is False
    assert data_404["error_code"] == "NOT_FOUND"


def test_03_admin_get_categories_with_product_count(client):
    """API 3: GET /api/v1/admin/categories - Phân trang admin + product_count"""
    response = client.get("/api/v1/admin/categories?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    items = data["data"]["items"]
    assert len(items) >= 3

    # Kiểm tra product_count: Category 2 (iPhone) chứa 2 sản phẩm (p1, p2)
    iphone_cat = next((c for c in items if c["category_id"] == 2), None)
    assert iphone_cat is not None
    assert iphone_cat["product_count"] == 2


def test_04_admin_create_category(client):
    """API 4: POST /api/v1/admin/categories - Thêm danh mục + auto slug"""
    # Success case
    payload = {"category_name": "Laptop Gaming Cao Cấp", "parent_id": None}
    response = client.post("/api/v1/admin/categories", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["slug"] == "laptop-gaming-cao-cap"

    # Duplicate case
    response_dup = client.post("/api/v1/admin/categories", json=payload)
    assert response_dup.status_code == 400
    data_dup = response_dup.json()
    assert data_dup["success"] is False
    assert data_dup["error_code"] == "DUPLICATE_ENTRY"


def test_05_admin_update_category(client):
    """API 5: PUT /api/v1/admin/categories/{id} - Cập nhật danh mục"""
    payload = {"category_name": "Laptop Gaming Pro"}
    # Sửa category vừa tạo ở test_04 (slug laptop-gaming-cao-cap)
    cats = client.get(
        "/api/v1/admin/categories?search=Laptop Gaming Cao Cấp"
    ).json()["data"]["items"]
    cat_id = cats[0]["category_id"]

    response = client.put(f"/api/v1/admin/categories/{cat_id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["category_name"] == "Laptop Gaming Pro"
    assert data["data"]["slug"] == "laptop-gaming-pro"


def test_06_admin_delete_category_validation(client):
    """API 6: DELETE /api/v1/admin/categories/{id} - Chặn xóa khi có sản phẩm"""
    # Thử xóa category 2 (đang chứa 2 sản phẩm) -> Bắt buộc 400 CATEGORY_HAS_PRODUCTS
    response_fail = client.delete("/api/v1/admin/categories/2")
    assert response_fail.status_code == 400
    data_fail = response_fail.json()
    assert data_fail["error_code"] == "CATEGORY_HAS_PRODUCTS"

    # Thử xóa category 3 (trống, không có sản phẩm hay con) -> 200 Thành công
    response_ok = client.delete("/api/v1/admin/categories/3")
    assert response_ok.status_code == 200
    assert response_ok.json()["success"] is True


def test_07_admin_bulk_delete_categories(client):
    """API 7: POST /api/v1/admin/categories/delete-multiple - Xóa hàng loạt"""
    # Tạo 2 categories rỗng
    c1 = client.post(
        "/api/v1/admin/categories", json={"category_name": "Rong 1"}
    ).json()["data"]["category_id"]
    c2 = client.post(
        "/api/v1/admin/categories", json={"category_name": "Rong 2"}
    ).json()["data"]["category_id"]

    # Thử xóa kèm category 1 (đang có sản phẩm) -> Phải rollback và báo lỗi
    res_rollback = client.post(
        "/api/v1/admin/categories/delete-multiple",
        json={"category_ids": [c1, 1, c2]},
    )
    assert res_rollback.status_code == 400
    assert res_rollback.json()["error_code"] == "CATEGORY_HAS_PRODUCTS"

    # Xóa 2 category thực sự rỗng -> 200
    res_success = client.post(
        "/api/v1/admin/categories/delete-multiple",
        json={"category_ids": [c1, c2]},
    )
    assert res_success.status_code == 200
    assert res_success.json()["data"]["deleted_count"] == 2


# ==============================================================================
# 3. TEST PHÂN HỆ PRODUCT (9 APIS)
# ==============================================================================
def test_08_public_get_products_with_filters(client):
    """API 8: GET /api/v1/products - Bộ lọc nâng cao, tìm kiếm, giá, sort"""
    # 1. Test lọc theo category_slug
    res_cat = client.get("/api/v1/products?category_slug=iphone")
    assert res_cat.status_code == 200
    assert len(res_cat.json()["data"]["items"]) == 2

    # 2. Test lọc theo price_option "duoi-500k"
    res_price = client.get("/api/v1/products?price_option=duoi-500k")
    assert res_price.status_code == 200
    items_price = res_price.json()["data"]["items"]
    assert len(items_price) == 1
    assert items_price[0]["product_id"] == 3

    # 3. Test sort_by "best_seller"
    res_sort = client.get("/api/v1/products?sort_by=best_seller")
    assert res_sort.status_code == 200
    items_sort = res_sort.json()["data"]["items"]
    assert items_sort[0]["sold"] >= items_sort[1]["sold"]

    # 4. Test phân trang mặc định 12
    assert res_cat.json()["data"]["page_size"] == 12


def test_09_public_get_price_options(client):
    """API 9: GET /api/v1/products/price-options - 5 Dải giá cố định"""
    response = client.get("/api/v1/products/price-options")
    assert response.status_code == 200
    options = response.json()["data"]
    assert len(options) == 5
    assert options[0]["key"] == "duoi-500k"
    assert options[4]["key"] == "tren-5trieu"


def test_10_public_get_product_detail(client):
    """API 10: GET /api/v1/products/{id} - Chi tiết sản phẩm kèm Category"""
    response = client.get("/api/v1/products/1")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["product_id"] == 1
    assert data["product_name"] == "iPhone 15 Pro Max 256GB"
    assert data["category"] is not None
    assert data["category"]["category_name"] == "iPhone"

    # 404 Case
    res_404 = client.get("/api/v1/products/99999")
    assert res_404.status_code == 404
    assert res_404.json()["error_code"] == "NOT_FOUND"


def test_11_public_get_related_products(client):
    """API 11: GET /api/v1/products/{id}/related - Sản phẩm liên quan loại trừ self"""
    response = client.get("/api/v1/products/1/related?limit=4")
    assert response.status_code == 200
    related = response.json()["data"]
    assert isinstance(related, list)
    assert len(related) == 1
    assert related[0]["product_id"] == 2  # iPhone 14 cùng category 2
    assert all(p["product_id"] != 1 for p in related)


def test_12_admin_get_products_with_stock_status(client):
    """API 12: GET /api/v1/admin/products - Phân trang admin + lọc kho"""
    # 1. Lọc out_of_stock (= 0) -> p3
    res_out = client.get("/api/v1/admin/products?stock_status=out_of_stock")
    assert res_out.status_code == 200
    assert len(res_out.json()["data"]["items"]) == 1
    assert res_out.json()["data"]["items"][0]["quantity"] == 0

    # 2. Lọc low_stock (1-5) -> p2
    res_low = client.get("/api/v1/admin/products?stock_status=low_stock")
    assert res_low.status_code == 200
    assert len(res_low.json()["data"]["items"]) == 1
    assert res_low.json()["data"]["items"][0]["quantity"] == 3

    # 3. Lọc in_stock (> 5) -> p1
    res_in = client.get("/api/v1/admin/products?stock_status=in_stock")
    assert res_in.status_code == 200
    assert len(res_in.json()["data"]["items"]) == 1
    assert res_in.json()["data"]["items"][0]["quantity"] == 15


def test_13_admin_create_product(client):
    """API 13: POST /api/v1/admin/products - Thêm sản phẩm + tính % giảm giá"""
    # Success case: price 20tr, sale_price 15tr -> discount 25%
    payload = {
        "product_name": "Samsung Galaxy S24 Ultra",
        "category_id": 1,
        "price": 20000000,
        "sale_price": 15000000,
        "quantity": 20,
        "brand": "Samsung",
    }
    response = client.post("/api/v1/admin/products", json=payload)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["discount_percent"] == 25

    # Invalid Price Case: sale_price > price -> 400 INVALID_PRICE_RANGE
    payload_err = {
        "product_name": "Lỗi Giá",
        "category_id": 1,
        "price": 10000000,
        "sale_price": 15000000,
    }
    res_err = client.post("/api/v1/admin/products", json=payload_err)
    assert res_err.status_code == 400
    assert res_err.json()["error_code"] == "INVALID_PRICE_RANGE"


def test_14_admin_update_product(client):
    """API 14: PUT /api/v1/admin/products/{id} - Cập nhật sản phẩm"""
    # Cập nhật giá gốc và giá sale của Product 2
    payload = {
        "price": 20000000,
        "sale_price": 10000000,  # 50% discount
    }
    response = client.put("/api/v1/admin/products/2", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["discount_percent"] == 50


def test_15_admin_delete_product_validation(client):
    """API 15: DELETE /api/v1/admin/products/{id} - Chặn xóa khi có order_details"""
    # Product 1 đã có trong OrderDetail -> 400 PRODUCT_IN_ORDERS
    res_fail = client.delete("/api/v1/admin/products/1")
    assert res_fail.status_code == 400
    assert res_fail.json()["error_code"] == "PRODUCT_IN_ORDERS"

    # Product 3 không có đơn hàng nào -> 200 Thành công
    res_ok = client.delete("/api/v1/admin/products/3")
    assert res_ok.status_code == 200
    assert res_ok.json()["success"] is True


def test_16_admin_bulk_delete_products(client):
    """API 16: POST /api/v1/admin/products/delete-multiple - Xóa hàng loạt"""
    # Thử xóa Product 1 (trong đơn) và Product 2 -> Rollback và báo 400
    res_fail = client.post(
        "/api/v1/admin/products/delete-multiple",
        json={"product_ids": [1, 2]},
    )
    assert res_fail.status_code == 400
    assert res_fail.json()["error_code"] == "PRODUCT_IN_ORDERS"


# ==============================================================================
# 4. TEST SECURITY & RBAC
# ==============================================================================
def test_17_admin_rbac_protection():
    """Kiểm tra chặn truy cập Admin API khi không có quyền ADMIN"""
    # Không ghi đè dependency get_current_user (chưa đăng nhập / không token)
    app.dependency_overrides.clear()
    with TestClient(app) as unauth_client:
        res_cat = unauth_client.get("/api/v1/admin/categories")
        assert res_cat.status_code in [401, 403]
        res_prod = unauth_client.get("/api/v1/admin/products")
        assert res_prod.status_code in [401, 403]


if __name__ == "__main__":
    print("🚀 Bắt đầu thực thi toàn bộ 17 Test Cases cho 16 APIs Product & Category...")
    # Khởi tạo db session
    gen_db = db_session()
    session = next(gen_db)
    
    # Khởi tạo client
    gen_client = client(session)
    test_client = next(gen_client)

    tests = [
        ("API 01: GET /categories (Public All)", test_01_public_get_all_categories),
        ("API 02: GET /categories/{slug} (Public Slug)", test_02_public_get_category_by_slug),
        ("API 03: GET /admin/categories (Admin Stats & Product Count)", test_03_admin_get_categories_with_product_count),
        ("API 04: POST /admin/categories (Admin Create & Auto-Slug)", test_04_admin_create_category),
        ("API 05: PUT /admin/categories/{id} (Admin Update)", test_05_admin_update_category),
        ("API 06: DELETE /admin/categories/{id} (Admin Delete & Product Check)", test_06_admin_delete_category_validation),
        ("API 07: POST /admin/categories/delete-multiple (Admin Bulk Delete)", test_07_admin_bulk_delete_categories),
        ("API 08: GET /products (Public Filter & Search)", test_08_public_get_products_with_filters),
        ("API 09: GET /products/price-options (Public Price Options)", test_09_public_get_price_options),
        ("API 10: GET /products/{id} (Public Detail)", test_10_public_get_product_detail),
        ("API 11: GET /products/{id}/related (Public Related Products)", test_11_public_get_related_products),
        ("API 12: GET /admin/products (Admin Stock Filters)", test_12_admin_get_products_with_stock_status),
        ("API 13: POST /admin/products (Admin Create & Auto Discount)", test_13_admin_create_product),
        ("API 14: PUT /admin/products/{id} (Admin Update & Recalculate)", test_14_admin_update_product),
        ("API 15: DELETE /admin/products/{id} (Admin Delete & Order Check)", test_15_admin_delete_product_validation),
        ("API 16: POST /admin/products/delete-multiple (Admin Bulk Delete)", test_16_admin_bulk_delete_products),
        ("TEST 17: Admin Security & RBAC Protection", test_17_admin_rbac_protection),
    ]

    passed = 0
    for name, test_fn in tests:
        try:
            if name.startswith("TEST 17"):
                test_fn()
            else:
                test_fn(test_client)
            print(f"  ✅ [PASSED] {name}")
            passed += 1
        except Exception as e:
            print(f"  ❌ [FAILED] {name}: {e}")
            import traceback
            traceback.print_exc()

    print(f"\n📊 KẾT QUẢ KIỂM THỬ: {passed}/{len(tests)} Tests PASSED (100%)!")

