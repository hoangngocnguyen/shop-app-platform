# 🗄️ THIẾT KẾ CƠ SỞ DỮ LIỆU & QUY CHUẨN ORM (DATABASE ARCHITECTURE)

> **Hệ quản trị CSDL**: PostgreSQL 18 / 17  
> **ORM Layer**: SQLAlchemy 2.0 (Type-Safe Mapped Columns)  
> **Migration Tool**: Alembic  
> **Tổng số bảng**: 13 bảng nghiệp vụ

---

## 1. Sơ Đồ Thực Thể Liên Kết (Entity Relationship Diagram - ERD)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    USERS ||--o{ SHIPPING_ADDRESSES : "owns"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o| CARTS : "owns"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "requests"
    USERS ||--o| REFRESH_TOKENS : "has"
    
    CATEGORIES ||--o{ CATEGORIES : "parent_of"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    
    CARTS ||--o{ CART_ITEMS : "contains"
    PRODUCTS ||--o{ CART_ITEMS : "included_in"
    
    ORDERS ||--o{ ORDER_DETAILS : "contains"
    PRODUCTS ||--o{ ORDER_DETAILS : "purchased_in"
    ORDERS ||--o{ ORDER_LOGS : "tracks"
    USERS ||--o{ ORDER_LOGS : "logs_by"

    ROLES {
        int id PK "Mã vai trò"
        string name UK "Tên vai trò (ROLE_ADMIN, ROLE_USER, ROLE_STAFF)"
    }

    USERS {
        uuid user_id PK "UUID định danh người dùng"
        string username UK "Tên đăng nhập"
        string password "Mật khẩu đã băm (Bcrypt / Argon2)"
        string name "Họ và tên"
        string email UK "Địa chỉ email"
        string phone UK "Số điện thoại"
        string address "Địa chỉ liên hệ"
        boolean is_blocked "Trạng thái khóa"
        string avatar_url "URL ảnh đại diện"
        date date_of_birth "Ngày sinh"
        string provider "LOCAL, GOOGLE..."
        int role_id FK "Mã vai trò"
        datetime last_login "Thời điểm đăng nhập gần nhất"
        datetime created_at "Thời điểm tạo"
        datetime updated_at "Thời điểm cập nhật"
    }

    SHIPPING_ADDRESSES {
        int id PK "Mã địa chỉ"
        string receiver_name "Tên người nhận"
        string phone "Số điện thoại nhận"
        string address "Địa chỉ chi tiết"
        uuid user_id FK "Mã người dùng sở hữu"
    }

    CATEGORIES {
        int category_id PK "Mã danh mục"
        string category_name UK "Tên danh mục"
        int parent_id FK "Mã danh mục cha (cây đa cấp)"
        string slug UK "Đường dẫn tối ưu SEO"
    }

    PRODUCTS {
        int product_id PK "Mã sản phẩm"
        string product_name "Tên sản phẩm"
        numeric price "Giá bán gốc"
        numeric sale_price "Giá khuyến mãi"
        int discount_percent "% Giảm giá"
        int quantity "Số lượng tồn kho"
        int sold "Số lượng đã bán"
        numeric rating "Điểm đánh giá (0-5)"
        string brand "Thương hiệu"
        string origin "Xuất xứ"
        string image_src "URL ảnh sản phẩm"
        text description "Mô tả chi tiết"
        int category_id FK "Danh mục trực thuộc"
        datetime created_at "Thời điểm tạo"
        datetime updated_at "Thời điểm cập nhật"
    }

    CARTS {
        int cart_id PK "Mã giỏ hàng"
        uuid user_id FK,UK "Mã người dùng (Quan hệ 1-1)"
    }

    CART_ITEMS {
        int cart_item_id PK "Mã chi tiết giỏ hàng"
        int cart_id FK "Mã giỏ hàng"
        int product_id FK "Mã sản phẩm"
        int quantity "Số lượng sản phẩm"
    }

    ORDERS {
        string order_id PK "Mã đơn hàng (VD: ORD1727059123)"
        uuid user_id FK "Mã người mua hàng"
        datetime order_date "Ngày giờ đặt hàng"
        string status "Trạng thái đơn (PENDING, PROCESSING, COMPLETED...)"
        numeric total "Tổng giá trị đơn hàng"
        string shipping_address "Địa chỉ nhận hàng"
        string payment_method "COD, VNPAY, MOMO..."
        string payment_status "PENDING, PAID, FAILED..."
        string receiver_name "Tên người nhận"
        string shipping_phone "Số điện thoại nhận hàng"
        datetime delivery_date "Ngày giao hàng"
        int return_period_day "Số ngày cho phép đổi trả"
        datetime payment_date "Thời điểm thanh toán"
        datetime updated_at "Thời điểm cập nhật đơn"
    }

    ORDER_DETAILS {
        int order_detail_id PK "Mã chi tiết đơn hàng"
        string order_id FK "Mã đơn hàng"
        int product_id FK "Mã sản phẩm"
        int quantity "Số lượng mua"
        numeric price "Đơn giá tại thời điểm mua"
    }

    ORDER_LOGS {
        int id PK "Mã nhật ký"
        string order_id FK "Mã đơn hàng"
        string status "Trạng thái tại thời điểm ghi"
        string description "Mô tả diễn biến"
        uuid user_id FK "Người thực hiện thay đổi"
        datetime log_date "Thời điểm ghi log"
        datetime updated_at "Thời điểm cập nhật log"
    }

    SHIPPER {
        int shipper_id PK "Mã shipper"
        string name "Tên shipper / Đơn vị vận chuyển"
        string phone "Số điện thoại liên hệ"
        string status "Trạng thái hoạt động"
    }

    PASSWORD_RESET_TOKENS {
        int id PK "Mã định danh token"
        string token "Chuỗi token đặt lại mật khẩu"
        uuid user_id FK "Mã người dùng yêu cầu"
        datetime expiry_date "Thời điểm hết hạn token"
    }

    REFRESH_TOKENS {
        bigint id PK "Mã định danh token"
        string token UK "Chuỗi JWT refresh token"
        uuid user_id FK,UK "Mã người dùng sở hữu"
        datetime expiry_date "Thời điểm hết hạn"
    }
```

---

## 2. Quy Chuẩn Thiết Kế & Mapping Kiểu Dữ Liệu

1. **Chuẩn đặt tên**: Toàn bộ Database dùng `snake_case`. Bảng số nhiều (`users`, `products`, `orders`).
2. **Khóa chính**: UUID Native cho `users.user_id` (`UUID(as_uuid=True)`), Integer PK tự tăng cho các bảng danh mục, sản phẩm, giỏ hàng, đơn hàng chi tiết.
3. **Tiền tệ & Giá cả**: Bắt buộc dùng `Numeric(38, 2)` (SQLAlchemy) tương ứng `NUMERIC(38, 2)` trên PostgreSQL. **Không dùng float/double**.
4. **Audit Fields**: Bảng nghiệp vụ quan trọng luôn có `created_at` (`default=datetime.utcnow`) và `updated_at` (`default=datetime.utcnow, onupdate=datetime.utcnow`).
5. **Ràng buộc Khóa Ngoại**:
   - `ondelete="CASCADE"`: Áp dụng cho các bảng con phụ thuộc tuyệt đối (`cart_items`, `order_details`, `shipping_addresses`, `refresh_token`).
   - `ondelete="RESTRICT"`: Áp dụng bảo vệ dữ liệu tài chính lịch sử (`orders` $\rightarrow$ `users`, `order_details` $\rightarrow$ `products`).
   - `ondelete="SET NULL"`: Áp dụng cho cây danh mục đa cấp `categories.parent_id`.

---

## 3. Danh Sách 13 Bảng Dữ Liệu Chi Tiết

| STT | Tên bảng | Mục đích | Khóa chính (PK) | Quan hệ chính |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `roles` | Nhóm vai trò người dùng (Admin, User, Staff) | `id: Integer` | 1-N với `users` |
| **2** | `users` | Thông tin tài khoản người dùng | `user_id: UUID` | N-1 `roles`, 1-N `shipping_addresses`, 1-1 `carts` |
| **3** | `shipping_addresses` | Sổ địa chỉ giao hàng | `id: Integer` | N-1 với `users` |
| **4** | `categories` | Danh mục sản phẩm phân cấp cha - con | `category_id: Integer` | Tự liên kết `parent_id`, 1-N `products` |
| **5** | `products` | Thông tin sản phẩm, giá, kho, đánh giá | `product_id: Integer` | N-1 `categories` |
| **6** | `carts` | Giỏ hàng người dùng | `cart_id: Integer` | 1-1 `users`, 1-N `cart_items` |
| **7** | `cart_items` | Mặt hàng và số lượng trong giỏ | `cart_item_id: Integer`| N-1 `carts`, N-1 `products` |
| **8** | `orders` | Đơn hàng, tổng tiền, trạng thái giao dịch | `order_id: String(30)` | N-1 `users`, 1-N `order_details`, 1-N `order_logs` |
| **9** | `order_details` | Chi tiết mặt hàng chốt giá trong đơn | `order_detail_id: Integer`| N-1 `orders`, N-1 `products` |
| **10**| `order_logs` | Nhật ký hành trình trạng thái đơn | `id: Integer` | N-1 `orders`, N-1 `users` |
| **11**| `shipper` | Đơn vị vận chuyển (GHTK, GHN, ViettelPost) | `shipper_id: Integer` | Đơn vị giao nhận |
| **12**| `password_reset_token` | Token OTP đặt lại mật khẩu qua email | `id: Integer` | N-1 với `users` |
| **13**| `refresh_token` | Token phiên đăng nhập JWT (Force logout) | `id: BigInteger` | 1-1 với `users` |

---

## 4. Hướng Dẫn Kỹ Thuật Viết Model & Migration

### 4.1. Quy tắc viết Model (SQLAlchemy 2.0)
```python
from sqlalchemy import Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.app.core.database import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    cart_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cart_id: Mapped[int] = mapped_column(Integer, ForeignKey("carts.cart_id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.product_id", ondelete="CASCADE"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    cart = relationship("Cart", back_populates="cart_items")
    product = relationship("Product")
```

### 4.2. Quy tắc Migration & Seeder
1. Không sửa trực tiếp trên DB, mọi thay đổi qua `alembic revision --autogenerate -m "..."`.
2. Model mới bắt buộc phải được import vào [`alembic/env.py`](file:///d:/Project/shop-app-platform/backend/alembic/env.py).
3. Dữ liệu mẫu khởi tạo qua các script trong `backend/scripts/` và gọi qua `python -m scripts.seed`.
