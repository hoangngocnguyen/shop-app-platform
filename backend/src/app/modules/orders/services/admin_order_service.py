from datetime import UTC, datetime
from uuid import UUID

from src.app.core.exceptions import AppException, NotFoundException
from src.app.modules.orders.enums.order_enums import (
    CANCEL_REASON_TEXT,
    AdminCancelReason,
    CancelledByType,
    OrderStatus,
)
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.order_requests import AdminCancelOrderRequest
from src.app.modules.orders.schemas.order_responses import OrderActionResponse


class AdminOrderService:
    """Service xử lý nghiệp vụ quản trị / staff hủy đơn hàng."""

    def __init__(self, repository: OrderRepository) -> None:
        self.repository = repository

    def admin_cancel_order(
        self,
        admin_id: UUID,
        order_id: str,
        request: AdminCancelOrderRequest,
        role_type: CancelledByType = CancelledByType.ADMIN,
    ) -> OrderActionResponse:
        """Admin / ShopOwner hủy đơn hàng với lý do chuẩn hóa theo catalog."""
        order = self.repository.get_order_by_id(order_id=order_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        if order.status in {OrderStatus.COMPLETED.value, OrderStatus.CANCELLED.value}:
            raise AppException(
                status_code=409,
                message=f"Đơn hàng đang ở trạng thái '{order.status}', không thể thực hiện hủy.",
                error_code="INVALID_ORDER_STATE",
            )

        reason_code_str = request.reason_code.value
        reason_label = CANCEL_REASON_TEXT.get(reason_code_str, reason_code_str)

        custom_reason = (
            request.custom_reason.strip() if request.custom_reason is not None else ""
        )

        if request.reason_code == AdminCancelReason.OTHER:
            if not custom_reason:
                raise AppException(
                    status_code=400,
                    message="Vui lòng nhập ghi chú chi tiết khi chọn lý do OTHER.",
                    error_code="INVALID_REASON",
                )
            formatted_reason = f"[{reason_code_str}] Lý do khác: {custom_reason}"
        elif custom_reason:
            formatted_reason = (
                f"[{reason_code_str}] {reason_label} (Ghi chú: {custom_reason})"
            )
        else:
            formatted_reason = f"[{reason_code_str}] {reason_label}"

        self.repository.restore_inventory(order=order)

        cancelled_now = datetime.now(UTC)
        actor_name = (
            "Quản trị viên" if role_type == CancelledByType.ADMIN else "Chủ cửa hàng"
        )
        log_desc = (
            f"{actor_name} (ID: {admin_id}) hủy đơn hàng. Lý do: {formatted_reason}."
        )

        updated_order = self.repository.cancel_order_record(
            order=order,
            cancel_reason=formatted_reason,
            cancelled_by_type=role_type.value,
            cancelled_by_id=admin_id,
            cancelled_at=cancelled_now,
            log_description=log_desc,
        )

        return OrderActionResponse(
            order_id=updated_order.order_id,
            status=OrderStatus.CANCELLED,
            message=f"{actor_name} đã hủy đơn hàng thành công.",
            cancel_reason=updated_order.cancel_reason,
            cancelled_by_type=updated_order.cancelled_by_type,
            cancelled_at=updated_order.cancelled_at,
        )
