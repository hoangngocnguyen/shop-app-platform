from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import get_current_user_id, require_any_role
from src.app.core.exceptions import AppException
from src.app.core.pagination import PaginatedResponse
from src.app.core.response import ApiResponse, success_response
from src.app.modules.orders.catalogs import build_cancellation_reason_catalog
from src.app.modules.orders.enums.order_enums import (
    AdminCancelReason,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.order_requests import (
    AdminCancelOrderRequest,
    BulkOrderActionRequest,
)
from src.app.modules.orders.schemas.order_responses import (
    AdminOrderSummaryResponse,
    BulkOrderActionResponse,
    CancellationReasonCatalogResponse,
    OrderActionResponse,
    OrderDetailResponse,
    OrderStatusCountDTO,
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


# ==============================================================================
# 1. TỔNG QUAN, DANH SÁCH & BỘ ĐẾM BADGE STATS
# ==============================================================================


@admin_order_router.get(
    "/statistics",
    response_model=ApiResponse[list[OrderStatusCountDTO]],
    status_code=status.HTTP_200_OK,
    summary="Thống kê số lượng đơn hàng theo từng trạng thái (Admin)",
    description="Trả về số lượng đơn hàng theo từng trạng thái (ALL, PENDING, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED) để hiển thị số lượng badge trên các Tabs của trang Quản lý Đơn hàng.",
)
def get_order_statistics(
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[list[OrderStatusCountDTO]]:
    """Endpoint thống kê số lượng đơn hàng theo trạng thái."""
    stats = service.get_order_status_statistics()
    return success_response(
        data=stats,
        message="Lấy thống kê số lượng đơn hàng theo trạng thái thành công",
    )


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


@admin_order_router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[AdminOrderSummaryResponse]],
    status_code=status.HTTP_200_OK,
    summary="Danh sách đơn hàng toàn hệ thống dành cho Admin (Có phân trang & Bộ lọc)",
    description=(
        "Lấy danh sách đơn hàng toàn hệ thống với phân trang, lọc theo trạng thái đơn hàng (order_status), "
        "phương thức thanh toán (payment_method), trạng thái thanh toán (payment_status), tìm kiếm theo mã đơn, "
        "tên người nhận, số điện thoại hoặc tên sản phẩm liên kết, và sắp xếp theo ngày đặt / tổng tiền."
    ),
)
def get_admin_orders(
    page: int = Query(default=1, ge=1, description="Trang hiện tại (bắt đầu từ 1)"),
    page_size: int = Query(
        default=10, ge=1, le=100, description="Số lượng mục mỗi trang (1 - 100)"
    ),
    order_status: OrderStatus | None = Query(
        default=None, description="Lọc theo trạng thái đơn hàng"
    ),
    payment_method: PaymentMethod | None = Query(
        default=None, description="Lọc theo phương thức thanh toán (BANK_TRANSFER, VNPAY, COD)"
    ),
    payment_status: PaymentStatus | None = Query(
        default=None, description="Lọc theo trạng thái thanh toán (PENDING, PAID, FAILED, REFUNDED)"
    ),
    search: str | None = Query(
        default=None, description="Từ khóa tìm kiếm theo mã đơn, tên khách/người nhận, SĐT hoặc tên sản phẩm"
    ),
    sort_by: str = Query(
        default="order_date_desc",
        description="Tiêu chí sắp xếp: order_date_desc, order_date_asc, total_desc, total_asc",
    ),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[PaginatedResponse[AdminOrderSummaryResponse]]:
    """Endpoint lấy danh sách đơn hàng cho Admin."""
    result = service.get_admin_orders(
        order_status=order_status,
        payment_method=payment_method,
        payment_status=payment_status,
        search=search,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
    )
    return success_response(
        data=result,
        message="Lấy danh sách đơn hàng thành công",
    )


# ==============================================================================
# 2. BULK ACTIONS (XỬ LÝ 1 HOẶC NHIỀU ĐƠN HÀNG HÀNG LOẠT)
# ==============================================================================


@admin_order_router.patch(
    "/confirm",
    response_model=ApiResponse[BulkOrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Xác nhận hàng loạt đơn hàng (Admin)",
    description=(
        "Chuyển trạng thái các đơn hàng từ PENDING sang PROCESSING. "
        "Nhận vào một mảng order_ids (1 hoặc nhiều phần tử). "
        "Nếu phương thức thanh toán là chuyển khoản QR (BANK_TRANSFER), tự động chuyển payment_status = PAID. "
        "Ghi nhật ký order_logs tương ứng."
    ),
)
def confirm_orders_bulk(
    payload: BulkOrderActionRequest,
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[BulkOrderActionResponse]:
    """Endpoint xác nhận đơn hàng hàng loạt."""
    result = service.confirm_orders(
        admin_id=current_admin_id,
        order_ids=payload.order_ids,
        note=payload.note,
    )
    return success_response(
        data=result,
        message=f"Đã xử lý xác nhận cho {result.total_requested} đơn hàng (Thành công: {result.success_count}, Thất bại: {result.failure_count})",
    )


@admin_order_router.patch(
    "/shipping",
    response_model=ApiResponse[BulkOrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Chuyển hàng loạt đơn hàng sang vận chuyển (Admin)",
    description=(
        "Chuyển trạng thái các đơn hàng từ PROCESSING sang SHIPPING. "
        "Nhận vào một mảng order_ids (1 hoặc nhiều phần tử). "
        "Ghi nhật ký order_logs tương ứng."
    ),
)
def start_shipping_orders_bulk(
    payload: BulkOrderActionRequest,
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[BulkOrderActionResponse]:
    """Endpoint chuyển sang giao hàng hàng loạt."""
    result = service.start_shipping_orders(
        admin_id=current_admin_id,
        order_ids=payload.order_ids,
        note=payload.note,
    )
    return success_response(
        data=result,
        message=f"Đã xử lý chuyển vận chuyển cho {result.total_requested} đơn hàng (Thành công: {result.success_count}, Thất bại: {result.failure_count})",
    )


@admin_order_router.patch(
    "/delivered",
    response_model=ApiResponse[BulkOrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Xác nhận hàng loạt đơn hàng đã giao thành công (Admin)",
    description=(
        "Chuyển trạng thái các đơn hàng từ SHIPPING sang DELIVERED. "
        "Nhận vào một mảng order_ids (1 hoặc nhiều phần tử). "
        "Tự động cập nhật delivered_at = now(). "
        "Đối với đơn COD hoặc chưa thanh toán, tự động chuyển payment_status = PAID. "
        "Ghi nhật ký order_logs tương ứng."
    ),
)
def complete_delivery_orders_bulk(
    payload: BulkOrderActionRequest,
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[BulkOrderActionResponse]:
    """Endpoint xác nhận đã giao hàng hàng loạt."""
    result = service.complete_delivery_orders(
        admin_id=current_admin_id,
        order_ids=payload.order_ids,
        note=payload.note,
    )
    return success_response(
        data=result,
        message=f"Đã xử lý xác nhận giao hàng cho {result.total_requested} đơn hàng (Thành công: {result.success_count}, Thất bại: {result.failure_count})",
    )


# ==============================================================================
# 3. SINGLE ACTIONS (XEM CHI TIẾT & THAO TÁC TRÊN 1 ĐƠN HÀNG)
# ==============================================================================


@admin_order_router.get(
    "/{order_id}",
    response_model=ApiResponse[OrderDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Xem chi tiết đơn hàng dành cho Admin",
    description="Xem toàn bộ thông tin chi tiết một đơn hàng: snapshot người nhận, địa chỉ giao hàng, danh sách sản phẩm, nhật ký trạng thái order_logs, thông tin hủy đơn nếu có.",
)
def get_admin_order_detail(
    order_id: str = Path(..., description="ID của đơn hàng cần xem"),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[OrderDetailResponse]:
    """Endpoint xem chi tiết đơn hàng cho Admin."""
    result = service.get_admin_order_detail(order_id=order_id)
    return success_response(
        data=result,
        message="Lấy chi tiết đơn hàng thành công",
    )


@admin_order_router.patch(
    "/{order_id}/confirm",
    response_model=ApiResponse[OrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Xác nhận đơn lẻ đơn hàng (Admin)",
    description="Xác nhận một đơn hàng cụ thể từ PENDING sang PROCESSING.",
)
def confirm_order_single(
    order_id: str = Path(..., description="ID của đơn hàng cần xác nhận"),
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[OrderActionResponse]:
    """Endpoint xác nhận đơn lẻ."""
    bulk_res = service.confirm_orders(
        admin_id=current_admin_id,
        order_ids=[order_id],
    )
    if not bulk_res.results or not bulk_res.results[0].success:
        err_msg = bulk_res.results[0].message if bulk_res.results else "Không thể xác nhận đơn hàng"
        raise AppException(status_code=409, message=err_msg, error_code="INVALID_ORDER_STATE")

    return success_response(
        data=OrderActionResponse(
            order_id=order_id,
            status=OrderStatus.PROCESSING,
            message=bulk_res.results[0].message,
        ),
        message="Xác nhận đơn hàng thành công",
    )


@admin_order_router.patch(
    "/{order_id}/shipping",
    response_model=ApiResponse[OrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Chuyển đơn lẻ sang vận chuyển (Admin)",
    description="Chuyển một đơn hàng cụ thể từ PROCESSING sang SHIPPING.",
)
def start_shipping_order_single(
    order_id: str = Path(..., description="ID của đơn hàng cần chuyển giao"),
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[OrderActionResponse]:
    """Endpoint chuyển vận chuyển đơn lẻ."""
    bulk_res = service.start_shipping_orders(
        admin_id=current_admin_id,
        order_ids=[order_id],
    )
    if not bulk_res.results or not bulk_res.results[0].success:
        err_msg = bulk_res.results[0].message if bulk_res.results else "Không thể chuyển giao hàng"
        raise AppException(status_code=409, message=err_msg, error_code="INVALID_ORDER_STATE")

    return success_response(
        data=OrderActionResponse(
            order_id=order_id,
            status=OrderStatus.SHIPPING,
            message=bulk_res.results[0].message,
        ),
        message="Chuyển đơn hàng sang trạng thái vận chuyển thành công",
    )


@admin_order_router.patch(
    "/{order_id}/delivered",
    response_model=ApiResponse[OrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Xác nhận đơn lẻ đã giao thành công (Admin)",
    description="Xác nhận một đơn hàng cụ thể từ SHIPPING sang DELIVERED.",
)
def complete_delivery_order_single(
    order_id: str = Path(..., description="ID của đơn hàng cần xác nhận đã giao"),
    current_admin_id: UUID = Depends(get_current_user_id),
    service: AdminOrderService = Depends(get_admin_order_service),
) -> ApiResponse[OrderActionResponse]:
    """Endpoint xác nhận giao thành công đơn lẻ."""
    bulk_res = service.complete_delivery_orders(
        admin_id=current_admin_id,
        order_ids=[order_id],
    )
    if not bulk_res.results or not bulk_res.results[0].success:
        err_msg = bulk_res.results[0].message if bulk_res.results else "Không thể xác nhận giao hàng"
        raise AppException(status_code=409, message=err_msg, error_code="INVALID_ORDER_STATE")

    return success_response(
        data=OrderActionResponse(
            order_id=order_id,
            status=OrderStatus.DELIVERED,
            message=bulk_res.results[0].message,
        ),
        message="Xác nhận giao hàng thành công",
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
