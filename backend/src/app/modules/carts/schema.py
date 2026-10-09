
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class CartItemBase(BaseModel):
    product_id: int = Field(..., gt=0, description="ID sản phẩm")
    quantity: int = Field(..., gt=0, description="Số lượng sản phẩm")


class AddToCartRequest(CartItemBase):
    current_url: str | None = Field(
        default=None,
        description="Đường dẫn hiện tại của client",
    )


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Số lượng mới")


class DeleteMultipleCartItemsRequest(BaseModel):
    cart_item_ids: list[int] = Field(
        ...,
        min_length=1,
        description="Danh sách ID mục giỏ hàng cần xóa",
    )


class SyncCartRequest(BaseModel):
    items: list[CartItemBase] = Field(
        default_factory=list,
        description="Danh sách sản phẩm cần đồng bộ",
    )


class CartItemResponse(BaseModel):
    cart_item_id: int
    product_id: int
    product_name: str
    product_image: HttpUrl | None = None
    unit_price: Decimal
    quantity: int
    subtotal: Decimal
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    # Model Cart hiện tại sử dụng Integer làm khóa chính.
    cart_id: int
    items: list[CartItemResponse] = Field(default_factory=list)
    total_quantity: int = Field(..., ge=0)
    total_price: Decimal = Field(..., ge=0)

    model_config = ConfigDict(from_attributes=True)
