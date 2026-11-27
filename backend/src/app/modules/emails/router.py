from fastapi import APIRouter, BackgroundTasks, Depends, status

from src.app.core.response import ApiResponse, success_response
from src.app.modules.emails.dependencies import get_email_sender
from src.app.modules.emails.protocol import IEmailSender
from src.app.modules.emails.schema import TestEmailRequest, TestEmailResponse

router = APIRouter(
    prefix="/emails",
    tags=["Emails - Dịch vụ Gửi thư"],
)


@router.post(
    "/test",
    response_model=ApiResponse[TestEmailResponse],
    status_code=status.HTTP_200_OK,
    summary="Kiểm tra kết nối và gửi email thử nghiệm",
    description="Endpoint hỗ trợ kiểm tra cấu hình SMTP (Google Gmail). Yêu cầu đã điền SMTP_USER và SMTP_PASSWORD.",
    response_description="Kết quả gửi email thử nghiệm.",
)
def test_send_email(
    request: TestEmailRequest,
    background_tasks: BackgroundTasks,
    email_sender: IEmailSender = Depends(get_email_sender),
):
    """Gửi email thử nghiệm sử dụng template cơ bản."""
    email_sender.send_email(
        to_email=str(request.to_email),
        subject=request.subject,
        template_name="base.html",
        context={"content": f"<p>{request.content}</p>"},
        background_tasks=background_tasks,
    )
    return success_response(
        data=TestEmailResponse(
            success=True,
            message=f"Đã lập lịch gửi thư kiểm tra tới: {request.to_email}",
        ),
        message="Yêu cầu gửi thư thử nghiệm đã được tiếp nhận",
    )
