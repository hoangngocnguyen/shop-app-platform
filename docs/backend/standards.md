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

---

## 6. Chuẩn Hóa Generic API Response (API Response Standard)

> **Tương đương trong Spring Boot**: `ResponseEntity<ApiResponse<T>>` hoặc `BaseResponse<T>`.

Để Frontend nhận dữ liệu luôn nhất quán, tất cả API trả về thành công đều phải tuân theo cấu trúc Generic DTO:

### 6.1. Định nghĩa Generic Schemas (`src/app/core/responses.py`)
```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class BaseResponse(BaseModel):
    """Response co so cho cac API khong tra ve data (hoac thong bao chung)."""
    success: bool = True
    message: str = "Thao tác thành công."

class DataResponse(BaseResponse, Generic[T]):
    """Response chuan hoa tra ve 1 Object du lieu."""
    data: T

class PaginatedResponse(BaseModel, Generic[T]):
    """Response chuan hoa cho danh sach co phan trang."""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
```

### 6.2. Ví dụ Sử Dụng Trong Router
```python
@router.get("/{product_id}", response_model=DataResponse[ProductResponse])
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = productService.get_by_id(db, product_id)
    return DataResponse(
        message="Lấy chi tiết sản phẩm thành công.",
        data=product
    )
```

---

## 7. Kiến Trúc Bảo Mật & Phân Quyền (Security & RBAC)

> **Tương đương trong Spring Boot**: `SecurityConfig` / `SecurityFilterChain` + `@PreAuthorize("hasRole('ADMIN')")`.

Trong FastAPI, toàn bộ cơ chế bảo mật và phân quyền được hiện thực hóa qua **`src/app/core/security.py`** và **FastAPI Dependency Injection (`Depends`)**.

### 7.1. Băm Mật Khẩu & Tạo Token JWT (`src/app/core/security.py`)
* **Mật khẩu**: Bắt buộc sử dụng thuật toán băm an toàn **Bcrypt** hoặc **Argon2** (`passlib.context.CryptContext`).
* **JWT Access Token**: Thời hạn sống ngắn (15 - 60 phút) để giảm thiểu rủi ro khi bị lộ token.
* **JWT Refresh Token**: Thời hạn sống dài (7 - 30 ngày), lưu mã trong bảng [`refresh_token`](file:///d:/Project/shop-app-platform/backend/src/app/modules/auth/model.py) để hỗ trợ tính năng thu hồi quyền / Force Logout.

```python
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Ma hoa mat khau bang Bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiem tra mat khau goc voi chuoi da bam."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Sinh JWT Access Token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
```

### 7.2. Phân Quyền Vai Trò Người Dùng (Role-Based Access Control - RBAC)
Sử dụng Dependencies để bảo vệ các Endpoint theo từng cấp độ quyền:

```python
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from src.app.core.exceptions import UnauthorizedException, ForbiddenException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """1. Xac thuc Token va lay thong tin User (Tuong duong AuthenticationPrincipal)."""
    payload = verify_jwt_token(token)
    user = userService.get_by_id(db, user_id=payload.get("sub"))
    if not user:
        raise UnauthorizedException("Tài khoản không tồn tại.")
    if user.is_blocked:
        raise ForbiddenException("Tài khoản của bạn đã bị khóa.")
    return user

def require_roles(allowed_roles: list[str]):
    """2. Kiem tra Role (Tuong duong @PreAuthorize(\"hasRole('ADMIN')\"))."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name not in allowed_roles:
            raise ForbiddenException(f"Quyền truy cập bị từ chối. Yêu cầu một trong các vai trò: {allowed_roles}")
        return current_user
    return role_checker
```

### 7.3. Áp dụng bảo vệ Router:
```python
# API cong khai cho moi nguoi
@router.get("/products")
def list_products(): ...

# API chi danh cho nguoi dung da dang nhap
@router.get("/users/me")
def get_profile(current_user: User = Depends(get_current_user)): ...

# API chi danh cho Admin (Tuong duong @PreAuthorize(\"hasRole('ROLE_ADMIN')\"))
@router.post("/admin/categories", dependencies=[Depends(require_roles(["ROLE_ADMIN"]))])
def create_category(...): ...
```

---

## 8. Cấu Hình CORS & Header An Toàn (CORS & Security Middleware)

Trong [`src/app/main.py`](file:///d:/Project/shop-app-platform/backend/src/app/main.py), luôn cấu hình đầy đủ `CORSMiddleware` để kết nối an toàn với Next.js Frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",   # Next.js Local Dev
    "https://your-domain.com", # Production Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"],
)
```
