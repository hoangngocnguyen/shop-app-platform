from pydantic import BaseModel, ConfigDict, Field


class CategoryResponse(BaseModel):
    """Schema đại diện cho thông tin danh mục sản phẩm."""

    category_id: int = Field(
        ...,
        description="Mã định danh duy nhất của danh mục (Khóa chính)",
        examples=[1],
    )
    category_name: str = Field(
        ...,
        description="Tên hiển thị của danh mục sản phẩm",
        examples=["Điện thoại"],
    )
    parent_id: int | None = Field(
        default=None,
        description="Mã danh mục cha (dành cho danh mục phân cấp đa tầng, null nếu là danh mục gốc)",
        examples=[None],
    )
    slug: str = Field(
        ...,
        description="Đường dẫn tĩnh thân thiện với SEO",
        examples=["dien-thoai"],
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "category_id": 1,
                "category_name": "Điện thoại",
                "parent_id": None,
                "slug": "dien-thoai",
            }
        },
    )
