"""
FastAPI Router cho module Quản lý Đơn hàng (Order Management & Cancellation).
Cung cấp các Endpoint bọc ApiResponse chuẩn hóa toàn dự án:
- POST  /api/v1/orders                     (Tạo đơn hàng mới)
- GET   /api/v1/orders                     (Lấy lịch sử đơn hàng phân trang, tìm kiếm, lọc)
- GET   /api/v1/orders/{order_id}          (Xem chi tiết đơn hàng, snapshot, nhật ký, thông tin hủy)
- PATCH /api/v1/orders/{order_id}/complete (Xác nhận đã nhận hàng -> COMPLETED)
- PATCH /api/v1/orders/{order_id}/cancel   (Khách hàng hủy đơn kèm mã lý do chuẩn Reason Catalog)
- POST  /api/v1/orders/{order_id}/reorder  (Khởi tạo snapshot mua lại từ đơn cũ)
"""

from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import get_current_user_id
from src.app.core.pagination import PaginatedResponse
from src.app.core.response import ApiResponse, success_response
from src.app.modules.orders.catalogs import build_cancellation_reason_catalog
from src.app.modules.orders.enums.order_enums import CustomerCancelReason, OrderStatus
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.checkout_schema import CheckoutPreviewResponse
from src.app.modules.orders.schemas.order_requests import (
    CancelOrderRequest,
    CreateOrderRequest,
)
from src.app.modules.orders.schemas.order_responses import (
    CancellationReasonCatalogResponse,
    OrderActionResponse,
    OrderCreateResponse,
    OrderDetailResponse,
    OrderListResponse,
    OrderSummaryResponse,
)
from src.app.modules.orders.services.checkout_service import CheckoutService
from src.app.modules.orders.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Order Management"])


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    """Dependency injection khởi tạo OrderService."""
    repository = OrderRepository(db)
    return OrderService(repository)


def get_checkout_service(db: Session = Depends(get_db)) -> CheckoutService:
    """Dependency injection khởi tạo CheckoutService."""
    repository = OrderRepository(db)
    return CheckoutService(repository)


