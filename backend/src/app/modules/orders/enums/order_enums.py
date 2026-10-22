from enum import Enum


class CheckoutType(str, Enum):
    """Nguồn checkout: BUY_NOW hoặc CART."""

    BUY_NOW = "BUY_NOW"
    CART = "CART"


class OrderStatus(str, Enum):
    """Trạng thái đơn hàng."""

    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPING = "SHIPPING"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    RETURNED = "RETURNED"


class PaymentMethod(str, Enum):
    """Phương thức thanh toán."""

    BANK_TRANSFER = "BANK_TRANSFER"
    VNPAY = "VNPAY"
    COD = "COD"


class PaymentStatus(str, Enum):
    """Trạng thái thanh toán."""

    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class CancelledByType(str, Enum):
    """Loại người hủy."""

    CUSTOMER = "CUSTOMER"
    SHOP_OWNER = "SHOP_OWNER"
    SYSTEM = "SYSTEM"
    ADMIN = "ADMIN"


class CustomerCancelReason(str, Enum):
    """Lý do hủy của khách hàng."""

    CHANGE_OF_MIND = "CHANGE_OF_MIND"
    CHANGE_SHIPPING_ADDRESS = "CHANGE_SHIPPING_ADDRESS"
    FOUND_BETTER_PRICE = "FOUND_BETTER_PRICE"
    CHANGE_PAYMENT_METHOD = "CHANGE_PAYMENT_METHOD"
    OTHER = "OTHER"


class AdminCancelReason(str, Enum):
    """Lý do hủy dành cho quản trị viên / shop."""

    OUT_OF_STOCK = "OUT_OF_STOCK"
    WRONG_PRICE_OR_INFO = "WRONG_PRICE_OR_INFO"
    CUSTOMER_REQUESTED = "CUSTOMER_REQUESTED"
    SUSPICIOUS_ORDER = "SUSPICIOUS_ORDER"
    OTHER = "OTHER"


class SystemCancelReason(str, Enum):
    """Lý do hủy do hệ thống tự động."""

    PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT"
    CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT"


class CancelReasonCode(str, Enum):
    """Tổng hợp các mã lý do hủy."""

    CHANGE_OF_MIND = "CHANGE_OF_MIND"
    CHANGE_SHIPPING_ADDRESS = "CHANGE_SHIPPING_ADDRESS"
    FOUND_BETTER_PRICE = "FOUND_BETTER_PRICE"
    CHANGE_PAYMENT_METHOD = "CHANGE_PAYMENT_METHOD"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    WRONG_PRICE_OR_INFO = "WRONG_PRICE_OR_INFO"
    CUSTOMER_REQUESTED = "CUSTOMER_REQUESTED"
    SUSPICIOUS_ORDER = "SUSPICIOUS_ORDER"
    PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT"
    CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT"
    OTHER = "OTHER"


CANCEL_REASON_TEXT: dict[str, str] = {
    CustomerCancelReason.CHANGE_OF_MIND.value: "Đổi ý / Không còn nhu cầu mua nữa.",
    CustomerCancelReason.CHANGE_SHIPPING_ADDRESS.value: "Muốn thay đổi địa chỉ nhận hàng hoặc SĐT.",
    CustomerCancelReason.FOUND_BETTER_PRICE.value: "Tìm thấy sản phẩm giá tốt hơn ở nơi khác.",
    CustomerCancelReason.CHANGE_PAYMENT_METHOD.value: "Muốn đổi phương thức thanh toán.",
    CustomerCancelReason.OTHER.value: "Lý do khác (yêu cầu nhập ghi chú chi tiết).",
    AdminCancelReason.OUT_OF_STOCK.value: "Hết hàng trong kho.",
    AdminCancelReason.WRONG_PRICE_OR_INFO.value: "Bị sai thông tin giá / mô tả sản phẩm.",
    AdminCancelReason.CUSTOMER_REQUESTED.value: "Khách hàng gọi điện nhờ hủy hộ.",
    AdminCancelReason.SUSPICIOUS_ORDER.value: "Đơn hàng có dấu hiệu ảo / gian lận.",
    SystemCancelReason.PAYMENT_TIMEOUT.value: "Hết thời hạn thanh toán.",
    SystemCancelReason.CONFIRMATION_TIMEOUT.value: "Quá hạn xác nhận đơn hàng mà Shop không xử lý.",
}
