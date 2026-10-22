from uuid import UUID

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import get_current_user_id, require_any_role
from src.app.core.response import ApiResponse, success_response
from src.app.modules.orders.catalogs import build_cancellation_reason_catalog
from src.app.modules.orders.enums.order_enums import AdminCancelReason
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.order_requests import AdminCancelOrderRequest
from src.app.modules.orders.schemas.order_responses import (
    CancellationReasonCatalogResponse,
    OrderActionResponse,
)
from src.app.modules.orders.services.admin_order_service import AdminOrderService

admin_order_router = APIRouter(
    prefix="/admin/orders",
    tags=["Admin Orders - Quản trị Đơn hàng"],
    dependencies=[Depends(require_any_role(["ADMIN", "STAFF"]))],
)


def get_admin_order_service(db: Session = Depends(get_db)) -> AdminOrderService:
    """Dependency injection khởi tạo AdminOrderService."""
    repository = OrderRepository(db)
    return AdminOrderService(repository)


@admin_order_router.get(
    "/cancellation-reasons",
    response_model=ApiResponse[CancellationReasonCatalogResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách lý do admin có thể hủy đơn",
)
def get_admin_cancellation_reasons() -> ApiResponse[CancellationReasonCatalogResponse]:
    return success_response(
        data=build_cancellation_reason_catalog(list(AdminCancelReason)),
        message="Lấy danh sách lý do hủy đơn dành cho quản trị thành công",
    )


@admin_order_router.patch(
    "/{order_id}/cancel",
    response_model=ApiResponse[OrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Admin / Shop hủy đơn hàng",
    description=(
        "Dành cho nhân viên quản trị hoặc chủ shop hủy đơn hàng theo danh mục lý do Admin:\n"
        "- OUT_OF_STOCK: Hết hàng trong kho\n"
        "- WRONG_PRICE_OR_INFO: Bị sai thông tin giá / mô tả sản phẩm\n"
        "- CUSTOMER_REQUESTED: Khách hàng gọi điện nhờ hủy hộ\n"
        "- SUSPICIOUS_ORDER: Đơn hàng có dấu hiệu ảo / gian lận\n"
        "- OTHER: Lý do khác"
    ),
)
def cancel_order_by_admin(
    payload: AdminCancelOrderRequest,
    order_id: str = Path(..., description="ID của đơn hàng cần hủy"),
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[OrderActionResponse]:
    """Endpoint quản trị viên hủy đơn hàng."""
    result = service.admin_cancel_order(
        admin_id=current_admin_id,
        order_id=order_id,
        request=payload,
    )
    return success_response(
        data=result,
        message="Admin hủy đơn hàng thành công",
    )
