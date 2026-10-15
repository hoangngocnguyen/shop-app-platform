from decimal import Decimal

from pydantic import BaseModel, Field

from src.app.modules.orders.enums.order_enums import PaymentMethod


class CreatePaymentRequest(BaseModel):
    """Payload khởi tạo thanh toán từ client (chỉ nhận order_id)."""

    order_id: str = Field(
        ...,
        min_length=1,
        description="Mã đơn hàng cần thanh toán",
        examples=["OD123456"],
    )


class CreatePaymentResponse(BaseModel):
    """Dữ liệu phản hồi sau khi khởi tạo thanh toán."""

    order_id: str = Field(..., description="Mã đơn hàng")
    payment_method: PaymentMethod = Field(
        ..., description="Phương thức thanh toán áp dụng của đơn"
    )
    amount: Decimal = Field(..., description="Tổng giá trị đơn hàng cần thanh toán")
    payment_url: str | None = Field(
        default=None, description="URL cổng thanh toán (đối với VNPAY)"
    )
    message: str = Field(..., description="Thông báo trạng thái khởi tạo")
