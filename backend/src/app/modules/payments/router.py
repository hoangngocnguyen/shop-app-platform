"""HTTP routes for payments management and gateway integrations."""

from uuid import UUID

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import get_current_user_id
from src.app.core.response import ApiResponse, success_response
from src.app.modules.payments.schemas import (
    CreatePaymentRequest,
    CreatePaymentResponse,
)
from src.app.modules.payments.service import PaymentService
from src.app.modules.payments.vnpay.service import VNPayService

router = APIRouter(
    prefix="/payments",
    tags=["Payment Management"],
)


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


# =============================================================================
# VNPAY GATEWAY ENDPOINTS (Tập trung tại payments router)
# =============================================================================


@router.get(
    "/vnpay/vnpay-return",
    summary="Xác thực kết quả thanh toán từ VNPay sau khi redirect",
    tags=["Cổng thanh toán VNPAY"],
)
@router.get(
    "/vnpay/return",
    summary="Xác thực kết quả thanh toán từ VNPay sau khi redirect",
    tags=["Cổng thanh toán VNPAY"],
    include_in_schema=False,
)
def vnpay_return(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Xác thực kết quả thanh toán từ VNPay sau khi khách hàng chuyển hướng trở lại.
    Đồng thời tự động cập nhật trạng thái đơn hàng.
    """
    params = dict(request.query_params)
    vnpay_service = VNPayService(db=db)
    payload = vnpay_service.handle_return(params)

    return success_response(
        data=payload,
        message="Xác thực kết quả thanh toán VNPay thành công",
    )


@router.get(
    "/vnpay/vnpay-ipn",
    summary="Xử lý Server-to-Server Webhook từ VNPAY",
    tags=["Cổng thanh toán VNPAY"],
)
@router.get(
    "/vnpay/ipn",
    summary="Xử lý Server-to-Server Webhook từ VNPAY",
    tags=["Cổng thanh toán VNPAY"],
    include_in_schema=False,
)
def vnpay_ipn(
    request: Request,
    db: Session = Depends(get_db),
):
    """Handle VNPay's server-to-server payment notification (IPN)."""
    params = dict(request.query_params)
    vnpay_service = VNPayService(db=db)
    result = vnpay_service.handle_ipn(params)

    return JSONResponse(
        status_code=200,
        content=result,
    )
