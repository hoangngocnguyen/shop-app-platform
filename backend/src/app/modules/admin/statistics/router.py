from datetime import UTC, date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role
from src.app.core.response import ApiResponse, success_response
from src.app.modules.admin.statistics.schema import (
    AdminOverviewResponse,
    CustomerStatisticsResponse,
    OrderStatisticsResponse,
    ProductStatisticsResponse,
    RevenueStatisticsResponse,
)
from src.app.modules.admin.statistics.service import AdminStatisticsService


admin_statistics_router = APIRouter(
    prefix="/admin/statistics",
    tags=["Admin Statistics - Thống kê quản trị"],
    dependencies=[Depends(require_role("ADMIN"))],
)


def get_admin_statistics_service(
    db: Session = Depends(get_db),
) -> AdminStatisticsService:
    """Dependency khởi tạo service thống kê quản trị."""
    return AdminStatisticsService(db=db)


@admin_statistics_router.get(
    "",
    response_model=ApiResponse[AdminOverviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Thống kê tổng quan Dashboard quản trị",
    description=(
        "Trả về doanh thu theo các mốc thời gian, thống kê trạng thái đơn hàng, "
        "thống kê phương thức thanh toán và danh sách sản phẩm tồn kho thấp."
    ),
)
def get_admin_statistics_overview(
    low_stock_limit: int = Query(
        default=5,
        ge=1,
        le=100,
        description="Số sản phẩm tồn kho thấp cần trả về (1-100)",
    ),
    service: AdminStatisticsService = Depends(get_admin_statistics_service),
) -> ApiResponse[AdminOverviewResponse]:
    data = service.get_admin_overview(low_stock_limit=low_stock_limit)
    return success_response(
        data=data,
        message="Lấy thống kê tổng quan Dashboard thành công",
    )


@admin_statistics_router.get(
    "/revenue",
    response_model=ApiResponse[RevenueStatisticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Thống kê doanh thu chi tiết",
    description=(
        "Trả về các chỉ số doanh thu hiện tại, doanh thu 12 tháng trong năm "
        "hiện tại và chuỗi doanh thu theo khoảng ngày, nhóm theo ngày/tháng/năm."
    ),
)
def get_admin_revenue_statistics(
    start_date: date | None = Query(
        default=None,
        description="Ngày bắt đầu, định dạng YYYY-MM-DD",
    ),
    end_date: date | None = Query(
        default=None,
        description="Ngày kết thúc (bao gồm), định dạng YYYY-MM-DD",
    ),
    group_by: Literal["day", "month", "year"] = Query(
        default="month",
        description="Đơn vị nhóm dữ liệu biểu đồ",
    ),
    service: AdminStatisticsService = Depends(get_admin_statistics_service),
) -> ApiResponse[RevenueStatisticsResponse]:
    today = datetime.now(UTC).date()
    effective_start = start_date or date(today.year, 1, 1)
    effective_end = end_date or today
    if effective_start > effective_end:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
        )

    data = service.get_revenue_statistics(
        start_date=start_date,
        end_date=end_date,
        group_by=group_by,
    )
    return success_response(
        data=data,
        message="Lấy thống kê doanh thu thành công",
    )


@admin_statistics_router.get(
    "/orders",
    response_model=ApiResponse[OrderStatisticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Thống kê chuyên sâu về đơn hàng",
    description=(
        "Trả về số lượng đơn hàng phân theo trạng thái và phương thức thanh toán."
    ),
)
def get_admin_order_statistics(
    service: AdminStatisticsService = Depends(get_admin_statistics_service),
) -> ApiResponse[OrderStatisticsResponse]:
    data = service.get_order_statistics()
    return success_response(
        data=data,
        message="Lấy thống kê đơn hàng thành công",
    )


@admin_statistics_router.get(
    "/products",
    response_model=ApiResponse[ProductStatisticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Thống kê sản phẩm và tồn kho",
    description=(
        "Trả về danh sách sản phẩm bán chạy trong tháng và sản phẩm sắp hết hàng. "
        "Số lượng mỗi danh sách có thể tùy chỉnh qua query parameters."
    ),
)
def get_admin_product_statistics(
    top_selling_limit: int = Query(
        default=5,
        ge=1,
        le=100,
        description="Số sản phẩm bán chạy cần trả về (1-100)",
    ),
    low_stock_limit: int = Query(
        default=5,
        ge=1,
        le=100,
        description="Số sản phẩm tồn kho thấp cần trả về (1-100)",
    ),
    service: AdminStatisticsService = Depends(get_admin_statistics_service),
) -> ApiResponse[ProductStatisticsResponse]:
    data = service.get_product_statistics(
        top_selling_limit=top_selling_limit,
        low_stock_limit=low_stock_limit,
    )
    return success_response(
        data=data,
        message="Lấy thống kê sản phẩm thành công",
    )


@admin_statistics_router.get(
    "/customers",
    response_model=ApiResponse[CustomerStatisticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Thống kê khách hàng VIP",
    description=(
        "Trả về danh sách khách hàng chi tiêu nhiều nhất trong tháng hiện tại."
    ),
)
def get_admin_customer_statistics(
    limit: int = Query(
        default=5,
        ge=1,
        le=100,
        description="Số khách hàng chi tiêu nhiều cần trả về (1-100)",
    ),
    service: AdminStatisticsService = Depends(get_admin_statistics_service),
) -> ApiResponse[CustomerStatisticsResponse]:
    data = service.get_customer_statistics(limit=limit)
    return success_response(
        data=data,
        message="Lấy thống kê khách hàng thành công",
    )
