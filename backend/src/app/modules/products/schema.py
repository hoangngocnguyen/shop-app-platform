from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ProductResponse(BaseModel):
    """Schema đại diện cho thông tin chi tiết của một sản phẩm trả về từ hệ thống."""

    product_id: int = Field(
        ...,
        description="Mã định danh duy nhất của sản phẩm (Khóa chính)",
        examples=[1],
    )
    product_name: str = Field(
        ...,
        description="Tên đầy đủ của sản phẩm",
        examples=["Xiaozhubangchu keycaps Mario bàn phím cơ 124 phím"],
    )
    price: Decimal = Field(
        ...,
        description="Giá niêm yết gốc của sản phẩm (VNĐ)",
        examples=[301000.00],
    )
    discount_percent: int | None = Field(
        default=None,
        description="Phần trăm giảm giá (nếu có)",
        examples=[27],
    )
    sale_price: Decimal | None = Field(
        default=None,
        description="Giá sau khi đã áp dụng khuyến mãi giảm giá (VNĐ)",
        examples=[219730.00],
    )
    quantity: int = Field(
        default=0,
        description="Số lượng sản phẩm còn lại trong kho hàng",
        examples=[73],
    )
    rating: Decimal | None = Field(
        default=Decimal("0.0"),
        description="Điểm đánh giá trung bình từ người mua (từ 0.0 đến 5.0)",
        examples=[4.3],
    )
    sold: int = Field(
        default=0,
        description="Tổng số lượng sản phẩm đã bán thành công",
        examples=[456],
    )
    brand: str | None = Field(
        default=None,
        description="Thương hiệu sản xuất",
        examples=["XiaoZhu"],
    )
    origin: str | None = Field(
        default=None,
        description="Xuất xứ của sản phẩm",
        examples=["Trung Quốc"],
    )
    image_src: str | None = Field(
        default=None,
        description="Đường dẫn URL hình ảnh sản phẩm lưu trữ trên Cloudinary CDN",
        examples=["https://res.cloudinary.com/dojey70x3/image/upload/v1754451108/dc276163.png"],
    )
    description: str | None = Field(
        default=None,
        description="Mô tả chi tiết và thông số kỹ thuật của sản phẩm",
        examples=["Bộ keycap Xiaozhubangchu Mario 124 phím chất liệu PBT cao cấp..."],
    )
    category_id: int | None = Field(
        default=None,
        description="Mã danh mục trực thuộc mà sản phẩm này thuộc về",
        examples=[18],
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "product_id": 1,
                "product_name": "Xiaozhubangchu keycaps Mario",
                "price": 301000.00,
                "discount_percent": 27,
                "sale_price": 219730.00,
                "quantity": 73,
                "rating": 4.3,
                "sold": 456,
                "brand": "XiaoZhu",
                "origin": "Trung Quốc",
                "image_src": "https://res.cloudinary.com/.../img.png",
                "description": "Chi tiết sản phẩm...",
                "category_id": 18,
            }
        },
    )
