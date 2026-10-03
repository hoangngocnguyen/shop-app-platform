# 📖 QUY CHUẨN PHÁT TRIỂN BACKEND (BACKEND STANDARDS)

> **Áp dụng cho**: Toàn bộ lập trình viên Backend (FastAPI / Python / SQLAlchemy 2.0 / Pydantic V2).  
> **Mục tiêu**: Đảm bảo mã nguồn nhất quán, chuẩn RESTful API, Type-Safe, cấu trúc phân tầng rõ ràng, cơ chế bảo mật (CORS, JWT, RBAC) và chuẩn hóa dữ liệu trả về 100%.

---

## 1. Cấu Trúc Thư Mục Backend Chuẩn (Layered Architecture)

Toàn bộ Backend tuân thủ mô hình phân tầng chặt chẽ theo sơ đồ cây thư mục sau:

```text
backend/
├── app/
│   ├── core/                          # [HẠ TẦNG DÙNG CHUNG TOÀN HỆ THỐNG]
│   │   ├── config.py                  # Đọc biến môi trường .env (DB URL, JWT Secret, App Port)
│   │   ├── database.py                # Khởi tạo SQLAlchemy Engine, SessionLocal, Base
│   │   ├── security.py                # Mã hóa mật khẩu (Passlib/Bcrypt), sinh và verify JWT token
│   │   ├── deps.py                    # Dependencies tiêm vào API (get_db, get_current_user, require_role)
│   │   ├── exceptions.py              # Custom Exception class & Đăng ký Global Exception Handlers
│   │   ├── pagination.py              # Schema phân trang chuẩn (PaginationParams, PaginatedResponse)
│   │   ├── response.py                # Standard API Response wrapper (ApiResponse, error format)
│   │   └── logging.py                 # Cấu hình Structured Logging / Middleware ghi log request
│   │
│   ├── models/                        # [TẦNG CƠ SỞ DỮ LIỆU - SQLALCHEMY ORM]
│   │   ├── base.py                    # Base model có id, created_at, updated_at
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── product.py
│   │   └── order.py
│   │
│   ├── schemas/                       # [TẦNG DTO / VALIDATION - PYDANTIC]
│   │   ├── common.py
│   │   ├── user.py                    # UserCreate, UserUpdate, UserResponse
│   │   ├── category.py                # CategoryCreate, CategoryResponse
│   │   ├── product.py                 # ProductCreate, ProductFilter, ProductResponse
│   │   └── dashboard.py               # DashboardOverviewResponse, RevenueStats
│   │
│   ├── services/                      # [TẦNG BUSINESS LOGIC - NGHIỆP VỤ]
│   │   ├── category_service.py
│   │   ├── product_service.py
│   │   └── dashboard_service.py
│   │
│   └── routers/                       # [TẦNG CONTROLLER / API ENDPOINTS]
│       ├── api_router.py              # Gom toàn bộ router con lại 1 chỗ
│       ├── auth.py
│       ├── categories.py
│       ├── products.py
│       └── dashboard.py
│
├── .env                               # File chứa secret keys, db credentials
├── .env.example
├── pyproject.toml                     # Cấu hình dependencies & uv package manager
└── main.py                            # Entry point khởi chạy ứng dụng FastAPI
```

---

## 2. Chuẩn Hóa API Response & Phân Trang (Standard API Response & Pagination)

### 2.1. Wrapper Trả Về Dữ Liệu Đơn Lẻ (`app/core/response.py`)
Mọi API trả về thành công đều được bọc trong class Generic `ApiResponse[T]`:

```python
# app/core/response.py
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    """Chuẩn hóa cấu trúc trả về cho toàn bộ API đơn lẻ"""
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
```

### 2.2. Schema Phân Trang & Helper (`app/core/pagination.py`)
**Tất cả các API trả về danh sách** (`/products`, `/admin/products`, `/admin/categories`, `/orders`...) bắt buộc phải hỗ trợ phân trang:

```python
# app/core/pagination.py
import math
from typing import Generic, TypeVar, List
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginationParams(BaseModel):
    """Tham số Query đầu vào chuẩn cho phân trang"""
    page: int = Field(default=1, ge=1, description="Trang hiện tại (bắt đầu từ 1)")
    page_size: int = Field(default=10, ge=1, le=100, description="Số lượng mục mỗi trang (1-100)")

class PaginatedResponse(BaseModel, Generic[T]):
    """Cấu trúc dữ liệu trả về cho danh sách có phân trang"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

def paginate_result(items: List[T], total: int, page: int, page_size: int) -> PaginatedResponse[T]:
    """Hàm tiện ích gom nhóm dữ liệu và tính total_pages"""
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
```

#### Cấu trúc JSON Response trả về danh sách phân trang:
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

## 3. Xử Lý Ngoại Lệ & Bắt Lỗi Toàn Cục (Custom Exceptions & Global Handlers)

* **Tuyệt đối không trả về chuỗi text thuần túy khi có lỗi**.
* Mọi lỗi nghiệp vụ (Không tìm thấy, sai mật khẩu, trùng slug, danh mục còn sản phẩm, hết hàng,...) bắt buộc phải raise **Custom Exception** kế thừa từ `AppException`.

