from pydantic import BaseModel, Field, ConfigDict


class CategoryCreate(BaseModel):
    categoryName: str = Field(..., min_length=1, max_length=256)
    slug: str = Field(..., min_length=1, max_length=256)
    description: str | None = None


class CategoryUpdate(BaseModel):
    categoryName: str = Field(..., min_length=1, max_length=256)
    slug: str = Field(..., min_length=1, max_length=256)
    description: str | None = None


class CategoryResponse(BaseModel):
    id: int
    categoryName: str = Field(validation_alias="category_name")
    slug: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CategoryListResponse(BaseModel):
    content: list[CategoryResponse]
    page: int
    size: int
    totalElements: int
    totalPages: int