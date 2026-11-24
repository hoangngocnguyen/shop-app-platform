from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from src.app.core.auth import get_jwt_payload
from src.app.core.deps import get_current_user
from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.auth.schema import (
    ChangePasswordRequest,
    ChangePasswordResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    MeResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    SyncUserResponse,
)
from src.app.modules.auth.service import AuthService
from src.app.modules.emails.dependencies import get_email_sender
from src.app.modules.emails.protocol import IEmailSender

router = APIRouter(
    prefix="/auth",
    tags=["Auth - Xác thực & Phân quyền"],
)


@router.get(
    "/me",
    response_model=ApiResponse[MeResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy thông tin tài khoản hiện tại",
    description=(
        "Lấy thông tin application user hiện tại, "
        "bao gồm thông tin hiển thị và vai trò."
    ),
    response_description="Thông tin application user hiện tại.",
)
def get_me(
    payload: dict = Depends(get_jwt_payload),
    db: Session = Depends(get_db),
):
    app_metadata = payload.get("app_metadata") or {}
    providers = app_metadata.get("providers")
    if not isinstance(providers, list) or not providers:
        provider = app_metadata.get("provider")
        providers = [provider] if isinstance(provider, str) and provider else []
    me = AuthService.get_me(
        db=db,
        auth_user_id=UUID(payload["sub"]),
        auth_providers=providers,
    )
    return success_response(data=me, message="Lấy thông tin tài khoản thành công")


@router.post(
    "/sync",
    response_model=ApiResponse[SyncUserResponse],
    status_code=status.HTTP_200_OK,
    summary="Đồng bộ người dùng từ Supabase Auth",
    description=(
        "Đảm bảo người dùng từ Supabase Auth tồn tại trong application database. "
        "Nếu chưa tồn tại, hệ thống sẽ tạo application user mới với role mặc định USER."
    ),
    response_description="ID của application user sau khi đồng bộ.",
)
def sync_user(
    payload: dict = Depends(get_jwt_payload),
    db: Session = Depends(get_db),
):
    auth_user_id = UUID(payload["sub"])
    email = payload.get("email")
    app_metadata = payload.get("app_metadata") or {}
    provider = app_metadata.get("provider")

    synced_user = AuthService.sync_user(
        db=db,
        auth_user_id=auth_user_id,
        email=email,
        provider=provider,
    )
    return success_response(data=synced_user, message="Đồng bộ người dùng thành công")


@router.post(
    "/change-password",
    response_model=ApiResponse[ChangePasswordResponse],
    status_code=status.HTTP_200_OK,
    summary="Đổi mật khẩu tài khoản email",
    description=(
        "Đổi mật khẩu cho người dùng đã đăng nhập bằng email/password. "
        "Supabase xác minh mật khẩu hiện tại trước khi cập nhật."
    ),
)
def change_password(
    request: ChangePasswordRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    payload: dict = Depends(get_jwt_payload),
    email_sender: IEmailSender = Depends(get_email_sender),
):
    app_metadata = payload.get("app_metadata") or {}
    providers = app_metadata.get("providers")
    if not isinstance(providers, list):
        providers = []
    primary_provider = app_metadata.get("provider")
    if isinstance(primary_provider, str) and primary_provider:
        providers = [*providers, primary_provider]
    result = AuthService.change_password(
        user=current_user,
        auth_providers=providers,
        current_password=request.current_password,
        new_password=request.new_password,
        email_sender=email_sender,
        background_tasks=background_tasks,
    )
    return success_response(data=result, message="Đổi mật khẩu thành công")


@router.post(
    "/forgot-password",
    response_model=ApiResponse[ForgotPasswordResponse],
    status_code=status.HTTP_200_OK,
    summary="Yêu cầu gửi liên kết đặt lại mật khẩu",
    description=(
        "Khởi tạo quy trình quên mật khẩu: Sinh token bảo mật qua Supabase Admin API "
        "và gửi email hướng dẫn chứa đường dẫn đổi mật khẩu an toàn đến hòm thư của người dùng."
    ),
    response_description="Thông báo tiếp nhận yêu cầu thành công.",
)
def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    email_sender: IEmailSender = Depends(get_email_sender),
):
    result = AuthService.forgot_password(
        db=db,
        email=str(request.email),
        email_sender=email_sender,
        background_tasks=background_tasks,
    )
    return success_response(data=result, message="Yêu cầu đã được tiếp nhận")


@router.post(
    "/reset-password",
    response_model=ApiResponse[ResetPasswordResponse],
    status_code=status.HTTP_200_OK,
    summary="Đặt lại mật khẩu mới",
    description=(
        "Xác thực token_hash nhận được từ email và cập nhật mật khẩu mới cho tài khoản người dùng."
    ),
    response_description="Thông báo đổi mật khẩu thành công.",
)
def reset_password(
    request: ResetPasswordRequest,
):
    result = AuthService.reset_password(
        token=request.token,
        new_password=request.new_password,
    )
    return success_response(
        data=result,
        message="Đặt lại mật khẩu thành công",
    )
