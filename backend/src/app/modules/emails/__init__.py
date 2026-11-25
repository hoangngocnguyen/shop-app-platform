from src.app.modules.emails.dependencies import get_email_sender
from src.app.modules.emails.protocol import IEmailSender
from src.app.modules.emails.router import router as email_router
from src.app.modules.emails.service import GmailSmtpEmailSender

__all__ = [
    "IEmailSender",
    "GmailSmtpEmailSender",
    "get_email_sender",
    "email_router",
]
