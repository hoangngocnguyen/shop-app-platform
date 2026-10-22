"""
FastAPI Router cho module Checkout (Stateless Preview).
Cung cấp Endpoint bọc ApiResponse chuẩn hóa toàn dự án:
- POST /api/v1/checkout/preview
"""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import get_current_user_id
from src.app.core.response import ApiResponse, success_response
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.checkout_schema import (
    CheckoutPreviewRequest,
    CheckoutPreviewResponse,
)
from src.app.modules.orders.services.checkout_service import CheckoutService

router = APIRouter(prefix="/checkout", tags=["Checkout & Preview"])


def get_checkout_service(db: Session = Depends(get_db)) -> CheckoutService:
    """Dependency injection khởi tạo CheckoutService."""
    repository = OrderRepository(db)
    return CheckoutService(repository)


# ==============================================================================
# 1. POST /api/v1/checkout/preview
# ==============================================================================


@router.post(
    "/preview",
    response_model=ApiResponse[CheckoutPreviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Kiểm tra tồn kho, lấy giá hiện tại, tạo snapshot checkout",
    description=(
        "API hoàn toàn Stateless. Kiểm tra tính hợp lệ của sản phẩm, tồn kho và "
        "đơn giá hiện tại từ Database để trả về snapshot checkout chuẩn xác cho Client. "
        "Hỗ trợ BUY_NOW hoặc CART."
    ),
)
def preview_checkout(
    payload: CheckoutPreviewRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    service: CheckoutService = Depends(get_checkout_service),
) -> ApiResponse[CheckoutPreviewResponse]:
    """
    Endpoint Stateless tạo snapshot checkout cho Client.
    """
    result = service.preview_checkout(user_id=current_user_id, request=payload)
    return success_response(
        data=result,
        message="Tạo snapshot checkout thành công",
    )
