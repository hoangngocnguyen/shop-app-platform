from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

from src.app.modules.categories.schema import CategoryResponse


# ==============================================================================
# 1. SCHEMAS CHO PHÂN HỆ CLIENT / PUBLIC PRODUCTS
# ==============================================================================
class ProductResponse(BaseModel):
    """Schema đại diện cho thông tin tóm tắt sản phẩm trả về phía Client."""

    product_id: int = Field(
        ...,
        description="Mã định danh duy nhất của sản phẩm (Khóa chính)",
        examples=[1],
    )
    product_name: str = Field(
        ...,
        description="Tên đầy đủ của sản phẩm",
        examples=["Apple MacBook Pro 14 M3"],
    )
    price: Decimal = Field(
        ...,
        description="Giá niêm yết gốc của sản phẩm (VNĐ)",
        examples=[Decimal("39990000.00")],
    )
    discount_percent: int | None = Field(
        default=None,
        description="Phần trăm giảm giá",
        examples=[10],
    )
    sale_price: Decimal | None = Field(
        default=None,
        description="Giá sau khi giảm giá khuyến mãi (VNĐ)",
        examples=[Decimal("35990000.00")],
    )
    quantity: int = Field(
        default=0,
        description="Số lượng sản phẩm còn lại trong kho",
        examples=[50],
    )
    rating: Decimal | None = Field(
        default=Decimal("0.0"),
        description="Điểm đánh giá trung bình (0.0 - 5.0)",
        examples=[Decimal("4.8")],
    )
    sold: int = Field(
        default=0,
        description="Tổng số lượng sản phẩm đã bán",
        examples=[120],
    )
    brand: str | None = Field(
        default=None,
        description="Thương hiệu sản xuất",
        examples=["Apple"],
    )
    origin: str | None = Field(
        default=None,
        description="Xuất xứ của sản phẩm",
        examples=["Chính hãng VN/A"],
    )
    image_src: str | None = Field(
        default=None,
        description="Đường dẫn URL hình ảnh sản phẩm trên Cloudinary",
        examples=["https://res.cloudinary.com/.../macbook.png"],
    )
    description: str | None = Field(
        default=None,
        description="Mô tả chi tiết của sản phẩm",
        examples=["MacBook Pro 14 inch trang bị chip M3 cực mạnh..."],
    )
    category_id: int | None = Field(
        default=None,
        description="Mã danh mục trực thuộc",
        examples=[1],
    )

    model_config = ConfigDict(from_attributes=True)


class ProductDetailResponse(ProductResponse):
    """Schema chi tiết sản phẩm kèm thông tin danh mục cha."""

    category: CategoryResponse | None = Field(
        default=None,
        description="Thông tin danh mục mà sản phẩm này thuộc về",
    )


class PriceOptionDTO(BaseModel):
    """Schema đại diện cho một dải giá lọc nhanh."""

    key: str = Field(description="Mã định danh dải giá", examples=["duoi-500k"])
    label: str = Field(description="Tên hiển thị trên giao diện", examples=["Dưới 500.000đ"])
    min: Decimal = Field(description="Giá tối thiểu trong dải", examples=[Decimal("0")])
    max: Decimal | None = Field(
        default=None, description="Giá tối đa trong dải (null nếu không giới hạn trên)", examples=[Decimal("500000")]
    )


# ==============================================================================
# 2. SCHEMAS CHO PHÂN HỆ ADMIN PRODUCTS
# ==============================================================================
class ProductCreate(BaseModel):
    """Schema tiếp nhận dữ liệu khi Admin tạo mới sản phẩm."""

    product_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Tên sản phẩm mới",
        examples=["iPhone 15 Pro Max 256GB"],
    )
    category_id: int = Field(
        ...,
        description="Mã danh mục sản phẩm trực thuộc",
        examples=[1],
    )
    price: Decimal = Field(
        ...,
        gt=Decimal("0"),
        description="Giá bán gốc (phải lớn hơn 0)",
        examples=[Decimal("29990000.00")],
    )
    sale_price: Decimal | None = Field(
        default=None,
        gt=Decimal("0"),
        description="Giá bán khuyến mãi (phải nhỏ hơn hoặc bằng giá gốc)",
        examples=[Decimal("28490000.00")],
    )
    quantity: int = Field(
        default=0,
        ge=0,
        description="Số lượng nhập kho ban đầu",
        examples=[50],
    )
    brand: str | None = Field(
        default=None,
        max_length=255,
        description="Thương hiệu sản phẩm",
        examples=["Apple"],
    )
    origin: str | None = Field(
        default=None,
        max_length=255,
        description="Xuất xứ sản phẩm",
        examples=["Chính hãng VN/A"],
    )
    image_src: str | None = Field(
        default=None,
        max_length=255,
        description="URL hình ảnh sản phẩm",
        examples=["https://res.cloudinary.com/.../iphone15.png"],
    )
    description: str | None = Field(
        default=None,
        description="Mô tả chi tiết dạng HTML hoặc Markdown",
        examples=["<p>Mô tả chi tiết sản phẩm...</p>"],
    )


class ProductUpdate(BaseModel):
    """Schema tiếp nhận dữ liệu khi Admin cập nhật sản phẩm."""

    product_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Tên sản phẩm mới",
    )
    category_id: int | None = Field(
        default=None,
        description="Mã danh mục mới",
    )
    price: Decimal | None = Field(
        default=None,
        gt=Decimal("0"),
        description="Giá bán gốc mới",
    )
    sale_price: Decimal | None = Field(
        default=None,
        gt=Decimal("0"),
        description="Giá bán khuyến mãi mới",
    )
    quantity: int | None = Field(
        default=None,
        ge=0,
        description="Số lượng tồn kho mới",
    )
    brand: str | None = Field(default=None, max_length=255)
    origin: str | None = Field(default=None, max_length=255)
    image_src: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None)


class BulkDeleteProductRequest(BaseModel):
    """Schema tiếp nhận danh sách ID sản phẩm cần xóa hàng loạt."""

    product_ids: list[int] = Field(
        ...,
        min_length=1,
        description="Danh sách các ID sản phẩm cần xóa",
        examples=[[10, 11, 12]],
    )
