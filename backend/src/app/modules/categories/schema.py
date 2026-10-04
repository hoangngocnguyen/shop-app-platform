from pydantic import BaseModel, ConfigDict, Field


# ==============================================================================
# 1. SCHEMAS CHO PHÂN HỆ CLIENT / PUBLIC CATEGORIES
# ==============================================================================
class CategoryResponse(BaseModel):
    """
    Schema đại diện cho thông tin danh mục sản phẩm chuẩn hóa.
    """

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
        description="Mã danh mục cha (null nếu là danh mục gốc)",
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


class CategoryTreeResponse(CategoryResponse):
    """
    Schema danh mục dạng cây đa cấp (chứa danh sách danh mục con).
    """

    children: list[CategoryResponse] = Field(
        default_factory=list,
        description="Danh sách danh mục con trực thuộc",
    )
