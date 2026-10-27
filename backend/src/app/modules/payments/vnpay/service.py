import hashlib
import hmac
import random
import time
import urllib.parse
from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from src.app.core.config import settings
from src.app.core.exceptions import BadRequestException
from src.app.modules.orders.enums.order_enums import PaymentMethod, PaymentStatus
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.payments.schemas import CreatePaymentResponse


def get_vnpay_dates() -> tuple[str, str]:
    """Tạo thời gian tạo và hết hạn theo múi giờ Việt Nam."""
    tz = ZoneInfo("Asia/Ho_Chi_Minh")
    now = datetime.now(tz)
    return (
        now.strftime("%Y%m%d%H%M%S"),
        (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S"),
    )


class VNPayService:
    """Service xử lý toàn bộ logic kỹ thuật và nghiệp vụ giao dịch cổng thanh toán VNPAY."""

    def __init__(
        self,
        secret_key: str | None = None,
        db: Session | None = None,
    ) -> None:
        self.secret_key = secret_key or settings.VNP_HASH_SECRET
        self.db = db
        self.order_repo = OrderRepository(db) if db else None

    # =========================================================================
    # 1. TECHNICAL & CRYPTO HELPERS
    # =========================================================================

    @staticmethod
    def _normalize_params(params: Mapping[str, str]) -> dict[str, str]:
        return {
            str(key): str(value) for key, value in params.items() if value is not None
        }

    def _calculate_secure_hash(self, params: Mapping[str, str]) -> str:
        query_string = urllib.parse.urlencode(
            sorted(self._normalize_params(params).items()),
            quote_via=urllib.parse.quote_plus,
        )
        return hmac.new(
            self.secret_key.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()

    def create_payment_payload(
        self,
        amount: int,
        order_info: str,
        txn_ref: str | None = None,
        ip_addr: str = "127.0.0.1",
    ) -> dict[str, str]:
        create_date, expire_date = get_vnpay_dates()
        payload = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_Amount": str(amount * 100),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": txn_ref or f"OD{random.randint(100000, 999999)}",
            "vnp_OrderInfo": order_info,
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_IpAddr": ip_addr,
            "vnp_CreateDate": create_date,
            "vnp_ExpireDate": expire_date,
        }
        return payload

    def create_payment_url(self, vnpay_url: str, params: Mapping[str, str]) -> str:
        normalized_params = self._normalize_params(params)
        query_string = urllib.parse.urlencode(
            sorted(normalized_params.items()),
            quote_via=urllib.parse.quote_plus,
        )
        secure_hash = self._calculate_secure_hash(normalized_params)
        return f"{vnpay_url}?{query_string}&vnp_SecureHash={secure_hash}"

    def validate_response(self, response_params: Mapping[str, str]) -> bool:
        params = dict(response_params)
        vnp_secure_hash = params.pop("vnp_SecureHash", None)
        params.pop("vnp_SecureHashType", None)

        return vnp_secure_hash == self._calculate_secure_hash(params)

    # =========================================================================
    # 2. BUSINESS WORKFLOWS (INITIATE, IPN, RETURN)
    # =========================================================================

    def create_payment(
        self,
        order: Any,
        client_ip: str = "127.0.0.1",
    ) -> CreatePaymentResponse:
        """Tạo URL chuyển hướng thanh toán VNPAY cho đơn hàng."""
        txn_ref = f"{order.order_id}_{int(time.time())}"
        order_info = f"Thanh toan don hang {order.order_id}"

        payload = self.create_payment_payload(
            amount=int(order.total),
            order_info=order_info,
            txn_ref=txn_ref,
            ip_addr=client_ip,
        )
        payload["vnp_TmnCode"] = settings.VNP_TMN_CODE
        payload["vnp_ReturnUrl"] = settings.VNP_RETURN_URL

        payment_url = self.create_payment_url(settings.VNP_URL, payload)

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
        self,
        order: Any,
        transaction_no: str,
        source: str,
    ) -> bool:
        """
        Cập nhật trạng thái thanh toán đơn hàng thành công một cách an toàn và idempotent.
        Ghi log thân thiện cho khách hàng (description) và lưu chi tiết audit (extra_data).
        """
        if order.payment_status == PaymentStatus.PAID.value:
            return False

        order.payment_status = PaymentStatus.PAID.value
        order.payment_date = datetime.now(UTC)

        if self.order_repo:
            self.order_repo.add_order_log(
                order_id=order.order_id,
                status=order.status,
                description=f"Thanh toán thành công qua VNPAY (Mã GD: {transaction_no})",
                user_id=order.user_id,
                extra_data={
                    "gateway": "VNPAY",
                    "source": source,
                    "transaction_no": transaction_no,
                    "payment_status": PaymentStatus.PAID.value,
                },
            )

        if self.db:
            self.db.commit()

        return True

    def handle_ipn(self, params: dict[str, str]) -> dict[str, str]:
        """
        Xử lý Server-to-Server Webhook thông báo kết quả giao dịch từ VNPAY.
        Trả về JSON đúng chuẩn VNPAY IPN Specification.
        """
        if not self.validate_response(params):
            return {"RspCode": "97", "Message": "Invalid Checksum"}

        txn_ref = params.get("vnp_TxnRef", "")
        order_id = txn_ref.split("_")[0] if "_" in txn_ref else txn_ref

        if not self.order_repo:
            return {"RspCode": "99", "Message": "Database connection not initialized"}

        # Sử dụng for_update=True để lock bản ghi đơn hàng, ngăn ngừa race condition
        order = self.order_repo.get_order_by_id(order_id, for_update=True)
        if not order:
            return {"RspCode": "01", "Message": "Order not found"}

        # Kiểm tra tính toàn vẹn số tiền
        vnp_amount = Decimal(int(params.get("vnp_Amount", "0")) / 100)
        if vnp_amount != order.total:
            return {"RspCode": "04", "Message": "Invalid Amount"}

        # Kiểm tra trạng thái đơn hàng (Đã xác nhận trước đó)
        if order.payment_status == PaymentStatus.PAID.value:
            return {"RspCode": "02", "Message": "Order already confirmed"}

        response_code = params.get("vnp_ResponseCode", "")
        transaction_no = params.get("vnp_TransactionNo", "N/A")

        if response_code == "00":
            self._mark_payment_success(order, transaction_no, source="IPN")
        else:
            order.payment_status = PaymentStatus.FAILED.value
            self.order_repo.add_order_log(
                order_id=order.order_id,
                status=order.status,
                description="Thanh toán qua VNPAY không thành công",
                user_id=order.user_id,
                extra_data={
                    "gateway": "VNPAY",
                    "source": "IPN",
                    "response_code": response_code,
                    "transaction_no": transaction_no,
                    "payment_status": PaymentStatus.FAILED.value,
                },
            )
            if self.db:
                self.db.commit()

        return {"RspCode": "00", "Message": "Confirm Success"}

    def handle_return(self, params: dict[str, str]) -> dict[str, Any]:
        """
        Xử lý dữ liệu trả về khi khách hàng hoàn tất thanh toán và được VNPAY redirect về.
        Cập nhật trạng thái đơn hàng an toàn ngay cả khi IPN chưa kịp đến.
        """
        if not self.validate_response(params):
            raise BadRequestException(
                message="Checksum VNPay không hợp lệ",
                error_code="INVALID_VNPAY_CHECKSUM",
            )

        txn_ref = params.get("vnp_TxnRef", "")
        order_id = txn_ref.split("_")[0] if "_" in txn_ref else txn_ref
        response_code = params.get("vnp_ResponseCode", "")
        amount = float(int(params.get("vnp_Amount", "0")) / 100)
        transaction_no = params.get("vnp_TransactionNo", "N/A")

        if not self.order_repo:
            raise BadRequestException(message="Database session not found")

        order = self.order_repo.get_order_by_id(order_id, for_update=True)
        if order and response_code == "00":
            vnp_amount = Decimal(int(params.get("vnp_Amount", "0")) / 100)
            if vnp_amount == order.total:
                self._mark_payment_success(order, transaction_no, source="Return URL")

        payload: dict[str, Any] = {
            "status": "Success" if response_code == "00" else "Failed",
            "order_id": order_id,
            "amount": amount,
            "response_code": response_code,
        }

        if response_code != "00":
            payload["message"] = "Giao dịch thanh toán không thành công"

        return payload
