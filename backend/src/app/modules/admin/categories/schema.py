from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    categoryName: str = Field(..., min_length=1, max_length=256)


class CategoryUpdate(BaseModel):
    categoryName: str = Field(..., min_length=1, max_length=256)


class CategoryResponse(BaseModel):
    id: int = Field(validation_alias="category_id")
    categoryName: str = Field(validation_alias="category_name")
    slug: str

    model_config = ConfigDict(from_attributes=True)


class CategoryListResponse(BaseModel):
    content: list[CategoryResponse]
    page: int
    size: int
    totalElements: int
    totalPages: int