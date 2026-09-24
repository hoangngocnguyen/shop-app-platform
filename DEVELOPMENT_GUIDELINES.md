# Quy Chuẩn Kiến Trúc & Hướng Dẫn Phát Triển (Development & Architecture Guidelines)

> **Dành cho:** Tất cả các thành viên trong nhóm (Developers) và AI Coding Agents.  
> **Mục đích:** Thiết lập chuẩn mực kiến trúc phần mềm đồng nhất, sạch đẹp, dễ mở rộng (Scalable), chuẩn hóa tài liệu Swagger OpenAPI, xử lý lỗi tập trung và cấu trúc code chuyên nghiệp tương đương các dự án Enterprise (Java Spring Boot / NestJS).

---

## 1. So Sánh Kiến Trúc (Java Spring Boot ⟷ FastAPI)

Để các lập trình viên quen thuộc với Java Spring Boot hoặc Node.js dễ dàng làm việc, dưới đây là bảng ánh xạ các thành phần kiến trúc tương đương:

| Thành phần kiến trúc | Java Spring Boot | Python FastAPI (Chuẩn hóa của dự án) |
| :--- | :--- | :--- |
| **Routing & Giao tiếp HTTP** | `@RestController`, `@RequestMapping` | `@router = APIRouter(prefix="...", tags=["..."])` |
| **Mô tả Swagger / OpenAPI** | `@Operation(summary=..., description=...)`, `@Tag` | `@router.get("/", summary="...", description="...", response_description="...")` |
| **Khai báo mã lỗi Swagger** | `@ApiResponses({ @ApiResponse(responseCode="404") })` | `responses={404: {"model": ErrorResponse, "description": "..."}}` |
| **Data Transfer Object (DTO)** | Java Class / Record + Jackson + `@Valid` | **Pydantic Model V2** (`BaseModel`, `Field(...)`) |
| **Chuẩn hóa cấu trúc trả về** | `ResponseEntity<ApiResponse<T>>` | `BaseResponse[T]` hoặc `DataResponse[T]` Generic Schema |
| **Xử lý lỗi tập trung** | `@ControllerAdvice` + `@ExceptionHandler` | `@app.exception_handler(AppException)` tập trung |
| **Tầng Nghiệp vụ (Business)** | `@Service class ProductService` | `class ProductService` (Service Layer độc lập) |
| **Tầng Truy vấn Dữ liệu** | Spring Data JPA / `ProductRepository` | `class ProductRepository` hoặc CRUD helper |
| **Entity / ORM** | `@Entity class Product` (Hibernate) | `class Product(Base)` (SQLAlchemy 2.0 `Mapped`) |

---

## 2. Chuẩn Hóa Cấu Trúc Thư Mục (Layered / Clean Architecture)

Để tránh việc project phình to và trở nên lộn xộn, toàn bộ Backend phải tuân thủ nghiêm ngặt mô hình phân tầng theo từng **Domain Module**:

```text
backend/
├── src/
│   └── app/
│       ├── core/                      # Các cấu hình dùng chung toàn hệ thống
│       │   ├── config.py              # Đọc biến môi trường (.env, Pydantic Settings)
│       │   ├── database.py            # Engine, SessionLocal, Base, get_db()
│       │   ├── exceptions.py          # Custom Business Exceptions (AppException, NotFoundException...)
│       │   ├── responses.py           # Chuẩn hóa BaseResponse, ErrorResponse
│       │   └── security.py            # JWT, Hash Password, OAuth2 dependencies
│       │
│       ├── modules/                   # Các module nghiệp vụ (Tách biệt theo Domain)
│       │   ├── products/
│       │   │   ├── __init__.py
│       │   │   ├── model.py           # SQLAlchemy ORM Model (Ánh xạ bảng DB)
│       │   │   ├── schema.py          # Pydantic Schemas (Request/Response DTOs)
│       │   │   ├── repository.py      # Tầng truy vấn Database (CRUD functions)
│       │   │   ├── service.py         # Tầng xử lý logic nghiệp vụ (Business Logic)
│       │   │   └── router.py          # Tầng Controller (Endpoints & Swagger Annotations)
│       │   │
│       │   ├── categories/            # Tương tự như products
│       │   ├── users/
│       │   ├── orders/
│       │   └── carts/
│       │
│       └── main.py                    # Entrypoint khởi tạo FastAPI App, gắn Middleware & Handlers
│
├── alembic/                           # Database Migrations
├── scripts/                           # Database Seeders
└── pyproject.toml                     # Dependencies & Tooling configs
```

---

## 3. Quy Chuẩn Viết Code Chuẩn Enterprise

### 3.1. Chuẩn hóa Schema & DTO (Pydantic V2)
- Luôn sử dụng `Field(...)` để thêm `description`, `examples`, và các ràng buộc validation (`gt`, `ge`, `min_length`, `max_length`).
- Response DTO phải luôn có `model_config = ConfigDict(from_attributes=True)`.

