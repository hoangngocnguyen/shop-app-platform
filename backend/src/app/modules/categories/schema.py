from pydantic import BaseModel, ConfigDict


class CategoryResponse(BaseModel):
    category_id: int
    category_name: str
    parent_id: int | None = None
    slug: str

    model_config = ConfigDict(from_attributes=True)
