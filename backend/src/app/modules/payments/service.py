from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from src.app.core.config import settings
from src.app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from src.app.modules.orders.enums.order_enums import PaymentMethod, PaymentStatus
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
        - Điều phối tạo Payment URL (VNPAY) hoặc xác nhận phương thức COD
        """
        order = self.order_repo.get_order_by_id(request.order_id)
        if not order:
            raise NotFoundException(resource="Đơn hàng", id_or_slug=request.order_id)

        if order.user_id != user_id:
            raise ForbiddenException(
                "Bạn không có quyền thực hiện thanh toán cho đơn hàng này"
            )

        if order.status == "CANCELLED":
            raise BadRequestException(
                message="Đơn hàng đã bị hủy, không thể thực hiện thanh toán",
                error_code="ORDER_CANCELLED",
            )

        if order.status == "COMPLETED":
            raise BadRequestException(
                message="Đơn hàng đã hoàn thành trước đó",
                error_code="ORDER_COMPLETED",
            )

        if order.payment_status == PaymentStatus.PAID.value:
            raise BadRequestException(
                message="Đơn hàng này đã được thanh toán thành công",
                error_code="ORDER_ALREADY_PAID",
            )

        current_method = order.payment_method

        # 1. Thanh toán qua Cổng VNPAY -> Ủy quyền cho VNPayService
        if current_method == PaymentMethod.VNPAY.value:
            return self.vnpay_service.create_payment(order, client_ip)

        # 2. Thanh toán khi nhận hàng (COD)
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
