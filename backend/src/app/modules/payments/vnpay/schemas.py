from pydantic import BaseModel, ConfigDict, Field


class CreatePaymentRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Số tiền thanh toán (VND)")
    order_info: str = Field(..., min_length=1, description="Thông tin đơn hàng")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "amount": 500000,
                "order_info": "Thanh toán đơn hàng #123",
            }
        }
    )


class CreatePaymentResponse(BaseModel):
    payment_url: str = Field(..., description="URL thanh toán VNPay đã được ký")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
            }
        }
    )


class PaymentResultResponse(BaseModel):
    status: str = Field(..., description="Trạng thái giao dịch")
    order_id: str | None = Field(default=None, description="Mã đơn hàng")
    amount: float | None = Field(default=None, description="Số tiền thực tế")
    response_code: str | None = Field(default=None, description="Mã phản hồi VNPay")
    message: str | None = Field(default=None, description="Thông báo lỗi nếu có")
    code: str | None = Field(default=None, description="Mã lỗi nếu có")


class IPNResponse(BaseModel):
    RspCode: str = Field(..., description="Mã phản hồi của IPN")
    Message: str = Field(..., description="Thông điệp phản hồi")
