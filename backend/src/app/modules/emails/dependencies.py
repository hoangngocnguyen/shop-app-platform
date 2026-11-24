from functools import lru_cache

from src.app.modules.emails.protocol import IEmailSender
from src.app.modules.emails.service import GmailSmtpEmailSender


@lru_cache(maxsize=1)
def get_email_sender() -> IEmailSender:
    """
    Dependency Injection cung cấp thực thể IEmailSender.
    Sử dụng lru_cache để khởi tạo duy nhất một lần (Singleton-like pattern).
    """
    return GmailSmtpEmailSender()
