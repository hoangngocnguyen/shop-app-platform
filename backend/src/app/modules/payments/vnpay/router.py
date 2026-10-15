"""HTTP routes for creating and verifying VNPay payments."""

import urllib.parse

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.app.core.config import settings
from src.app.core.database import get_db
from src.app.core.response import success_response
from src.app.modules.payments.service import PaymentService
from src.app.modules.payments.vnpay.service import VNPayService

router = APIRouter(
    prefix="/vnpay",
    tags=["Cổng thanh toán VNPAY"],
)


@router.get("/create-payment")
def create_payment(
    amount: int = Query(..., gt=0, description="Số tiền thanh toán VNPay"),
    order_info: str = Query(..., min_length=1, description="Thông tin đơn hàng"),
):
    """Endpoint tạo link VNPay thủ công (dành cho kiểm thử hoặc thanh toán trực tiếp)."""
    service = VNPayService(settings.VNP_HASH_SECRET)
    params = service.create_payment_payload(
        amount=amount,
        order_info=order_info,
        ip_addr="127.0.0.1",
    )
    params["vnp_TmnCode"] = settings.VNP_TMN_CODE
    params["vnp_ReturnUrl"] = settings.VNP_RETURN_URL

    payment_url = service.create_payment_url(settings.VNP_URL, params)
    if settings.VNP_IPN_URL:
        ipn_url = urllib.parse.quote_plus(settings.VNP_IPN_URL)
        payment_url = f"{payment_url}&vnp_IpnUrl={ipn_url}"

    return success_response(
        data={"payment_url": payment_url},
        message="Tạo link thanh toán VNPay thành công",
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
