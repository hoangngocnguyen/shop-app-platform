import hashlib
import hmac
import random
import urllib.parse
from collections.abc import Mapping
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo


def get_vnpay_dates() -> tuple[str, str]:
    """Tạo thời gian tạo và hết hạn theo múi giờ Việt Nam."""
    tz = ZoneInfo("Asia/Ho_Chi_Minh")
    now = datetime.now(tz)
    return (
        now.strftime("%Y%m%d%H%M%S"),
        (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S"),
    )


class VNPayService:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

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
