from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProductAddForm(BaseModel):
    imageSrc: HttpUrl = Field(..., max_length=500)
    productName: str = Field(..., min_length=1, max_length=256)
    quantity: int = Field(..., ge=0)
    categoryId: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    description: str | None = None
    origin: str | None = None
    brand: str | None = None


class ProductUpdateForm(ProductAddForm):
    salePrice: Decimal = Field(..., gt=0)


class ProductPatchForm(BaseModel):
    imageSrc: HttpUrl | None = Field(default=None, max_length=500)
    productName: str | None = Field(default=None, min_length=1, max_length=256)
    quantity: int | None = Field(default=None, ge=0)
    categoryId: int | None = Field(default=None, gt=0)
    price: Decimal | None = Field(default=None, gt=0)
    salePrice: Decimal | None = Field(default=None, gt=0)
    description: str | None = None
    origin: str | None = None
    brand: str | None = None


class ProductDetailResponse(BaseModel):
    id: int
    imageSrc: str | None = None
    productName: str
    quantity: int
    categoryId: int
    price: Decimal
    salePrice: Decimal | None = None
    description: str | None = None
    origin: str | None = None
    brand: str | None = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)