### 3.1. Định nghĩa Exception & Global Handler (`app/core/exceptions.py`)
```python
# app/core/exceptions.py
from typing import Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

class AppException(Exception):
    """Exception cha chứa mã lỗi HTTP và thông điệp chuẩn"""
    def __init__(self, status_code: int, message: str, error_code: str = "BUSINESS_ERROR"):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        super().__init__(message)

class NotFoundException(AppException):
    """Ngoại lệ khi không tìm thấy tài nguyên (404 Not Found)"""
    def __init__(self, resource: str, id_or_slug: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"{resource} \x27{id_or_slug}\x27 không tồn tại",
            error_code="NOT_FOUND"
        )

class DuplicateException(AppException):
    """Ngoại lệ khi dữ liệu bị trùng lặp (400 Bad Request / 409 Conflict)"""
    def __init__(self, field: str, value: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=f"{field} \x27{value}\x27 đã tồn tại trong hệ thống",
            error_code="DUPLICATE_ENTRY"
        )

def register_exception_handlers(app: FastAPI):
    """Đăng ký bắt lỗi toàn cục vào instance FastAPI"""
    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error_code": exc.error_code,
                "message": exc.message,
                "data": None
            }
        )
```

### 3.2. Bảng Ánh Xạ HTTP Status Code Chuẩn

| HTTP Status Code | Khi nào sử dụng? |
| :--- | :--- |
| **`200 OK`** | Đọc, tìm kiếm, cập nhật dữ liệu thành công. |
| **`201 Created`** | Tạo mới tài nguyên thành công (Tạo đơn hàng, thêm sản phẩm, đăng ký). |
| **`400 Bad Request`** | Lỗi logic nghiệp vụ (trùng slug, dữ liệu không hợp lệ, giỏ hàng trống). |
| **`401 Unauthorized`** | Chưa đăng nhập hoặc Token JWT không hợp lệ / hết hạn. |
| **`403 Forbidden`** | Không có quyền truy cập (Người dùng thường cố truy cập route Admin). |
| **`404 Not Found`** | Không tìm thấy tài nguyên theo ID hoặc Slug. |
| **`422 Unprocessable Entity`** | Lỗi Schema Validation tự động từ Pydantic V2. |
| **`500 Internal Server Error`** | Sự cố hệ thống nội bộ (Tự động log stacktrace qua Global Exception Handler). |

---

## 4. Bảo Mật, Whitelist CORS & Phân Quyền (Security, CORS & RBAC)

> **So sánh với Spring Boot**: Trong Spring Boot bạn dùng `SecurityConfig.java` với `.requestMatchers("/public/**").permitAll()`. Trong FastAPI bạn dùng **CORS Middleware** kết hợp với **FastAPI Dependencies (`Depends`)**.

### 4.1. Cấu hình Whitelist CORS & Exception Handler (`main.py`)
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exceptions import register_exception_handlers
from app.routers.api_router import api_router

app = FastAPI(title="ShopApp API", version="1.0.0")

# Whitelist các domain Frontend được phép truy cập
origins = [
    "http://localhost:3000",        # Next.js local dev
    "https://your-production-app.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký bắt lỗi tập trung
register_exception_handlers(app)

# Gắn toàn bộ router
app.include_router(api_router, prefix="/api")
```

### 4.2. Phân Quyền Theo Endpoint Bằng Dependencies (`app/core/deps.py`)
```python
# app/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import verify_jwt_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Dependency trích xuất User từ JWT Header"""
    user = verify_jwt_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn hoặc không hợp lệ"
        )
    return user

def require_role(required_role: str):
    """Dependency kiểm tra quyền Admin hoặc User"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền thực hiện hành động này"
            )
        return current_user
    return role_checker
```

### 4.3. Quy Tắc Gắn Quyền Vào Router:

| Loại Endpoint | Cơ chế bảo vệ | Ví dụ Router |
| :--- | :--- | :--- |
| **Công khai (Public)** | **Không truyền `Depends(get_current_user)`** (Ai cũng xem được). | `@router.get("/products")`, `@router.get("/categories")` |
| **Đã Đăng Nhập (Authenticated)** | Gắn `current_user: User = Depends(get_current_user)`. | `@router.get("/users/me")`, `@router.post("/orders")` |
| **Quản Trị Viên (Admin Only)** | Gắn `dependencies=[Depends(require_role("ADMIN"))]`. | `@router.post("/admin/products")`, `@router.get("/admin/statistic")` |

---

## 5. Văn Hóa Viết Mã & Validation Pydantic V2

1. **Chú thích luồng nghiệp vụ**: Mọi hàm xử lý nghiệp vụ tại `services/` và `routers/` bắt buộc comment từng bước (`# Bước 1: ...`, `# Bước 2: ...`).
2. **Type Hints đầy đủ**: 100% tham số và giá trị trả về có Type Hints.
3. **Validation Pydantic V2**:
   - **Tiền tệ**: Dùng `Decimal`, `gt=0` (không dùng float).
   - **Tồn kho**: `ge=0`.
   - **Chuỗi văn bản**: Validate `min_length`, `max_length`, tự động `.strip()`.
   - **Slug**: Kiểm tra duy nhất trước khi lưu DB.
