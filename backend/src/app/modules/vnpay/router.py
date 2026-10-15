"""HTTP routes for creating and verifying VNPay payments."""

import urllib.parse

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from src.app.core.config import settings
from src.app.core.exceptions import BadRequestException
from src.app.core.response import success_response
from src.app.modules.vnpay.service import VNPayService

router = APIRouter(
    prefix="/vnpay",
    tags=["Cổng thanh toán VNPAY"],
)


@router.get("/create-payment")
def create_payment(
    amount: int = Query(..., gt=0, description="Số tiền thanh toán VNPay"),
    order_info: str = Query(..., min_length=1, description="Thông tin đơn hàng"),
):
    service = VNPayService(settings.VNP_HASH_SECRET)
    params = service.create_payment_payload(
        amount=amount,
        order_info=order_info,
        ip_addr="127.0.0.1",
    )
    params["vnp_TmnCode"] = settings.VNP_TMN_CODE
    params["vnp_ReturnUrl"] = settings.VNP_RETURN_URL

    payment_url = service.create_payment_url(settings.VNP_URL, params)
    ipn_url = urllib.parse.quote_plus(settings.VNP_IPN_URL)
    return success_response(
        data={"payment_url": f"{payment_url}&vnp_IpnUrl={ipn_url}"},
        message="Tạo link thanh toán VNPay thành công",
    )


@router.get("/vnpay-return")
def vnpay_return(request: Request):
    params = dict(request.query_params)
    service = VNPayService(settings.VNP_HASH_SECRET)

    if not service.validate_response(params):
        raise BadRequestException(
            message="Checksum VNPay không hợp lệ",
            error_code="INVALID_VNPAY_CHECKSUM",
        )

    response_code = params.get("vnp_ResponseCode", "")
    payload = {
        "status": "Success" if response_code == "00" else "Failed",
        "order_id": params.get("vnp_TxnRef", "N/A"),
        "amount": float(int(params.get("vnp_Amount", "0")) / 100),
        "response_code": response_code,
    }

    if response_code != "00":
        payload["message"] = "Giao dịch thanh toán không thành công"

    return success_response(
        data=payload,
        message="Xác thực kết quả thanh toán VNPay thành công",
    )


@router.get("/vnpay-ipn")
def vnpay_ipn(request: Request):
    """Handle VNPay's server-to-server payment notification."""
    params = dict(request.query_params)
    service = VNPayService(settings.VNP_HASH_SECRET)

    if not service.validate_response(params):
        return JSONResponse(
            status_code=200,
            content={"RspCode": "97", "Message": "Invalid Checksum"},
        )

    order_id = params.get("vnp_TxnRef")
    response_code = params.get("vnp_ResponseCode")
    amount = int(params.get("vnp_Amount", "0")) / 100

    if response_code == "00":
        print(f"[IPN] Order {order_id} paid {amount} VND.")
    else:
        print(f"[IPN] Order {order_id} failed (code: {response_code}).")

    return JSONResponse(
        status_code=200,
        content={"RspCode": "00", "Message": "Confirm Success"},
    )
