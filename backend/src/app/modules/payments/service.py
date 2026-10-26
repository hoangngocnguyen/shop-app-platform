import time
import urllib.parse
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from src.app.core.config import settings
from src.app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from src.app.modules.orders.enums.order_enums import PaymentMethod, PaymentStatus
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.payments.schemas import (
    CreatePaymentRequest,
    CreatePaymentResponse,
)
from src.app.modules.payments.vnpay.service import VNPayService


class PaymentService:
    """Service điều phối nghiệp vụ thanh toán giữa Orders và Cổng thanh toán (VNPAY, COD)."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.order_repo = OrderRepository(db)

    def create_payment(
        self,
        user_id: UUID,
        request: CreatePaymentRequest,
        client_ip: str = "127.0.0.1",
    ) -> CreatePaymentResponse:
        """
        Khởi tạo thông tin thanh toán cho đơn hàng.
        - Kiểm tra quyền sở hữu đơn hàng
        - Kiểm tra tính hợp lệ trạng thái đơn và trạng thái thanh toán
        - Tạo URL thanh toán VNPAY hoặc xác nhận phương thức COD
        """
        order = self.order_repo.get_order_by_id(request.order_id)
        if not order:
            raise NotFoundException(resource="Đơn hàng", id_or_slug=request.order_id)

        if order.user_id != user_id:
            raise ForbiddenException(
                "Bạn không có quyền thực hiện thanh toán cho đơn hàng này"
            )

        if order.status == "CANCELLED":
            raise BadRequestException(
                message="Đơn hàng đã bị hủy, không thể thực hiện thanh toán",
                error_code="ORDER_CANCELLED",
            )

        if order.status == "COMPLETED":
            raise BadRequestException(
                message="Đơn hàng đã hoàn thành trước đó",
                error_code="ORDER_COMPLETED",
            )

        if order.payment_status == PaymentStatus.PAID.value:
            raise BadRequestException(
                message="Đơn hàng này đã được thanh toán thành công",
                error_code="ORDER_ALREADY_PAID",
            )

        current_method = order.payment_method

        # 1. Thanh toán qua Cổng VNPAY
        if current_method == PaymentMethod.VNPAY.value:
            return self._initiate_vnpay_payment(order, client_ip)

        # 2. Thanh toán khi nhận hàng (COD)
        if current_method == PaymentMethod.COD.value:
            return CreatePaymentResponse(
                order_id=order.order_id,
                payment_method=PaymentMethod.COD,
                amount=order.total,
                payment_url=None,
                message="Đơn hàng áp dụng phương thức thanh toán khi nhận hàng (COD)",
            )

        raise BadRequestException(
            message=f"Phương thức thanh toán '{current_method}' chưa được hỗ trợ",
            error_code="UNSUPPORTED_PAYMENT_METHOD",
        )

    def _initiate_vnpay_payment(
        self, order: Any, client_ip: str
    ) -> CreatePaymentResponse:
        """Tạo URL chuyển hướng thanh toán VNPAY."""
        # Tránh trùng lặp vnp_TxnRef trên cùng 1 order_id khi khách bấm thanh toán lại
        txn_ref = f"{order.order_id}_{int(time.time())}"
        order_info = f"Thanh toan don hang {order.order_id}"

        vnpay_service = VNPayService(settings.VNP_HASH_SECRET)
        payload = vnpay_service.create_payment_payload(
            amount=int(order.total),
            order_info=order_info,
            txn_ref=txn_ref,
            ip_addr=client_ip,
        )
        payload["vnp_TmnCode"] = settings.VNP_TMN_CODE
        payload["vnp_ReturnUrl"] = settings.VNP_RETURN_URL

        payment_url = vnpay_service.create_payment_url(settings.VNP_URL, payload)

        if settings.VNP_IPN_URL:
            ipn_url = urllib.parse.quote_plus(settings.VNP_IPN_URL)
            payment_url = f"{payment_url}&vnp_IpnUrl={ipn_url}"

        return CreatePaymentResponse(
            order_id=order.order_id,
            payment_method=PaymentMethod.VNPAY,
            amount=order.total,
            payment_url=payment_url,
            message="Khởi tạo link thanh toán VNPAY thành công",
        )

    def _mark_payment_success(
        self, order: Any, transaction_no: str, source: str
    ) -> bool:
        """
        Cập nhật trạng thái thanh toán đơn hàng thành công một cách an toàn và idempotent.
        Trả về True nếu trạng thái được cập nhật mới, False nếu đã thanh toán trước đó.
        """
        if order.payment_status == PaymentStatus.PAID.value:
            return False

        order.payment_status = PaymentStatus.PAID.value
        order.payment_date = datetime.now(UTC)
        self.order_repo.add_order_log(
            order_id=order.order_id,
            status=order.status,
            description=f"Thanh toán VNPAY thành công qua {source} (Mã GD: {transaction_no})",
            user_id=order.user_id,
        )
        self.db.commit()
        return True

    def handle_vnpay_ipn(self, params: dict[str, str]) -> dict[str, str]:
        """
        Xử lý Server-to-Server Webhook thông báo kết quả giao dịch từ VNPAY.
        Trả về JSON đúng chuẩn VNPAY IPN Specification.
        """
        service = VNPayService(settings.VNP_HASH_SECRET)
        if not service.validate_response(params):
            return {"RspCode": "97", "Message": "Invalid Checksum"}

        txn_ref = params.get("vnp_TxnRef", "")
        order_id = txn_ref.split("_")[0] if "_" in txn_ref else txn_ref

        # Sử dụng for_update=True để lock bản ghi đơn hàng, ngăn ngừa race condition
        order = self.order_repo.get_order_by_id(order_id, for_update=True)
        if not order:
            return {"RspCode": "01", "Message": "Order not found"}

        # Kiểm tra tính toàn vẹn số tiền
        vnp_amount = Decimal(int(params.get("vnp_Amount", "0")) / 100)
        if vnp_amount != order.total:
            return {"RspCode": "04", "Message": "Invalid amount"}

        if order.payment_status == PaymentStatus.PAID.value:
            return {"RspCode": "02", "Message": "Order already confirmed"}

        response_code = params.get("vnp_ResponseCode")
        transaction_no = params.get("vnp_TransactionNo", "N/A")

        if response_code == "00":
            self._mark_payment_success(order, transaction_no, source="IPN")
        else:
            order.payment_status = PaymentStatus.FAILED.value
            self.order_repo.add_order_log(
                order_id=order.order_id,
                status=order.status,
                description=f"Thanh toán VNPAY thất bại qua IPN (Mã lỗi: {response_code})",
                user_id=order.user_id,
            )
            self.db.commit()

        return {"RspCode": "00", "Message": "Confirm Success"}

    def handle_vnpay_return(self, params: dict[str, str]) -> dict[str, Any]:
        """
        Xử lý dữ liệu trả về khi khách hàng hoàn tất thanh toán và được VNPAY redirect về.
        Cập nhật trạng thái đơn hàng an toàn ngay cả khi IPN chưa kịp đến.
        """
        service = VNPayService(settings.VNP_HASH_SECRET)
        if not service.validate_response(params):
            raise BadRequestException(
                message="Checksum VNPay không hợp lệ",
                error_code="INVALID_VNPAY_CHECKSUM",
            )

        txn_ref = params.get("vnp_TxnRef", "")
        order_id = txn_ref.split("_")[0] if "_" in txn_ref else txn_ref
        response_code = params.get("vnp_ResponseCode", "")
        amount = float(int(params.get("vnp_Amount", "0")) / 100)
        transaction_no = params.get("vnp_TransactionNo", "N/A")

        # Sử dụng for_update=True để an toàn lock dòng với IPN song song
        order = self.order_repo.get_order_by_id(order_id, for_update=True)
        if order and response_code == "00":
            # Kiểm tra tính toàn vẹn số tiền
            vnp_amount = Decimal(int(params.get("vnp_Amount", "0")) / 100)
            if vnp_amount == order.total:
                self._mark_payment_success(
                    order, transaction_no, source="Return URL"
                )

        payload: dict[str, Any] = {
            "status": "Success" if response_code == "00" else "Failed",
            "order_id": order_id,
            "amount": amount,
            "response_code": response_code,
        }

        if response_code != "00":
            payload["message"] = "Giao dịch thanh toán không thành công"

        return payload
