import unittest
import uuid
from unittest.mock import MagicMock, patch

from src.app.core.config import settings
from src.app.core.exceptions import BadRequestException
from src.app.modules.auth.schema import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from src.app.modules.auth.service import AuthService
from src.app.modules.emails.protocol import IEmailSender
from src.app.modules.emails.service import GmailSmtpEmailSender
from src.app.modules.users.model import User


class TestEmailService(unittest.TestCase):
    """Kiểm thử tính đúng đắn của EmailService và các Jinja2 Templates."""

    def setUp(self):
        self.sender = GmailSmtpEmailSender()

    def test_protocol_implementation(self):
        """Đảm bảo GmailSmtpEmailSender tuân thủ đúng IEmailSender Protocol."""
        self.assertIsInstance(self.sender, IEmailSender)

    def test_render_reset_password_template(self):
        """Kiểm tra render template reset_password.html thành công."""
        html = self.sender._render_template(
            "reset_password.html",
            {
                "customer_name": "Nguyễn Văn A",
                "reset_link": "https://shop.example.com/reset-password?token=abc",
                "expire_minutes": 15,
            },
        )
        self.assertIn("Nguyễn Văn A", html)
        self.assertIn("https://shop.example.com/reset-password?token=abc", html)
        self.assertIn("15 phút", html)
        self.assertIn("Đặt lại mật khẩu mới", html)

    def test_render_order_placed_template(self):
        """Kiểm tra render template order_placed.html."""
        html = self.sender._render_template(
            "order_placed.html",
            {
                "customer_name": "Trần Thị B",
                "order_code": "OD999999",
                "items": [
                    {
                        "product_name": "Áo sơ mi nam Oxford",
                        "variant_info": "Xanh nhạt / Size M",
                        "quantity": 2,
                        "unit_price": 250000,
                        "subtotal": 500000,
                    }
                ],
                "total_amount": "500,000",
                "payment_method": "VNPAY",
                "payment_url": "https://sandbox.vnpayment.vn/payment",
            },
        )
        self.assertIn("OD999999", html)
        self.assertIn("Áo sơ mi nam Oxford", html)
        self.assertIn("500,000 đ", html)
        self.assertIn("Thanh toán VNPAY ngay", html)

    def test_render_order_shipping_template(self):
        """Kiểm tra render template order_shipping.html."""
        html = self.sender._render_template(
            "order_shipping.html",
            {
                "customer_name": "Lê Văn C",
                "order_code": "OD888888",
                "tracking_code": "VNPOST123456",
                "shipping_address": "123 Đường Cầu Giấy, Hà Nội",
                "total_amount": "300,000",
            },
        )
        self.assertIn("OD888888", html)
        self.assertIn("VNPOST123456", html)
        self.assertIn("123 Đường Cầu Giấy", html)

    def test_render_order_delivered_template(self):
        """Kiểm tra render template order_delivered.html."""
        html = self.sender._render_template(
            "order_delivered.html",
            {
                "customer_name": "Hoàng Văn D",
                "order_code": "OD777777",
                "delivered_at": "21/11/2026 21:00",
                "total_amount": "450,000",
            },
        )
        self.assertIn("OD777777", html)
        self.assertIn("21/11/2026 21:00", html)

    def test_render_order_cancelled_template(self):
        """Kiểm tra render template order_cancelled.html."""
        html = self.sender._render_template(
            "order_cancelled.html",
            {
                "customer_name": "Vũ Thị E",
                "order_code": "OD666666",
                "cancel_reason": "Sản phẩm đã hết hàng trong kho",
            },
        )
        self.assertIn("OD666666", html)
        self.assertIn("Sản phẩm đã hết hàng trong kho", html)

    def test_render_account_status_template(self):
        """Kiểm tra render template account_status.html (cả trường hợp khóa và mở khóa)."""
        html_locked = self.sender._render_template(
            "account_status.html",
            {
                "customer_name": "Phạm Văn F",
                "is_locked": True,
                "reason": "Vi phạm điều khoản thanh toán",
            },
        )
        self.assertIn("TẠM KHÓA", html_locked)
        self.assertIn("Vi phạm điều khoản thanh toán", html_locked)

        html_unlocked = self.sender._render_template(
            "account_status.html",
            {
                "customer_name": "Phạm Văn F",
                "is_locked": False,
            },
        )
        self.assertIn("KÍCH HOẠT LẠI", html_unlocked)

    def test_smtp_send_without_credentials_does_not_crash(self):
        """Khi chưa cấu hình tài khoản SMTP, hệ thống bỏ qua an toàn và trả về False."""
        with patch.object(settings, "SMTP_USER", ""):
            success = self.sender._send_smtp_raw(
                to_email="test@example.com",
                subject="Test Subject",
                html_content="<p>Test</p>",
            )
            self.assertFalse(success)

    @patch("smtplib.SMTP")
    def test_smtp_send_success(self, mock_smtp_cls):
        """Khi đã cấu hình tài khoản SMTP, gửi thư thành công."""
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        with patch.object(settings, "SMTP_USER", "shop@gmail.com"), \
             patch.object(settings, "SMTP_PASSWORD", "app_password_16_chars"), \
             patch.object(settings, "SMTP_PORT", 587):
            success = self.sender._send_smtp_raw(
                to_email="customer@example.com",
                subject="Test Mail",
                html_content="<p>Test Content</p>",
            )
            self.assertTrue(success)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("shop@gmail.com", "app_password_16_chars")
            mock_server.sendmail.assert_called_once()


