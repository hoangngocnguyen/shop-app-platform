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


# ==============================================================================
# 2. SCHEMAS CHO PHÂN HỆ ADMIN CATEGORIES
# ==============================================================================
class CategoryCreate(BaseModel):
    """
    Schema tiếp nhận dữ liệu khi Admin tạo danh mục mới.
    """

    category_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Tên danh mục sản phẩm mới",
        examples=["Điện thoại thông minh"],
    )
    parent_id: int | None = Field(
        default=None,
        description="Mã danh mục cha (null nếu là danh mục gốc)",
        examples=[None],
    )


class CategoryUpdate(BaseModel):
    """
    Schema tiếp nhận dữ liệu khi Admin cập nhật danh mục.
    """

    category_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Tên danh mục sản phẩm mới",
        examples=["Điện thoại & Tablet"],
    )
    parent_id: int | None = Field(
        default=None,
        description="Mã danh mục cha mới (null nếu chuyển thành danh mục gốc)",
        examples=[None],
    )


class CategoryStatsDTO(CategoryResponse):
    """
    Schema trả về cho trang quản trị danh mục kèm số lượng sản phẩm.
    """

    product_count: int = Field(
        default=0,
        description="Số lượng sản phẩm thuộc danh mục này",
        examples=[25],
    )


class BulkDeleteCategoryRequest(BaseModel):
    """
    Schema yêu cầu xóa hàng loạt danh mục sản phẩm.
    """

    category_ids: list[int] = Field(
        ...,
        min_length=1,
        description="Danh sách các ID danh mục cần xóa",
        examples=[[1, 2, 5]],
    )
