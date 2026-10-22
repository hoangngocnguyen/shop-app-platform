from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    model_validator,
)

from src.app.modules.orders.enums.order_enums import CheckoutType

# ==============================================================================
# CHECKOUT SCHEMAS
# ==============================================================================


class BuyNowItem(BaseModel):
    """Thông tin sản phẩm mua ngay (Bắt buộc khi checkout_type = BUY_NOW)."""

    product_id: int = Field(..., ge=1, description="ID sản phẩm cần mua")
    quantity: int = Field(..., ge=1, description="Số lượng mua, tối thiểu 1")

    model_config = ConfigDict(
        json_schema_extra={"example": {"product_id": 101, "quantity": 2}}
    )


class CheckoutPreviewRequest(BaseModel):
    """
    Request Body cho POST /api/v1/checkout/preview
    Stateless: Kiểm tra tính hợp lệ của sản phẩm, tồn kho và đơn giá hiện tại.
    """

    checkout_type: CheckoutType = Field(
        ..., description="Nguồn checkout. Giá trị hỗ trợ: BUY_NOW, CART."
    )
    buy_now_item: BuyNowItem | None = Field(
        default=None,
        description="Thông tin sản phẩm mua ngay. Bắt buộc khi checkout_type = BUY_NOW.",
    )
    cart_item_ids: list[int] | None = Field(
        default=None,
        description="Danh sách ID các mục trong giỏ hàng. Bắt buộc khi checkout_type = CART.",
    )

    @model_validator(mode="after")
    def validate_checkout_requirements(self) -> "CheckoutPreviewRequest":
        if self.checkout_type == CheckoutType.BUY_NOW:
            if not self.buy_now_item:
                raise ValueError(
                    "buy_now_item là bắt buộc khi checkout_type = BUY_NOW."
                )
        elif self.checkout_type == CheckoutType.CART:
            if not self.cart_item_ids or len(self.cart_item_ids) == 0:
                raise ValueError(
                    "cart_item_ids là bắt buộc và không được rỗng khi checkout_type = CART."
                )
            if any(item_id <= 0 for item_id in self.cart_item_ids):
                raise ValueError(
                    "Tất cả ID trong cart_item_ids phải là số nguyên dương (> 0)."
                )
        return self

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "checkout_type": "BUY_NOW",
                "buy_now_item": {"product_id": 101, "quantity": 2},
                "cart_item_ids": None,
            }
        }
    )


class CheckoutItemResponse(BaseModel):
    """Chi tiết từng sản phẩm trong snapshot checkout."""

    product_id: int = Field(..., description="ID sản phẩm")
    product_name: str = Field(..., description="Tên sản phẩm tại thời điểm preview")
    product_image: HttpUrl | None = Field(
        default=None, description="URL hình ảnh đại diện (Nullable)"
    )
    price: Decimal = Field(
        ..., ge=0, description="Đơn giá hiện tại do server truy xuất từ database"
    )
    quantity: int = Field(..., ge=1, description="Số lượng mua")
    total_price: Decimal = Field(
        ..., ge=0, description="Thành tiền, tính bằng price × quantity"
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "product_id": 101,
                "product_name": "Áo Thun Nam Cotton Thấm Hút Mồ Hôi",
                "product_image": "https://example.com/images/shirt.jpg",
                "price": "250000.00",
                "quantity": 2,
                "total_price": "500000.00",
            }
        },
    )


class CheckoutPreviewResponse(BaseModel):
    """
    Response — 200 OK cho:
    - POST /api/v1/checkout/preview
    - POST /api/v1/orders/{order_id}/reorder
    Snapshot hoàn toàn Stateless do server tính toán và trả về cho Client.
    """

    items: list[CheckoutItemResponse] = Field(
        ..., description="Danh sách sản phẩm trong snapshot checkout"
    )
    subtotal: Decimal = Field(
        ...,
        ge=0,
        description="Tổng tiền hàng tạm tính, bằng tổng total_price của các sản phẩm",
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "items": [
                    {
                        "product_id": 101,
                        "product_name": "Áo Thun Nam Cotton Thấm Hút Mồ Hôi",
                        "product_image": "https://example.com/images/shirt.jpg",
                        "price": "250000.00",
                        "quantity": 2,
                        "total_price": "500000.00",
                    }
                ],
                "subtotal": "500000.00",
            }
        },
    )
