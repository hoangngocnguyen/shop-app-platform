from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from src.app.modules.orders.enums.order_enums import (
    AdminCancelReason,
    CustomerCancelReason,
    PaymentMethod,
    SystemCancelReason,
)


class CancelOrderRequest(BaseModel):
    """Request Body cho khách hàng hủy đơn."""

    reason_code: CustomerCancelReason = Field(
        ...,
        description="Mã lý do hủy chuẩn từ catalog: CHANGE_OF_MIND, CHANGE_SHIPPING_ADDRESS, FOUND_BETTER_PRICE, CHANGE_PAYMENT_METHOD, OTHER",
    )
    custom_reason: str | None = Field(
        default=None,
        max_length=500,
        description="Nội dung giải thích chi tiết (Bắt buộc nếu chọn OTHER)",
    )

    @model_validator(mode="after")
    def validate_other_reason(self) -> "CancelOrderRequest":
        if self.reason_code == CustomerCancelReason.OTHER:
            custom_reason = (
                self.custom_reason.strip() if self.custom_reason is not None else ""
            )
            if not custom_reason:
                raise ValueError("custom_reason là bắt buộc khi chọn lý do OTHER.")
        return self

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "reason_code": "CHANGE_OF_MIND",
                "custom_reason": None,
            }
        }
    )


class AdminCancelOrderRequest(BaseModel):
    """Request Body dành cho admin / shop hủy đơn."""

    reason_code: AdminCancelReason = Field(
        ...,
        description="Mã lý do hủy dành cho Admin: OUT_OF_STOCK, WRONG_PRICE_OR_INFO, CUSTOMER_REQUESTED, SUSPICIOUS_ORDER, OTHER",
    )
    custom_reason: str | None = Field(
        default=None,
        max_length=500,
        description="Ghi chú chi tiết từ nhân viên quản trị",
    )

    @model_validator(mode="after")
    def validate_other_reason(self) -> "AdminCancelOrderRequest":
        if self.reason_code == AdminCancelReason.OTHER:
            custom_reason = (
                self.custom_reason.strip() if self.custom_reason is not None else ""
            )
            if not custom_reason:
                raise ValueError("custom_reason là bắt buộc khi chọn lý do OTHER.")
        return self

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "reason_code": "OUT_OF_STOCK",
                "custom_reason": "Kho tạm thời hết size L của sản phẩm Áo Thun Cotton.",
            }
        }
    )


class SystemCancelOrderRequest(BaseModel):
    """Request Body dành cho hệ thống tự động hủy đơn."""

    reason_code: SystemCancelReason = Field(
        ...,
        description="Mã lý do hủy của hệ thống: PAYMENT_TIMEOUT, CONFIRMATION_TIMEOUT",
    )
    note: str | None = Field(
        default=None,
        description="Mô tả bổ sung nếu có",
    )


class OrderItemPreviewRequest(BaseModel):
    """Chi tiết sản phẩm kèm đơn giá snapshot từ bước preview."""

    product_id: int = Field(..., ge=1, description="ID sản phẩm")
    quantity: int = Field(..., ge=1, description="Số lượng mua, tối thiểu 1")
    price: Decimal = Field(
        ...,
        ge=0,
        description="Đơn giá trong snapshot checkout (dùng để đối chiếu thay đổi giá)",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "product_id": 101,
                "quantity": 2,
                "price": "250000.00",
            }
        }
    )


class CreateOrderRequest(BaseModel):
    """Request Body cho POST /api/v1/orders."""

    items: list[OrderItemPreviewRequest] = Field(
        ...,
        min_length=1,
        description="Danh sách sản phẩm và snapshot giá từ bước preview",
    )
    expected_subtotal: Decimal = Field(
        ...,
        ge=0,
        description="Tổng tiền hàng mà Client nhận được ở bước preview",
    )
    address_id: int = Field(
        ...,
        ge=1,
        description="ID địa chỉ giao hàng thuộc người dùng hiện tại",
    )
    payment_method: PaymentMethod = Field(
        ...,
        description="Phương thức thanh toán: BANK_TRANSFER, VNPAY, COD",
    )
    note: str | None = Field(
        default=None,
        max_length=500,
        description="Ghi chú đơn hàng, tối đa 500 ký tự",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [{"product_id": 101, "quantity": 2, "price": "250000.00"}],
                "expected_subtotal": "500000.00",
                "address_id": 15,
                "payment_method": "COD",
                "note": "Giao hàng trong giờ hành chính, gọi trước 15 phút",
            }
        }
    )
