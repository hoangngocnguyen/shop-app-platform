from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    model_validator,
)

from src.app.modules.orders.schemas.checkout_schema import (
    CheckoutItemResponse,
    CheckoutPreviewResponse,
)

# ==============================================================================
# 1. ENUMS HỆ THỐNG
# ==============================================================================


class OrderStatus(str, Enum):
    """
    Trạng thái đơn hàng:
    - PENDING: Chờ xác nhận
    - PROCESSING: Chờ lấy hàng
    - SHIPPING: Đang vận chuyển
    - DELIVERED: Đã giao hàng
    - COMPLETED: Đã hoàn thành
    - CANCELLED: Đã hủy
    - RETURNED: Trả hàng
    """

    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPING = "SHIPPING"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    RETURNED = "RETURNED"


class PaymentMethod(str, Enum):
    """
    Phương thức thanh toán:
    - BANK_TRANSFER: Chuyển khoản ngân hàng qua QR
    - VNPAY: Thanh toán qua VNPAY
    - COD: Thanh toán khi nhận hàng
    """

    BANK_TRANSFER = "BANK_TRANSFER"
    VNPAY = "VNPAY"
    COD = "COD"


class PaymentStatus(str, Enum):
    """
    Trạng thái thanh toán:
    - PENDING: Chờ xác nhận thanh toán
    - PAID: Đã thanh toán
    - FAILED: Thất bại
    - REFUNDED: Đã hoàn tiền
    """

    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class CancelledByType(str, Enum):
    """
    Loại người hủy đơn hàng:
    - CUSTOMER: Khách hàng tự hủy
    - SHOP_OWNER: Chủ cửa hàng / Quản lý shop
    - SYSTEM: Hệ thống tự động hủy
    - ADMIN: Quản trị viên / Nhân viên hỗ trợ
    """

    CUSTOMER = "CUSTOMER"
    SHOP_OWNER = "SHOP_OWNER"
    SYSTEM = "SYSTEM"
    ADMIN = "ADMIN"


# ==============================================================================
# 2. DANH MỤC LÝ DO HỦY TIÊU CHUẨN (REASON CATALOG)
# ==============================================================================


class CustomerCancelReason(str, Enum):
    """Lý do hủy tiêu chuẩn dành cho Khách hàng (CUSTOMER)."""

    CHANGE_OF_MIND = "CHANGE_OF_MIND"
    CHANGE_SHIPPING_ADDRESS = "CHANGE_SHIPPING_ADDRESS"
    FOUND_BETTER_PRICE = "FOUND_BETTER_PRICE"
    CHANGE_PAYMENT_METHOD = "CHANGE_PAYMENT_METHOD"
    OTHER = "OTHER"


class AdminCancelReason(str, Enum):
    """Lý do hủy tiêu chuẩn dành cho Quản trị viên / Shop (STAFF / ADMIN)."""

    OUT_OF_STOCK = "OUT_OF_STOCK"
    WRONG_PRICE_OR_INFO = "WRONG_PRICE_OR_INFO"
    CUSTOMER_REQUESTED = "CUSTOMER_REQUESTED"
    SUSPICIOUS_ORDER = "SUSPICIOUS_ORDER"
    OTHER = "OTHER"


class SystemCancelReason(str, Enum):
    """Lý do hủy tiêu chuẩn do Hệ thống tự động xử lý (SYSTEM)."""

    PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT"
    CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT"


class CancelReasonCode(str, Enum):
    """Tổng hợp tất cả mã lý do hủy đơn hàng trong toàn hệ thống."""

    # Nhóm Customer
    CHANGE_OF_MIND = "CHANGE_OF_MIND"
    CHANGE_SHIPPING_ADDRESS = "CHANGE_SHIPPING_ADDRESS"
    FOUND_BETTER_PRICE = "FOUND_BETTER_PRICE"
    CHANGE_PAYMENT_METHOD = "CHANGE_PAYMENT_METHOD"

    # Nhóm Admin / Staff
    OUT_OF_STOCK = "OUT_OF_STOCK"
    WRONG_PRICE_OR_INFO = "WRONG_PRICE_OR_INFO"
    CUSTOMER_REQUESTED = "CUSTOMER_REQUESTED"
    SUSPICIOUS_ORDER = "SUSPICIOUS_ORDER"

    # Nhóm System
    PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT"
    CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT"

    # Lý do khác
    OTHER = "OTHER"


