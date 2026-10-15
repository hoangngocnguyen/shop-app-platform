from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import get_current_user_id
from src.app.core.response import ApiResponse, success_response
from src.app.modules.payments.schemas import (
    CreatePaymentRequest,
    CreatePaymentResponse,
)
from src.app.modules.payments.service import PaymentService
from src.app.modules.payments.vnpay.router import router as vnpay_router

router = APIRouter(
    prefix="/payments",
    tags=["Payment Management"],
)

# Gom các sub-router cổng thanh toán (VNPAY)
router.include_router(vnpay_router)


@router.post(
    "/create-payment",
    response_model=ApiResponse[CreatePaymentResponse],
    summary="Khởi tạo thanh toán cho đơn hàng (Hỗ trợ COD, VNPAY)",
)
def create_payment(
    payload: CreatePaymentRequest,
    request: Request,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Endpoint khởi tạo thanh toán tập trung:
    - Nhận OrderID từ client.
    - Kiểm tra tính hợp lệ của đơn hàng (chưa hoàn thành, chưa hủy, chưa thanh toán).
    - Tự động lấy phương thức thanh toán và tổng tiền từ database.
    - Điều hướng tạo Payment URL (VNPAY) hoặc xác nhận đơn hàng COD.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    payment_service = PaymentService(db)
    result = payment_service.create_payment(
        user_id=current_user_id,
        request=payload,
        client_ip=client_ip,
    )
    return success_response(
        data=result,
        message=result.message,
    )
