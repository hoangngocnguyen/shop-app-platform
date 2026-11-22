import logging
import smtplib
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from pathlib import Path
from typing import Any

from fastapi import BackgroundTasks
from jinja2 import Environment, FileSystemLoader, select_autoescape

from src.app.core.config import settings
from src.app.modules.emails.schema import EmailItemSummary

logger = logging.getLogger(__name__)


class GmailSmtpEmailSender:
    """
    Triển khai IEmailSender gửi thư qua Google Gmail SMTP và Jinja2 Template.
    Hỗ trợ gửi trực tiếp hoặc chạy ngầm qua FastAPI BackgroundTasks.
    """

    def __init__(self, templates_dir: Path | None = None) -> None:
        if templates_dir is None:
            templates_dir = Path(__file__).resolve().parent / "templates"

        self.templates_dir = templates_dir
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.templates_dir),
            autoescape=select_autoescape(["html", "xml"]),
        )

    def _render_template(self, template_name: str, context: dict[str, Any]) -> str:
        """Render nội dung HTML từ file template."""
        template = self.jinja_env.get_template(template_name)
        # Đưa các biến mặc định vào context
        full_context = {
            "brand_name": settings.SMTP_FROM_NAME,
            "frontend_url": settings.FRONTEND_URL,
            **context,
        }
        return template.render(**full_context)

    def _send_smtp_raw(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None,
    ) -> bool:
        """
        Kết nối tới máy chủ SMTP (Gmail) và phát tán email.
        Ghi log an toàn, không để ngoại lệ làm crash ứng dụng.
        """
        smtp_user = (settings.SMTP_USER or "").strip()
        smtp_password = (settings.SMTP_PASSWORD or "").strip()
        from_email = (settings.SMTP_FROM_EMAIL or smtp_user).strip()
        from_name = settings.SMTP_FROM_NAME or "Shop App Platform"

        # Nếu chưa cấu hình thông tin SMTP, ghi log cảnh báo và không ném lỗi
        if not smtp_user or not smtp_password:
            logger.warning(
                "[EMAIL_SERVICE] Chưa cấu hình SMTP_USER hoặc SMTP_PASSWORD trong môi trường. "
                "Bỏ qua bước gửi email đến '%s' với tiêu đề '%s'.",
                to_email,
                subject,
            )
            return False

        message = MIMEMultipart("alternative")
        # Format sender name with UTF-8
        message["From"] = formataddr((str(Header(from_name, "utf-8")), from_email))
        message["To"] = to_email
        message["Subject"] = Header(subject, "utf-8").encode()

        if text_content:
            message.attach(MIMEText(text_content, "plain", "utf-8"))
        message.attach(MIMEText(html_content, "html", "utf-8"))

        host = settings.SMTP_HOST
        port = settings.SMTP_PORT
        use_tls = settings.SMTP_TLS

        try:
            logger.info(
                "[EMAIL_SERVICE] Đang kết nối tới %s:%d để gửi email đến %s...",
                host,
                port,
                to_email,
            )
            if port == 465:
                # SSL trực tiếp
                with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                    server.login(smtp_user, smtp_password)
                    server.sendmail(from_email, [to_email], message.as_string())
            else:
                # STARTTLS (Port 587 hoặc cổng thông thường)
                with smtplib.SMTP(host, port, timeout=15) as server:
                    server.ehlo()
                    if use_tls:
                        server.starttls()
                        server.ehlo()
                    server.login(smtp_user, smtp_password)
                    server.sendmail(from_email, [to_email], message.as_string())

            logger.info("[EMAIL_SERVICE] Đã gửi email thành công tới: %s", to_email)
            return True

        except smtplib.SMTPAuthenticationError as auth_err:
            logger.error(
                "[EMAIL_SERVICE] Lỗi xác thực SMTP: %s. Hãy kiểm tra lại Gmail App Password (16 ký tự).",
                auth_err,
            )
            return False
        except Exception as exc:
            logger.error(
                "[EMAIL_SERVICE] Gửi email thất bại tới %s: %s",
                to_email,
                exc,
                exc_info=True,
            )
            return False

    def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: dict[str, Any],
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Render template và gửi email (chạy ngầm nếu có background_tasks)."""
        html_content = self._render_template(template_name, context)

        if background_tasks:
            background_tasks.add_task(
                self._send_smtp_raw,
                to_email=to_email,
                subject=subject,
                html_content=html_content,
            )
            return True
        return self._send_smtp_raw(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
        )

    def send_reset_password(
        self,
        to_email: str,
        customer_name: str,
        reset_link: str,
        expire_minutes: int = 15,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email khôi phục mật khẩu."""
        subject = f"[{settings.SMTP_FROM_NAME}] Hướng dẫn đặt lại mật khẩu tài khoản"
        context = {
            "subject": subject,
            "customer_name": customer_name,
            "reset_link": reset_link,
            "expire_minutes": expire_minutes,
        }
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="reset_password.html",
            context=context,
            background_tasks=background_tasks,
        )

    def send_order_placed(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        items: list[EmailItemSummary],
        total_amount: str,
        payment_method: str,
        payment_url: str | None = None,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email xác nhận đặt hàng kèm link thanh toán VNPAY (nếu có)."""
        subject = f"[{settings.SMTP_FROM_NAME}] Xác nhận đơn hàng thành công #{order_code}"
        context = {
            "subject": subject,
            "customer_name": customer_name,
            "order_code": order_code,
            "items": items,
            "total_amount": total_amount,
            "payment_method": payment_method,
            "payment_url": payment_url,
        }
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="order_placed.html",
            context=context,
            background_tasks=background_tasks,
        )

    def send_order_shipping(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        tracking_code: str | None,
        shipping_address: str,
        total_amount: str,
        items: list[EmailItemSummary],
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo đơn hàng đang được vận chuyển."""
        subject = f"[{settings.SMTP_FROM_NAME}] Đơn hàng #{order_code} đang trên đường giao tới bạn"
        context = {
            "subject": subject,
            "customer_name": customer_name,
            "order_code": order_code,
            "tracking_code": tracking_code,
            "shipping_address": shipping_address,
            "total_amount": total_amount,
            "items": items,
        }
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="order_shipping.html",
            context=context,
            background_tasks=background_tasks,
        )

    def send_order_delivered(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        delivered_at: str,
        total_amount: str,
        items: list[EmailItemSummary],
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo đơn hàng đã giao thành công."""
        subject = f"[{settings.SMTP_FROM_NAME}] Đơn hàng #{order_code} đã được giao thành công"
        context = {
            "subject": subject,
            "customer_name": customer_name,
            "order_code": order_code,
            "delivered_at": delivered_at,
            "total_amount": total_amount,
            "items": items,
        }
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="order_delivered.html",
            context=context,
            background_tasks=background_tasks,
        )

    def send_order_cancelled(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        cancel_reason: str,
        total_amount: str,
        items: list[EmailItemSummary],
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo hủy đơn hàng kèm lý do."""
        subject = f"[{settings.SMTP_FROM_NAME}] Thông báo hủy đơn hàng #{order_code}"
        context = {
            "subject": subject,
            "customer_name": customer_name,
            "order_code": order_code,
            "cancel_reason": cancel_reason,
            "total_amount": total_amount,
            "items": items,
        }
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="order_cancelled.html",
            context=context,
            background_tasks=background_tasks,
        )

    def send_account_status_changed(
        self,
        to_email: str,
        customer_name: str,
        is_locked: bool,
        reason: str | None = None,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo tài khoản bị khóa hoặc được kích hoạt lại."""
        status_text = "tạm khóa" if is_locked else "kích hoạt lại"
        subject = f"[{settings.SMTP_FROM_NAME}] Thông báo tài khoản của bạn đã được {status_text}"
        context = {
            "subject": subject,
            "customer_name": customer_name,
            "is_locked": is_locked,
            "reason": reason,
        }
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="account_status.html",
            context=context,
            background_tasks=background_tasks,
        )