class TestAuthForgotPasswordAndReset(unittest.TestCase):
    """Kiểm thử tính năng Quên & Đổi mật khẩu trong AuthService."""

    def setUp(self):
        self.mock_db = MagicMock()
        self.mock_email_sender = MagicMock(spec=IEmailSender)

    def test_forgot_password_user_not_found_returns_generic_message(self):
        """Chống Account Enumeration: Email không tồn tại vẫn trả về thông báo tiếp nhận."""
        self.mock_db.query.return_value.filter.return_value.first.return_value = None

        response = AuthService.forgot_password(
            db=self.mock_db,
            email="nonexistent@example.com",
            email_sender=self.mock_email_sender,
        )

        self.assertIn("Nếu địa chỉ email này tồn tại trên hệ thống", response.message)
        # Không được gọi hàm gửi email
        self.mock_email_sender.send_reset_password.assert_not_called()

    @patch("httpx.Client.post")
    def test_forgot_password_user_found_calls_supabase_and_sends_email(self, mock_post):
        """User hợp lệ: Gọi Supabase Admin API generate_link và gửi email chứa recovery link."""
        mock_user = MagicMock(spec=User)
        mock_user.name = "Nguyễn Văn Hưng"
        mock_user.email = "hung@example.com"
        mock_user.is_blocked = False
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_user

        # Mock Supabase response
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "hashed_token": "token_hash_abc_123",
            "action_link": "https://elehzxltxegkweocfhvc.supabase.co/auth/v1/verify?token=abc",
        }
        mock_post.return_value = mock_resp

        with patch.object(settings, "SUPABASE_URL", "https://mock.supabase.co"), \
             patch.object(settings, "SUPABASE_SERVICE_ROLE_KEY", "mock_service_key"), \
             patch.object(settings, "FRONTEND_URL", "http://localhost:3000"):
            response = AuthService.forgot_password(
                db=self.mock_db,
                email="hung@example.com",
                email_sender=self.mock_email_sender,
            )

            self.assertIn("Nếu địa chỉ email này tồn tại trên hệ thống", response.message)
            self.mock_email_sender.send_reset_password.assert_called_once()
            args, kwargs = self.mock_email_sender.send_reset_password.call_args
            self.assertEqual(kwargs["to_email"], "hung@example.com")
            self.assertEqual(kwargs["customer_name"], "Nguyễn Văn Hưng")
            self.assertIn("token_hash=token_hash_abc_123", kwargs["reset_link"])

    @patch("httpx.Client.put")
    @patch("httpx.Client.post")
    def test_reset_password_success(self, mock_post, mock_put):
        """Đổi mật khẩu thành công khi token hợp lệ."""
        # Mock verify token
        verify_resp = MagicMock()
        verify_resp.status_code = 200
        verify_resp.json.return_value = {"access_token": "valid_user_access_token"}
        mock_post.return_value = verify_resp

        # Mock update password
        update_resp = MagicMock()
        update_resp.status_code = 200
        mock_put.return_value = update_resp

        with patch.object(settings, "SUPABASE_URL", "https://mock.supabase.co"), \
             patch.object(settings, "SUPABASE_SERVICE_ROLE_KEY", "mock_service_key"):
            response = AuthService.reset_password(
                token="valid_recovery_token",
                new_password="NewSecurePass2026",
            )
            self.assertIn("Đặt lại mật khẩu thành công", response.message)

    @patch("httpx.Client.post")
    def test_reset_password_invalid_token_raises_bad_request(self, mock_post):
        """Token hết hạn hoặc không hợp lệ sẽ ném ngoại lệ BadRequestException."""
        verify_resp = MagicMock()
        verify_resp.status_code = 400
        verify_resp.text = "Token expired or invalid"
        mock_post.return_value = verify_resp

        with patch.object(settings, "SUPABASE_URL", "https://mock.supabase.co"):
            with self.assertRaises(BadRequestException):
                AuthService.reset_password(
                    token="expired_token",
                    new_password="NewSecurePass2026",
                )


if __name__ == "__main__":
    unittest.main()
