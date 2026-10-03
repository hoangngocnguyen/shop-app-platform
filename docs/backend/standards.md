# 📖 QUY CHUẨN PHÁT TRIỂN BACKEND (BACKEND STANDARDS)

> **Áp dụng cho**: Toàn bộ lập trình viên Backend (FastAPI / Python / SQLAlchemy 2.0).  
> **Mục tiêu**: Đảm bảo mã nguồn nhất quán, chuẩn RESTful API, type-safe, xử lý lỗi đồng bộ và dễ bảo trì mở rộng.

---

## 1. Văn Hóa Viết Mã & Chú Thích (Code Comments & Type Hints)

1. **Chú thích giải thích luồng nghiệp vụ**:
   - Mọi hàm xử lý nghiệp vụ tại tầng `services/` và `routers/` **bắt buộc phải viết comment chú thích giải thích từng bước** (`# Bước 1: ...`, `# Bước 2: ...`).
   - Giúp các thành viên trong team và người review code nắm bắt logic nhanh chóng mà không cần suy đoán.
2. **Type Hints đầy đủ 100%**:
   - Tất cả các hàm, phương thức (methods), tham số đầu vào và kiểu dữ liệu trả về đều phải khai báo Type Hints rõ ràng:
   ```python
   def get_product_by_id(db: Session, product_id: int) -> Product | None:
       """Tra cuu san pham theo ID."""
       # Buoc 1: Query tim san pham theo khoa chinh
       return db.query(Product).filter(Product.product_id == product_id).first()
   ```

---

## 2. Phân Trang Chuẩn Hóa (Standard Pagination)

**Tất cả các API trả về danh sách** (`/products`, `/admin/products`, `/admin/categories`, `/orders`, `/shipping-addresses`,...) bắt buộc phải hỗ trợ phân trang.

### 2.1. Tham số Query đầu vào
* `page`: Số trang hiện tại (Default = `1`, ràng buộc `ge=1`).
* `page_size` (hoặc `limit`): Số lượng mục trên 1 trang (Default = `10` hoặc `20`, ràng buộc `ge=1, le=100`).

### 2.2. Cấu trúc JSON Response bắt buộc
Mọi API danh sách phải trả về cấu trúc đồng nhất sau:
```json
{
  "items": [
    {
      "product_id": 1,
      "product_name": "Apple MacBook Pro 14 M3",
      "price": "39990000.00"
    }
  ],
  "total": 120,
  "page": 1,
  "page_size": 10,
  "total_pages": 12
}
```

---

## 3. Xử Lý Exception & HTTP Status Code Chuẩn

