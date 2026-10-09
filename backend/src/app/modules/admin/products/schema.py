from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductAddForm(BaseModel):
    productName: str = Field(..., min_length=1, max_length=256)
    quantity: int = Field(..., ge=0)
    categoryId: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    salePrice: Decimal | None = Field(default=None, gt=0)
    description: str | None = None
    origin: str | None = None
    brand: str | None = None


class ProductPatchForm(BaseModel):
    productName: str | None = Field(default=None, min_length=1, max_length=256)
    quantity: int | None = Field(default=None, ge=0)
    categoryId: int | None = Field(default=None, gt=0)
    price: Decimal | None = Field(default=None, gt=0)
    salePrice: Decimal | None = Field(default=None, gt=0)
    description: str | None = None
    origin: str | None = None
    brand: str | None = None


class ProductDetailResponse(BaseModel):
    id: int = Field(validation_alias="product_id")
    imageSrc: str | None = Field(validation_alias="image_src")
    productName: str = Field(validation_alias="product_name")
    quantity: int
    categoryId: int = Field(validation_alias="category_id")
    price: Decimal
    salePrice: Decimal | None = Field(validation_alias="sale_price")
    description: str | None = None
    origin: str | None = None
    brand: str | None = None

    model_config = ConfigDict(from_attributes=True)
