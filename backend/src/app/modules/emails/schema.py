from decimal import Decimal
from typing import Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmailItemSummary(BaseModel):
    """Mô hình tóm tắt thông tin sản phẩm trong email đơn hàng."""

    product_name: str = Field(..., description="Tên sản phẩm", examples=["Áo thun nam Cotton"])
    variant_info: str | None = Field(None, description="Thông tin biến thể", examples=["Màu đen / Size L"])
    quantity: int = Field(..., gt=0, description="Số lượng", examples=[2])
    unit_price: Decimal = Field(..., description="Đơn giá (VNĐ)", examples=[199000])
    subtotal: Decimal = Field(..., description="Thành tiền (VNĐ)", examples=[398000])

    model_config = ConfigDict(from_attributes=True)


class SendEmailPayload(BaseModel):
    """Payload gửi email nội bộ."""

    to_email: EmailStr
    subject: str
    template_name: str
    context: dict[str, Any] = Field(default_factory=dict)


class TestEmailRequest(BaseModel):
    """DTO cho endpoint kiểm tra cấu hình kết nối SMTP."""

    to_email: EmailStr = Field(..., description="Email nhận thư thử nghiệm", examples=["tester@example.com"])
    subject: str = Field(
        default="[Shop App Platform] Kiểm tra kết nối gửi email thành công",
        description="Tiêu đề email",
    )
    content: str = Field(
        default="Hệ thống gửi email qua Google Gmail SMTP đã được kết nối và hoạt động chính xác!",
        description="Nội dung kiểm tra",
    )


class TestEmailResponse(BaseModel):
    """Kết quả gửi thử nghiệm."""

    success: bool
    message: str