* **Tuyệt đối không trả về chuỗi text thuần túy** khi xảy ra lỗi.
* Mọi lỗi nghiệp vụ (Không tìm thấy, sai mật khẩu, trùng slug, danh mục còn sản phẩm, hết hàng,...) bắt buộc phải raise **Custom Exception** kế thừa từ [`AppException`](file:///d:/Project/shop-app-platform/backend/src/app/core/exceptions.py).

### 3.1. Bảng ánh xạ HTTP Status Code

| HTTP Status Code | Khi nào sử dụng? |
| :--- | :--- |
| **`200 OK`** | Đọc, tìm kiếm, cập nhật dữ liệu thành công. |
| **`201 Created`** | Tạo mới tài nguyên thành công (Tạo đơn hàng, thêm sản phẩm, đăng ký). |
| **`400 Bad Request`** | Lỗi logic nghiệp vụ (trùng slug, dữ liệu không hợp lệ, giỏ hàng trống). |
| **`401 Unauthorized`** | Chưa đăng nhập hoặc Token JWT không hợp lệ / hết hạn. |
| **`403 Forbidden`** | Không có quyền truy cập (Người dùng thường cố truy cập route Admin). |
| **`404 Not Found`** | Không tìm thấy tài nguyên theo ID hoặc Slug. |
| **`409 Conflict`** | Dữ liệu bị xung đột hoặc trùng lặp (Email/Username đã tồn tại). |
| **`422 Unprocessable Entity`** | Lỗi Schema Validation tự động từ Pydantic V2. |
| **`500 Internal Server Error`** | Sự cố hệ thống nội bộ (Tự động log stacktrace qua Global Exception Handler). |

### 3.2. Cấu trúc JSON trả về khi có lỗi
```json
{
  "success": false,
  "error_code": "DUPLICATE_SLUG",
  "message": "Tên danh mục hoặc slug đã tồn tại",
  "details": null,
  "request_id": "c8a4df57-1234-4567-89ab-cdef01234567",
  "timestamp": "2026-10-03T10:00:00.000Z"
}
```

---

## 4. Validation & Input Sanitization Bằng Pydantic V2

Mọi dữ liệu đầu vào (Request Body, Query Params) bắt buộc phải được định nghĩa bằng Pydantic Schemas (`BaseModel`).

### Ràng buộc nghiệp vụ bắt buộc:
1. **Tiền tệ & Giá cả**: 
   - `price > 0`, `sale_price <= price`.
   - **Sử dụng `Decimal`**, tuyệt đối không dùng `float` để tránh sai số dấu phẩy động.
2. **Tồn kho & Số lượng**: 
   - `quantity >= 0` hoặc `stock >= 0`.
3. **Chuỗi văn bản (Tên, Email, Mô tả)**: 
   - Validate `min_length`, `max_length`.
   - Luôn sử dụng validator tự động cắt khoảng trắng thừa (`.strip()`).
4. **Đường dẫn tối ưu SEO (Slug)**: 
   - Kiểm tra tính duy nhất (Uniqueness) trước khi lưu vào Database.

```python
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

class ProductCreateRequest(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=255, description="Ten san pham")
    price: Decimal = Field(..., gt=0, description="Gia ban goc phai lon hon 0")
    sale_price: Decimal | None = Field(None, gt=0, description="Gia khuyen mai")
    quantity: int = Field(default=0, ge=0, description="So luong ton kho khong duoc am")
    category_id: int = Field(..., gt=0, description="ID danh muc truc thuoc")

    @field_validator("product_name")
    @classmethod
    def strip_whitespaces(cls, v: str) -> str:
        return v.strip()

    @field_validator("sale_price")
    @classmethod
    def validate_sale_price(cls, v: Decimal | None, info) -> Decimal | None:
        if v is not None and "price" in info.data and v > info.data["price"]:
            raise ValueError("Gia khuyen mai khong duoc lon hon gia goc.")
        return v
```

---

## 5. Cấu Trúc Thư Mục Backend Chuẩn (Layered / Clean Architecture)

Để dự án mở rộng dễ dàng khi có nhiều thành viên tham gia, Backend được chia thành 2 tầng rõ rệt:

```text
backend/src/app/
├── core/                      # Cấu hình chung toàn hệ thống
│   ├── config.py              # Đọc biến môi trường (.env.local, Pydantic Settings)
│   ├── database.py            # Engine, SessionLocal, Base, get_db()
│   ├── logger.py              # Core Logger (Console màu sắc + File xoay vòng)
│   ├── middleware.py          # Request Logging Middleware (Trace ID, Latency ms)
│   └── exceptions.py          # Custom Business Exceptions & Global Exception Handlers
│
└── modules/                   # Các Module nghiệp vụ độc lập (Feature Domain)
    ├── auth/                  # Xác thực tài khoản, JWT tokens, Login/Register
    ├── categories/            # Quản lý danh mục sản phẩm đa cấp
    ├── products/              # Quản lý sản phẩm, kho hàng, giá bán
    ├── carts/                 # Giỏ hàng & mục giỏ hàng (Cart, CartItem)
    ├── orders/                # Đơn hàng, chi tiết đơn hàng, nhật ký đơn
    ├── shipper/               # Đơn vị vận chuyển
    ├── users/                 # Quản lý người dùng, phân quyền
    └── shipping_addresses/    # Sổ địa chỉ nhận hàng
```

### Cấu trúc bên trong mỗi Module:
```text
modules/<module_name>/
├── __init__.py                # Export public API của module
├── model.py                   # SQLAlchemy 2.0 ORM Model
├── schema.py                  # Pydantic Schemas (Request/Response DTOs)
├── service.py                 # Tầng logic nghiệp vụ (Business Logic)
├── router.py                  # Tầng Controller (Endpoints & Swagger Annotations)
└── repository.py              # Tầng truy vấn CSDL (CRUD Helpers nếu cần)
```
