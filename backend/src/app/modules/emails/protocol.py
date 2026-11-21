from typing import Any, Protocol, runtime_checkable
from fastapi import BackgroundTasks


@runtime_checkable
class IEmailSender(Protocol):
    """
    Interface trừu tượng chuẩn hóa các tác vụ gửi email trong toàn bộ hệ thống.
    Các module nghiệp vụ (auth, orders, users...) chỉ phụ thuộc vào Protocol này.
    """

    def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: dict[str, Any],
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """
        Gửi email dựa trên Jinja2 HTML template.
        Nếu truyền background_tasks, tác vụ kết nối và gửi SMTP sẽ được chạy ngầm.
        """
        ...

    def send_reset_password(
        self,
        to_email: str,
        customer_name: str,
        reset_link: str,
        expire_minutes: int = 15,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email chứa liên kết an toàn để đổi mật khẩu mới."""
        ...

    def send_order_placed(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        items: list[dict[str, Any]],
        total_amount: str,
        payment_method: str,
        payment_url: str | None = None,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo đặt hàng thành công và link thanh toán trực tuyến (nếu có)."""
        ...

    def send_order_shipping(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        tracking_code: str | None,
        shipping_address: str,
        total_amount: str,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo kiện hàng đã được xuất kho và đang trên đường giao."""
        ...

    def send_order_delivered(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        delivered_at: str,
        total_amount: str,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo đơn hàng đã được giao thành công đến tay người nhận."""
        ...

    def send_order_cancelled(
        self,
        to_email: str,
        customer_name: str,
        order_code: str,
        cancel_reason: str,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo hủy đơn hàng kèm lý do chi tiết."""
        ...

    def send_account_status_changed(
        self,
        to_email: str,
        customer_name: str,
        is_locked: bool,
        reason: str | None = None,
        background_tasks: BackgroundTasks | None = None,
    ) -> bool:
        """Gửi email thông báo tài khoản người dùng bị khóa hoặc đã được kích hoạt lại."""
        ...