```python
# Ví dụ: modules/products/schema.py
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    """Schema cơ sở chứa các trường thông tin chung của sản phẩm."""
    product_name: str = Field(..., min_length=2, max_length=255, description="Tên đầy đủ của sản phẩm", examples=["iPhone 16 Pro Max"])
    price: Decimal = Field(..., gt=0, description="Giá niêm yết của sản phẩm (VNĐ)", examples=[34990000.00])
    quantity: int = Field(default=0, ge=0, description="Số lượng tồn kho", examples=[100])
    category_id: int | None = Field(None, description="Mã danh mục sản phẩm trực thuộc", examples=[1])


class ProductCreateRequest(ProductBase):
    """DTO cho Request tạo mới sản phẩm."""
    pass


class ProductResponse(ProductBase):
    """DTO cho Response trả về thông tin sản phẩm."""
    product_id: int = Field(..., description="Mã định danh duy nhất của sản phẩm", examples=[1])
    sale_price: Decimal | None = Field(None, description="Giá sau khuyến mãi", examples=[33590000.00])
    rating: Decimal | None = Field(Decimal("0.0"), description="Điểm đánh giá trung bình từ 0.0 đến 5.0", examples=[4.9])
    sold: int = Field(0, description="Số lượng sản phẩm đã bán", examples=[150])

    model_config = ConfigDict(from_attributes=True)
```

---

### 3.2. Chuẩn hóa Router & Mô tả Swagger OpenAPI
- Tuyệt đối **không viết truy vấn database trực tiếp trong Router**. Router chỉ nhận request $\rightarrow$ gọi Service $\rightarrow$ trả về DTO.
- Phải khai báo đầy đủ `summary`, `description`, `response_description`, `status_code`, và `responses` cho các mã lỗi tiềm ẩn (404, 400, 409).

```python
# Ví dụ: modules/products/router.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.products.schema import ProductResponse
from src.app.modules.products.service import ProductService

router = APIRouter(prefix="/products", tags=["Products - Quản lý Sản phẩm"])


@router.get(
    "/",
    response_model=list[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách tất cả sản phẩm",
    description="Truy vấn toàn bộ danh sách sản phẩm hiện có trong hệ thống, bao gồm giá bán, tồn kho và danh mục.",
    response_description="Danh sách sản phẩm được tìm thấy.",
)
def get_products(
    db: Session = Depends(get_db),
    service: ProductService = Depends(ProductService),
) -> list[ProductResponse]:
    """
    Endpoint lấy danh sách sản phẩm:
    - **db**: Session kết nối cơ sở dữ liệu.
    - **service**: Service xử lý nghiệp vụ sản phẩm.
    """
    return service.get_all_products(db)
```

---

### 3.3. Chuẩn hóa Service Layer & Error Handling
Tách biệt toàn bộ logic kiểm tra hợp lệ, tính toán vào tầng Service. Khi có lỗi nghiệp vụ, ném ra `HTTPException` chuẩn:

```python
# Ví dụ: modules/products/service.py
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from src.app.modules.products.model import Product


class ProductService:
    """Service xử lý logic nghiệp vụ cho sản phẩm."""

    def get_all_products(self, db: Session) -> list[Product]:
        return db.query(Product).all()

    def get_product_by_id(self, db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sản phẩm với ID {product_id} không tồn tại trong hệ thống.",
            )
        return product
```

---

## 4. Quy Chuẩn Comment & Clean Code (Code Formatting)

1. **Docstring chuẩn Google Style**: Mọi hàm, class và endpoint đều phải có docstring giải thích mục đích, tham số đầu vào (`Args`) và kết quả trả về (`Returns`).
2. **Type Hinting 100%**: Mọi tham số và giá trị trả về của hàm bắt buộc phải có Type Hint (ví dụ: `def get_user(db: Session, user_id: uuid.UUID) -> User:`).
3. **Comment giải thích "TẠI SAO" (Why)** thay vì mô tả "ĐANG LÀM GÌ" (What).
4. **Không commit code thừa**: Xóa các file rác, import không sử dụng (`unused imports`), tuyệt đối không commit file bytecode `.pyc` hoặc thư mục `__pycache__`.

---

## 5. Checklist Bắt Buộc Trước Khi Commit Code (Definition of Done)

Trước khi tạo Pull Request hoặc hoàn thành một tính năng mới:
- [ ] Model đã khai báo chuẩn SQLAlchemy 2.0 (`Mapped`, `mapped_column`, quan hệ `relationship`).
- [ ] Model đã được import vào `backend/alembic/env.py`.
- [ ] Migration đã được tạo qua `alembic revision --autogenerate` và test `alembic upgrade head` thành công.
- [ ] Pydantic Schemas đã có đầy đủ `description` và `examples` cho từng trường.
- [ ] Router đã có `summary`, `description`, `status_code` hiển thị đẹp mắt trên Swagger UI `/docs`.
- [ ] Không có query trực tiếp trong Router; logic đã nằm trong Service.
- [ ] Đã chạy linter / formatter (Ruff hoặc Black) không có lỗi cú pháp.
