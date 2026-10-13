from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from src.app.modules.orders.enums.order_enums import (
    CancelledByType,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from src.app.modules.orders.schemas.checkout_schema import CheckoutItemResponse


class OrderCreateResponse(BaseModel):
    """Response — 201 Created cho POST /api/v1/orders."""

    order_id: str = Field(..., description="Mã định danh đơn hàng vừa tạo")
    payment_method: str = Field(..., description="Phương thức thanh toán đã chọn")
    total: Decimal = Field(
        ..., ge=0, description="Tổng tiền đơn hàng do Server tính toán chính thức"
    )
    status: OrderStatus = Field(
        default=OrderStatus.PENDING,
        description="Trạng thái ban đầu của đơn hàng (Mặc định: PENDING)",
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "order_id": "OD261013050123AB12CD",
                "payment_method": "COD",
                "total": "530000.00",
                "status": "PENDING",
            }
        },
    )


class OrderItemSummaryResponse(BaseModel):
    """Chi tiết sản phẩm hiển thị trên card đơn hàng."""

    product_id: int = Field(..., description="ID của sản phẩm")
    product_name: str = Field(..., description="Tên hiển thị của sản phẩm")
    product_image: HttpUrl | None = Field(
        default=None, description="URL hình ảnh đại diện sản phẩm (Nullable)"
    )
    original_price: Decimal | None = Field(
        default=None,
        description="Giá gốc (giá niêm yết cũ) hiển thị gạch ngang trên giao diện",
    )
    price: Decimal = Field(
        ...,
        ge=0,
        description="Đơn giá sản phẩm tại thời điểm mua (snapshot)",
    )
    quantity: int = Field(
        ..., ge=1, description="Số lượng mua của sản phẩm (ví dụ: × 1, × 2)"
    )
    total_price: Decimal = Field(
        ..., ge=0, description="Thành tiền của từng sản phẩm (price × quantity)"
    )

    model_config = ConfigDict(from_attributes=True)


class OrderSummaryResponse(BaseModel):
    """Thông tin tóm tắt đơn hàng hiển thị trong danh sách lịch sử."""

    order_id: str = Field(..., description="Mã định danh đơn hàng (Ví dụ: OD261013...)")
    status: OrderStatus = Field(
        ...,
        description="Trạng thái hiện tại của đơn hàng (Ví dụ: PENDING - Chờ xác nhận)",
    )
    payment_method: PaymentMethod = Field(
        ..., description="Phương thức thanh toán đã chọn"
    )
    payment_status: PaymentStatus = Field(
        ..., description="Trạng thái thanh toán của đơn hàng"
    )
    total_amount: Decimal = Field(
        ..., ge=0, description="Tổng tiền thanh toán toàn bộ đơn hàng"
    )
    total_items: int = Field(
        ..., ge=1, description="Tổng số lượng sản phẩm tính trong đơn"
    )
    created_at: datetime = Field(..., description="Thời gian tạo đơn hàng")
    cancel_reason: str | None = Field(
        default=None,
        description="Lý do hủy đơn hàng (nếu trạng thái là CANCELLED)",
    )
    cancelled_by_type: CancelledByType | str | None = Field(
        default=None,
        description="Loại người hủy: CUSTOMER, SHOP_OWNER, SYSTEM, ADMIN",
    )
    cancelled_at: datetime | None = Field(
        default=None,
        description="Thời điểm thực hiện hủy đơn (UTC)",
    )
    items: list[OrderItemSummaryResponse] = Field(
        ...,
        description="Danh sách chi tiết sản phẩm hiển thị trực tiếp trên giao diện card đơn hàng",
    )

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    """Response — 200 OK cho GET /api/v1/orders."""

    items: list[OrderSummaryResponse] = Field(
        ..., description="Danh sách đơn hàng trên trang hiện tại"
    )
    total_items: int = Field(
        ..., ge=0, description="Tổng số đơn hàng phù hợp với bộ lọc"
    )
    total_pages: int = Field(..., ge=0, description="Tổng số trang")
    current_page: int = Field(..., ge=1, description="Trang hiện tại")
    limit: int = Field(..., ge=1, description="Số bản ghi tối đa trên mỗi trang")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "items": [
                    {
                        "order_id": "OD261013050123AB12CD",
                        "status": "PENDING",
                        "payment_method": "COD",
                        "payment_status": "PENDING",
                        "total_amount": "530000.00",
                        "total_items": 2,
                        "created_at": "2026-10-13T05:00:00Z",
                        "cancel_reason": None,
                        "cancelled_by_type": None,
                        "cancelled_at": None,
                    }
                ],
                "total_items": 1,
                "total_pages": 1,
                "current_page": 1,
                "limit": 10,
            }
        },
    )


class OrderLogResponse(BaseModel):
    """Nhật ký trạng thái và mốc sự kiện đơn hàng."""

    status: OrderStatus | str = Field(
        ..., description="Trạng thái tại thời điểm ghi log"
    )
    note: str | None = Field(
        default=None, description="Mô tả chi tiết hành động / diễn biến"
    )
    timestamp: datetime = Field(..., description="Thời điểm ghi nhận sự kiện")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "status": "PENDING",
                "note": "Đơn hàng đã được tạo thành công",
                "timestamp": "2026-10-13T05:00:00Z",
            }
        },
    )


