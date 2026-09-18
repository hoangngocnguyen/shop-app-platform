from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductResponse(BaseModel):
    product_id: int
    product_name: str
    price: Decimal
    discount_percent: int | None = None
    sale_price: Decimal | None = None
    quantity: int
    rating: Decimal | None = None
    sold: int
    brand: str | None = None
    origin: str | None = None
    image_src: str | None = None
    description: str | None = None
    category_id: int | None = None

    model_config = ConfigDict(from_attributes=True)
