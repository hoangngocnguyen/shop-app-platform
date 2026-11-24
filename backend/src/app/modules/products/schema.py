from decimal import Decimal
from typing import Any
from pydantic import BaseModel, ConfigDict, Field, model_validator

from src.app.modules.categories.schema import CategoryResponse


# ==============================================================================
# 1. SCHEMAS CHO PHÂN HỆ CLIENT / PUBLIC PRODUCTS & BASE
# ==============================================================================
class ProductBase(BaseModel):
    """Các trường thông tin chung của sản phẩm (không chứa số lượng tồn kho chi tiết)."""

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
    image_public_id: str | None = Field(
        default=None,
        description="Public ID của hình ảnh trên Cloudinary",
        examples=["shop-app-platform/products/macbook_xyz"],
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


class PublicProductResponse(ProductBase):
    """Schema sản phẩm trả về phía Khách hàng (chỉ báo còn hàng hay hết hàng, ẩn quantity)."""

    in_stock: bool = Field(
        default=False,
        description="Trạng thái tồn kho: true nếu còn hàng, false nếu hết hàng",
        examples=[True],
    )

    @model_validator(mode="before")
    @classmethod
    def compute_in_stock(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "in_stock" not in data:
                data["in_stock"] = (data.get("quantity") or 0) > 0
            return data

        # ORM object (SQLAlchemy Product): chuyển sang dict để không lộ field quantity
        qty = getattr(data, "quantity", 0) or 0
        payload = {
            field_name: getattr(data, field_name, None)
            for field_name in cls.model_fields
            if field_name != "in_stock"
        }
        payload["in_stock"] = qty > 0
        return payload


class PublicProductDetailResponse(PublicProductResponse):
    """Schema chi tiết sản phẩm phía Khách hàng kèm thông tin danh mục cha (ẩn quantity)."""

    category: CategoryResponse | None = Field(
        default=None,
        description="Thông tin danh mục mà sản phẩm này thuộc về",
    )


class ProductResponse(ProductBase):
    """Schema đầy đủ sản phẩm dùng cho Admin (bao gồm số lượng tồn kho quantity)."""

    quantity: int = Field(
        default=0,
        description="Số lượng sản phẩm còn lại trong kho",
        examples=[50],
    )


class ProductDetailResponse(ProductResponse):
    """Schema chi tiết sản phẩm dùng cho Admin kèm thông tin danh mục cha."""

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
    image_public_id: str | None = Field(
        default=None,
        max_length=255,
        description="Public ID của ảnh trên Cloudinary (nếu đã upload qua /media/upload)",
        examples=["shop-app-platform/products/iphone15_xyz"],
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
    image_public_id: str | None = Field(
        default=None,
        max_length=255,
        description="Public ID mới của ảnh trên Cloudinary",
        examples=["shop-app-platform/products/iphone15_new"],
    )
    description: str | None = Field(default=None)


class BulkDeleteProductRequest(BaseModel):
    """Schema tiếp nhận danh sách ID sản phẩm cần xóa hàng loạt."""

    product_ids: list[int] = Field(
        ...,
        min_length=1,
        description="Danh sách các ID sản phẩm cần xóa",
        examples=[[10, 11, 12]],
    )
