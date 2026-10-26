from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from src.app.core.config import settings
from src.app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from src.app.modules.orders.enums.order_enums import (
    CancelledByType,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.payments.schemas import (
    CreatePaymentRequest,
    CreatePaymentResponse,
)
from src.app.modules.payments.vnpay.service import VNPayService


class PaymentService:
    """Service điều phối nghiệp vụ thanh toán tổng thể giữa Orders và các Cổng thanh toán (VNPAY, COD)."""

    def __init__(
        self,
        db: Session,
        vnpay_service: VNPayService | None = None,
    ) -> None:
        self.db = db
        self.order_repo = OrderRepository(db)
        self.vnpay_service = vnpay_service or VNPayService(
            secret_key=settings.VNP_HASH_SECRET, db=db
        )
        self.vnpay_service.order_repo = self.order_repo

    def create_payment(
        self,
        user_id: UUID,
        request: CreatePaymentRequest,
        client_ip: str = "127.0.0.1",
    ) -> CreatePaymentResponse:
        """
        Khởi tạo thông tin thanh toán cho đơn hàng:
        - Kiểm tra quyền sở hữu đơn hàng
        - Kiểm tra tính hợp lệ trạng thái đơn và trạng thái thanh toán
        - Kiểm tra thời hạn thanh toán online (24h) và hoàn tồn kho nếu hết hạn
        - Điều phối tạo Payment URL (VNPAY) hoặc xác nhận phương thức COD
        """
        # 1. Kiểm tra sự tồn tại của đơn hàng
        order = self.order_repo.get_order_by_id(request.order_id)
        if not order:
            raise NotFoundException(resource="Đơn hàng", id_or_slug=request.order_id)

        # 2. Kiểm tra quyền sở hữu đơn hàng
        if order.user_id != user_id:
            raise ForbiddenException(
                "Bạn không có quyền thực hiện thanh toán cho đơn hàng này"
            )

        # 3. Kiểm tra trạng thái đơn hàng
        if order.status == OrderStatus.CANCELLED.value:
            raise BadRequestException(
                message="Đơn hàng đã bị hủy, không thể thực hiện thanh toán",
                error_code="ORDER_CANCELLED",
            )
        if order.status == OrderStatus.COMPLETED.value:
            raise BadRequestException(
                message="Đơn hàng đã hoàn thành trước đó",
                error_code="ORDER_COMPLETED",
            )
        if order.status != OrderStatus.PENDING.value:
            raise BadRequestException(
                message=f"Đơn hàng đang ở trạng thái '{order.status}', không thể thực hiện thanh toán",
                error_code="INVALID_ORDER_STATUS_FOR_PAYMENT",
            )

        # 4. Kiểm tra trạng thái thanh toán của đơn hàng
        if order.payment_status == PaymentStatus.PAID.value:
            raise BadRequestException(
                message="Đơn hàng này đã được thanh toán thành công",
                error_code="ORDER_ALREADY_PAID",
            )

        if order.payment_status == PaymentStatus.REFUNDED.value:
            raise BadRequestException(
                message="Đơn hàng đã được hoàn tiền, không thể thanh toán lại",
                error_code="ORDER_REFUNDED",
            )

        # 5. Kiểm tra thời hạn thanh toán (Chỉ áp dụng cho thanh toán online)
        current_method = order.payment_method
        if current_method == PaymentMethod.VNPAY.value and isinstance(
            order.order_date, datetime
        ):
            order_date = order.order_date
            if order_date.tzinfo is None:
                order_date = order_date.replace(tzinfo=UTC)

            now = datetime.now(UTC)
            elapsed_hours = (now - order_date).total_seconds() / 3600

            if elapsed_hours > 24:
                # 5.1. Hoàn trả tồn kho trước khi hủy đơn
                self.order_repo.restore_inventory(order=order)

                # 5.2. Hủy đơn hàng và lưu log
                self.order_repo.cancel_order_record(
                    order=order,
                    cancel_reason="Hủy đơn hàng tự động do quá thời hạn thanh toán 24h",
                    cancelled_by_type=CancelledByType.SYSTEM.value,
                    cancelled_by_id=None,
                    cancelled_at=now,
                    log_description="Hệ thống tự động hủy đơn hàng do quá thời hạn thanh toán 24h",
                )
                raise BadRequestException(
                    message="Đơn hàng đã quá thời hạn thanh toán (hết hạn sau 24 giờ)",
                    error_code="PAYMENT_EXPIRED",
                )

        # 6. Điều phối xử lý theo phương thức thanh toán tương ứng
        # 6.1. Thanh toán qua Cổng VNPAY -> Ủy quyền cho VNPayService
        if current_method == PaymentMethod.VNPAY.value:
            return self.vnpay_service.create_payment(order, client_ip)

        # 6.2. Thanh toán khi nhận hàng (COD)
        if current_method == PaymentMethod.COD.value:
            return CreatePaymentResponse(
                order_id=order.order_id,
                payment_method=PaymentMethod.COD,
                amount=order.total,
                payment_url=None,
                message="Đơn hàng áp dụng phương thức thanh toán khi nhận hàng (COD)",
            )

        raise BadRequestException(
            message=f"Phương thức thanh toán '{current_method}' chưa được hỗ trợ",
            error_code="UNSUPPORTED_PAYMENT_METHOD",
        )

    # =========================================================================
    # DELEGATED GATEWAY METHODS (VNPAY)
    # =========================================================================

    def handle_vnpay_ipn(self, params: dict[str, str]) -> dict[str, str]:
        """Ủy quyền xử lý IPN Webhook cho VNPayService."""
        return self.vnpay_service.handle_ipn(params)

    def handle_vnpay_return(self, params: dict[str, str]) -> dict[str, Any]:
        """Ủy quyền xác thực dữ liệu chuyển hướng cho VNPayService."""
        return self.vnpay_service.handle_return(params)