class OrderDetailResponse(BaseModel):
    """Response — 200 OK cho GET /api/v1/orders/{order_id}."""

    order_id: str = Field(..., description="Mã định danh đơn hàng")
    user_id: UUID = Field(..., description="UUID định danh người mua hàng")
    payment_method: PaymentMethod = Field(..., description="Phương thức thanh toán")
    payment_status: PaymentStatus = Field(
        default=PaymentStatus.PENDING, description="Trạng thái thanh toán"
    )
    status: OrderStatus = Field(..., description="Trạng thái hiện tại của đơn hàng")
    address_id: int | None = Field(default=None, description="ID địa chỉ gốc")
    shipping_recipient_name: str = Field(..., description="Tên người nhận")
    shipping_phone: str = Field(..., description="Số điện thoại người nhận")
    shipping_province_name: str = Field(..., description="Tỉnh/Thành phố")
    shipping_ward_name: str = Field(..., description="Phường/Xã")
    shipping_address_line: str = Field(..., description="Địa chỉ chi tiết")
    note: str | None = Field(default=None, description="Ghi chú đơn hàng")
    order_details: list[CheckoutItemResponse] = Field(
        ..., description="Danh sách sản phẩm trong đơn hàng"
    )
    order_logs: list[OrderLogResponse] = Field(
        default_factory=list, description="Nhật ký trạng thái đơn hàng"
    )
    subtotal: Decimal = Field(..., ge=0, description="Tổng tiền hàng")
    shipping_fee: Decimal = Field(
        default=Decimal("0.00"), ge=0, description="Phí vận chuyển"
    )
    total_amount: Decimal = Field(..., ge=0, description="Tổng giá trị thanh toán")
    created_at: datetime = Field(..., description="Thời điểm đặt hàng")
    estimated_delivery_date: datetime | None = None
    delivered_at: datetime | None = Field(
        default=None,
        description="Thời điểm giao hàng thành công",
    )
    cancel_reason: str | None = Field(
        default=None,
        description="Lý do hủy đơn hàng (nếu đơn hàng đã bị hủy)",
    )
    cancelled_by_type: CancelledByType | str | None = Field(
        default=None,
        description="Loại người thực hiện hủy: CUSTOMER, SHOP_OWNER, SYSTEM, ADMIN",
    )
    cancelled_by_id: UUID | None = Field(
        default=None,
        description="ID của tài khoản thực hiện hủy (NULL nếu do SYSTEM)",
    )
    cancelled_at: datetime | None = Field(
        default=None,
        description="Thời điểm thực hiện hủy đơn (UTC)",
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "order_id": "OD261013050123AB12CD",
                "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                "payment_method": "COD",
                "payment_status": "PENDING",
                "status": "CANCELLED",
                "address_id": 15,
                "shipping_recipient_name": "Nguyễn Văn A",
                "shipping_phone": "0987654321",
                "shipping_province_name": "Thành phố Hồ Chí Minh",
                "shipping_ward_name": "Phường Bến Nghé",
                "shipping_address_line": "123 Đường Lê Lợi",
                "note": "Giao hàng trong giờ hành chính",
                "cancel_reason": "[CHANGE_OF_MIND] Đổi ý / Không còn nhu cầu mua nữa.",
                "cancelled_by_type": "CUSTOMER",
                "cancelled_by_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                "cancelled_at": "2026-10-13T06:15:00Z",
                "subtotal": "500000.00",
                "shipping_fee": "30000.00",
                "total_amount": "530000.00",
                "created_at": "2026-10-13T05:00:00Z",
            }
        },
    )


class OrderActionResponse(BaseModel):
    """Response — 200 OK cho thao tác cập nhật đơn hàng."""

    order_id: str = Field(..., description="ID đơn hàng")
    status: OrderStatus = Field(..., description="Trạng thái đơn hàng sau khi cập nhật")
    message: str = Field(..., description="Thông báo kết quả xử lý")
    cancel_reason: str | None = Field(
        default=None,
        description="Lý do hủy đơn hàng được ghi nhận",
    )
    cancelled_by_type: str | None = Field(
        default=None,
        description="Đối tượng hủy đơn: CUSTOMER, SHOP_OWNER, SYSTEM, ADMIN",
    )
    cancelled_at: datetime | None = Field(
        default=None,
        description="Thời điểm hủy đơn",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "order_id": "OD261013050123AB12CD",
                "status": "CANCELLED",
                "message": "Hủy đơn hàng thành công và hệ thống đã tự động hoàn trả tồn kho tương ứng.",
                "cancel_reason": "[CHANGE_OF_MIND] Đổi ý / Không còn nhu cầu mua nữa.",
                "cancelled_by_type": "CUSTOMER",
                "cancelled_at": "2026-10-13T06:15:00Z",
            }
        }
    )