# Mapping mô tả chi tiết của từng mã lý do hiển thị tiếng Việt
CANCEL_REASON_TEXT: dict[str, str] = {
    # Khách hàng
    CustomerCancelReason.CHANGE_OF_MIND.value: "Đổi ý / Không còn nhu cầu mua nữa.",
    CustomerCancelReason.CHANGE_SHIPPING_ADDRESS.value: "Muốn thay đổi địa chỉ nhận hàng hoặc SĐT.",
    CustomerCancelReason.FOUND_BETTER_PRICE.value: "Tìm thấy sản phẩm giá tốt hơn ở nơi khác.",
    CustomerCancelReason.CHANGE_PAYMENT_METHOD.value: "Muốn đổi phương thức thanh toán.",
    CustomerCancelReason.OTHER.value: "Lý do khác (yêu cầu nhập ghi chú chi tiết).",
    # Admin / Staff
    AdminCancelReason.OUT_OF_STOCK.value: "Hết hàng trong kho.",
    AdminCancelReason.WRONG_PRICE_OR_INFO.value: "Bị sai thông tin giá / mô tả sản phẩm.",
    AdminCancelReason.CUSTOMER_REQUESTED.value: "Khách hàng gọi điện nhờ hủy hộ.",
    AdminCancelReason.SUSPICIOUS_ORDER.value: "Đơn hàng có dấu hiệu ảo / gian lận.",
    # System
    SystemCancelReason.PAYMENT_TIMEOUT.value: "Hết thời hạn thanh toán (ví dụ: Quá 15 phút chưa quét mã QR).",
    SystemCancelReason.CONFIRMATION_TIMEOUT.value: "Quá hạn xác nhận đơn hàng mà Shop không xử lý.",
}


# ReorderResponse chuẩn hóa sử dụng lại cấu trúc CheckoutPreviewResponse
ReorderResponse = CheckoutPreviewResponse


# ==============================================================================
# 3. SCHEMAS CHO ORDER MANAGEMENT & CANCELLATION
# ==============================================================================


class CancelOrderRequest(BaseModel):
    """
    Request Body cho PATCH /api/v1/orders/{order_id}/cancel (Khách hàng hủy đơn)
    Bắt buộc chọn mã lý do hủy hợp lệ từ danh mục.
    Nếu chọn 'OTHER' thì bắt buộc phải nhập ghi chú chi tiết trong 'custom_reason'.
    """

    reason_code: CustomerCancelReason = Field(
        ...,
        description="Mã lý do hủy chuẩn từ catalog: CHANGE_OF_MIND, CHANGE_SHIPPING_ADDRESS, FOUND_BETTER_PRICE, CHANGE_PAYMENT_METHOD, OTHER",
    )
    custom_reason: str | None = Field(
        default=None,
        max_length=500,
        description="Nội dung giải thích chi tiết (Bắt buộc nếu chọn OTHER, tối đa 500 ký tự)",
    )

    @model_validator(mode="after")
    def validate_other_reason(self) -> "CancelOrderRequest":
        """Ràng buộc: Nếu chọn OTHER, bắt buộc phải có mô tả chi tiết và không được chỉ toàn khoảng trắng."""
        if self.reason_code == CustomerCancelReason.OTHER and (
            not self.custom_reason or not self.custom_reason.strip()
        ):
            raise ValueError(
                "Vui lòng nhập chi tiết lý do hủy đơn hàng khi chọn 'Lý do khác' (OTHER)."
            )
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
    """
    Request Body dành cho Quản trị viên / Shop hủy đơn hàng.
    """

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
        if self.reason_code == AdminCancelReason.OTHER and (
            not self.custom_reason or not self.custom_reason.strip()
        ):
            raise ValueError("Vui lòng nhập giải thích khi chọn 'Lý do khác' (OTHER).")
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
    """Request Body dành cho worker/cron job hệ thống tự động hủy đơn."""

    reason_code: SystemCancelReason = Field(
        ...,
        description="Mã lý do hủy của hệ thống: PAYMENT_TIMEOUT, CONFIRMATION_TIMEOUT",
    )
    note: str | None = Field(
        default=None,
        description="Mô tả bổ sung nếu có (ví dụ: Quá 15 phút chưa nhận được webhook)",
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
    """
    Request Body cho POST /api/v1/orders
    Tạo đơn hàng chính thức từ snapshot checkout, địa chỉ nhận hàng và PTTT.
    """

    items: list[OrderItemPreviewRequest] = Field(
        ...,
        min_length=1,
        description="Danh sách sản phẩm và snapshot giá từ bước preview (không được rỗng)",
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
    """Chi tiết sản phẩm hiển thị trực tiếp trên giao diện card đơn hàng."""

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

    # Thông tin hủy đơn hàng (nếu có)
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
    """
    Response — 200 OK cho GET /api/v1/orders
    Bao gồm danh sách đơn hàng và thông số phân trang.
    """

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
    """
    Response — 200 OK cho GET /api/v1/orders/{order_id}
    Xem chi tiết đơn hàng, snapshot địa chỉ, sản phẩm, nhật ký trạng thái và thông tin hủy đơn nếu có.
    """

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
        default=None, description="Thời điểm giao hàng thành công"
    )

    # Các trường thông tin hủy đơn hàng
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
    """
    Response — 200 OK cho:
    - PATCH /api/v1/orders/{order_id}/complete
    - PATCH /api/v1/orders/{order_id}/cancel
    """

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
