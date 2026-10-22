import unittest
import uuid
from decimal import Decimal
from unittest.mock import MagicMock, patch

from src.app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from src.app.modules.orders.enums.order_enums import PaymentMethod, PaymentStatus
from src.app.modules.orders.model import Order
from src.app.modules.payments.schemas import CreatePaymentRequest
from src.app.modules.payments.service import PaymentService
from src.app.modules.users.model import User  # Đảm bảo mapper đăng ký đủ quan hệ User


class TestPaymentService(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        self.service = PaymentService(self.mock_db)
        self.user_id = uuid.uuid4()

        self.mock_order = MagicMock(spec=Order)
        self.mock_order.order_id = "OD123456"
        self.mock_order.user_id = self.user_id
        self.mock_order.total = Decimal("250000.00")
        self.mock_order.status = "PENDING"
        self.mock_order.payment_status = "PENDING"
        self.mock_order.payment_method = "COD"

    def test_payment_cod(self):
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )

        req = CreatePaymentRequest(order_id="OD123456")
        res = self.service.create_payment(user_id=self.user_id, request=req)

        self.assertEqual(res.payment_method, PaymentMethod.COD)
        self.assertEqual(res.amount, Decimal("250000.00"))
        self.assertIsNone(res.payment_url)
        self.assertIn("COD", res.message)

    def test_payment_vnpay(self):
        self.mock_order.payment_method = "VNPAY"
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )

        req = CreatePaymentRequest(order_id="OD123456")
        res = self.service.create_payment(user_id=self.user_id, request=req)

        self.assertEqual(res.payment_method, PaymentMethod.VNPAY)
        self.assertEqual(res.amount, Decimal("250000.00"))
        self.assertIsNotNone(res.payment_url)
        self.assertIn("vnp_Amount=25000000", res.payment_url)

    def test_payment_forbidden_user(self):
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )

        other_user_id = uuid.uuid4()
        req = CreatePaymentRequest(order_id="OD123456")

        with self.assertRaises(ForbiddenException):
            self.service.create_payment(user_id=other_user_id, request=req)

    def test_payment_already_paid(self):
        self.mock_order.payment_status = PaymentStatus.PAID.value
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )

        req = CreatePaymentRequest(order_id="OD123456")

        with self.assertRaises(BadRequestException) as ctx:
            self.service.create_payment(user_id=self.user_id, request=req)
        self.assertEqual(ctx.exception.error_code, "ORDER_ALREADY_PAID")

    def test_payment_cancelled_order(self):
        self.mock_order.status = "CANCELLED"
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )

        req = CreatePaymentRequest(order_id="OD123456")

        with self.assertRaises(BadRequestException) as ctx:
            self.service.create_payment(user_id=self.user_id, request=req)
        self.assertEqual(ctx.exception.error_code, "ORDER_CANCELLED")

    def test_payment_not_found(self):
        self.service.order_repo.get_order_by_id = MagicMock(return_value=None)

        req = CreatePaymentRequest(order_id="NOT_EXIST")

        with self.assertRaises(NotFoundException):
            self.service.create_payment(user_id=self.user_id, request=req)

    def test_payment_unsupported_method(self):
        self.mock_order.payment_method = "UNKNOWN"
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )

        req = CreatePaymentRequest(order_id="OD123456")

        with self.assertRaises(BadRequestException) as ctx:
            self.service.create_payment(user_id=self.user_id, request=req)
        self.assertEqual(ctx.exception.error_code, "UNSUPPORTED_PAYMENT_METHOD")

    def test_vnpay_ipn_invalid_checksum(self):
        params = {"vnp_TxnRef": "OD123456_12345", "vnp_SecureHash": "invalid"}
        res = self.service.handle_vnpay_ipn(params)
        self.assertEqual(res["RspCode"], "97")

    def test_vnpay_ipn_success(self):
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )
        params = {
            "vnp_TxnRef": "OD123456_12345",
            "vnp_Amount": "25000000",
            "vnp_ResponseCode": "00",
            "vnp_TransactionNo": "12345678",
        }

        with patch(
            "src.app.modules.payments.vnpay.service.VNPayService.validate_response",
            return_value=True,
        ):
            res = self.service.handle_vnpay_ipn(params)

        self.assertEqual(res["RspCode"], "00")
        self.assertEqual(self.mock_order.payment_status, PaymentStatus.PAID.value)

    def test_vnpay_return_success(self):
        self.service.order_repo.get_order_by_id = MagicMock(
            return_value=self.mock_order
        )
        params = {
            "vnp_TxnRef": "OD123456_12345",
            "vnp_Amount": "25000000",
            "vnp_ResponseCode": "00",
            "vnp_TransactionNo": "12345678",
        }

        with patch(
            "src.app.modules.payments.vnpay.service.VNPayService.validate_response",
            return_value=True,
        ):
            res = self.service.handle_vnpay_return(params)

        self.assertEqual(res["status"], "Success")
        self.assertEqual(res["order_id"], "OD123456")
        self.assertEqual(res["amount"], 250000.0)


if __name__ == "__main__":
    unittest.main()
