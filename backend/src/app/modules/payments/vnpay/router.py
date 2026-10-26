"""HTTP routes for verifying VNPay payments."""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import success_response
from src.app.modules.payments.service import PaymentService

router = APIRouter(
    prefix="/vnpay",
    tags=["Cổng thanh toán VNPAY"],
)


@router.get("/vnpay-return")
def vnpay_return(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Xác thực kết quả thanh toán từ VNPay sau khi khách hàng chuyển hướng trở lại.
    Đồng thời tự động cập nhật trạng thái đơn hàng.
    """
    params = dict(request.query_params)
    payment_service = PaymentService(db)
    payload = payment_service.handle_vnpay_return(params)

    return success_response(
        data=payload,
        message="Xác thực kết quả thanh toán VNPay thành công",
    )


@router.get("/vnpay-ipn")
def vnpay_ipn(
    request: Request,
    db: Session = Depends(get_db),
):
    """Handle VNPay's server-to-server payment notification."""
    params = dict(request.query_params)
    payment_service = PaymentService(db)
    result = payment_service.handle_vnpay_ipn(params)

    return JSONResponse(
        status_code=200,
        content=result,
    )