@router.get(
    "/cancellation-reasons",
    response_model=ApiResponse[CancellationReasonCatalogResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách lý do khách hàng có thể hủy đơn",
)
def get_customer_cancellation_reasons() -> (
    ApiResponse[CancellationReasonCatalogResponse]
):
    return success_response(
        data=build_cancellation_reason_catalog(list(CustomerCancelReason)),
        message="Lấy danh sách lý do hủy đơn thành công",
    )


# ==============================================================================
# 1. POST /api/v1/orders
# ==============================================================================


@router.post(
    "",
    response_model=ApiResponse[OrderCreateResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo đơn hàng mới",
    description=(
        "Tạo đơn hàng chính thức từ snapshot checkout, địa chỉ nhận hàng và PTTT. "
        "Server kiểm tra chéo lại tồn kho và giá hiện tại trong Database một lần nữa "
        "để ngăn chặn thay đổi giá (409) hoặc hết hàng (409). Trừ kho và ghi nhận DB."
    ),
)
def create_order(
    payload: CreateOrderRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderCreateResponse]:
    """Endpoint tạo đơn hàng mới."""
    result = service.create_order(
        user_id=current_user_id,
        request=payload,
    )
    return success_response(
        data=result,
        message="Tạo đơn hàng thành công",
    )


# ==============================================================================
# 2. GET /api/v1/orders
# ==============================================================================


@router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[OrderSummaryResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách lịch sử đơn hàng của người dùng",
    description=(
        "Lấy danh sách lịch sử đơn hàng của người dùng hiện tại (hỗ trợ phân trang và lọc). "
        "Có thể lọc theo orderStatus (PENDING, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED), "
        "tìm kiếm search theo mã đơn hàng hoặc tên sản phẩm."
    ),
)
def get_orders(
    orderStatus: OrderStatus | None = Query(
        default=None,
        description="Lọc theo trạng thái đơn hàng",
    ),
    search: str | None = Query(
        default="",
        description="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm",
    ),
    page: int = Query(
        default=1,
        ge=1,
        description="Số trang hiện tại (bắt đầu từ 1)",
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Số lượng đơn hàng hiển thị trên mỗi trang (1 - 100)",
    ),
    limit: int | None = Query(
        default=None,
        ge=1,
        le=100,
        description="Bí danh limit (tương thích ngược)",
    ),
    current_user_id: UUID = Depends(get_current_user_id),
    service: OrderService = Depends(get_order_service),
) -> ApiResponse[PaginatedResponse[OrderSummaryResponse]]:
    """Endpoint lấy danh sách lịch sử đơn hàng."""
    effective_page_size = limit if limit is not None else page_size
    result = service.get_orders(
        user_id=current_user_id,
        order_status=orderStatus,
        search=search,
        page=page,
        page_size=effective_page_size,
    )
    return success_response(
        data=result,
        message="Lấy danh sách đơn hàng thành công",
    )


# ==============================================================================
# 3. GET /api/v1/orders/{order_id}
# ==============================================================================


@router.get(
    "/{order_id}",
    response_model=ApiResponse[OrderDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Xem chi tiết đơn hàng",
    description="Xem chi tiết đơn hàng, snapshot địa chỉ, sản phẩm, nhật ký trạng thái và thông tin hủy đơn nếu có.",
)
def get_order_detail(
    order_id: str = Path(..., description="ID của đơn hàng cần xem chi tiết"),
    current_user_id: UUID = Depends(get_current_user_id),
    service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderDetailResponse]:
    """Endpoint xem chi tiết đơn hàng."""
    result = service.get_order_detail(user_id=current_user_id, order_id=order_id)
    return success_response(
        data=result,
        message="Lấy chi tiết đơn hàng thành công",
    )


# ==============================================================================
# 4. PATCH /api/v1/orders/{order_id}/complete
# ==============================================================================


@router.patch(
    "/{order_id}/complete",
    response_model=ApiResponse[OrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Xác nhận đã nhận hàng",
    description="Xác nhận đã nhận hàng từ người dùng (Chuyển sang COMPLETED).",
)
def complete_order(
    order_id: str = Path(..., description="ID của đơn hàng cần xác nhận hoàn thành"),
    current_user_id: UUID = Depends(get_current_user_id),
    service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderActionResponse]:
    """Endpoint xác nhận nhận hàng."""
    result = service.complete_order(user_id=current_user_id, order_id=order_id)
    return success_response(
        data=result,
        message="Xác nhận nhận hàng thành công",
    )


# ==============================================================================
# 5. PATCH /api/v1/orders/{order_id}/cancel (KHÁCH HÀNG HỦY ĐƠN HÀNG)
# ==============================================================================


@router.patch(
    "/{order_id}/cancel",
    response_model=ApiResponse[OrderActionResponse],
    status_code=status.HTTP_200_OK,
    summary="Khách hàng hủy đơn hàng (kèm Reason Catalog)",
    description=(
        "Khách hàng hủy đơn hàng yêu cầu gửi kèm mã lý do hủy (reason_code) từ Reason Catalog:\n"
        "- CHANGE_OF_MIND: Đổi ý / Không còn nhu cầu mua nữa\n"
        "- CHANGE_SHIPPING_ADDRESS: Muốn thay đổi địa chỉ nhận hàng hoặc SĐT\n"
        "- FOUND_BETTER_PRICE: Tìm thấy sản phẩm giá tốt hơn ở nơi khác\n"
        "- CHANGE_PAYMENT_METHOD: Muốn đổi phương thức thanh toán\n"
        "- OTHER: Lý do khác (yêu cầu điền chi tiết vào trường custom_reason)\n"
        "Hệ thống sẽ kiểm tra trạng thái (PENDING/PROCESSING), hoàn trả tồn kho và lưu audit log."
    ),
)
def cancel_order(
    payload: CancelOrderRequest,
    order_id: str = Path(..., description="ID của đơn hàng cần hủy"),
    current_user_id: UUID = Depends(get_current_user_id),
    service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderActionResponse]:
    """Endpoint khách hàng hủy đơn hàng."""
    result = service.cancel_order(
        user_id=current_user_id,
        order_id=order_id,
        request=payload,
    )
    return success_response(
        data=result,
        message="Hủy đơn hàng thành công",
    )


# ==============================================================================
# 6. POST /api/v1/orders/{order_id}/reorder
# ==============================================================================


@router.post(
    "/{order_id}/reorder",
    response_model=ApiResponse[CheckoutPreviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Khởi tạo snapshot mua lại từ đơn hàng cũ",
    description=(
        "Lấy danh sách sản phẩm từ đơn hàng cũ để khởi tạo snapshot mua lại. "
        "Truy xuất đơn giá niêm yết hiện tại và kiểm tra tồn kho từ Database, "
        "trả về snapshot CheckoutPreviewResponse."
    ),
)
def reorder_past_order(
    order_id: str = Path(..., description="ID của đơn hàng cũ cần mua lại"),
    current_user_id: UUID = Depends(get_current_user_id),
    service: CheckoutService = Depends(get_checkout_service),
) -> ApiResponse[CheckoutPreviewResponse]:
    """Endpoint mua lại đơn hàng cũ."""
    result = service.reorder(user_id=current_user_id, order_id=order_id)
    return success_response(
        data=result,
        message="Khởi tạo snapshot mua lại từ đơn hàng cũ thành công",
    )
