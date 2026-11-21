from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.app.modules.roles.schema import RoleResponse


class SyncUserResponse(BaseModel):
    """Response sau khi đồng bộ Supabase Auth user với application user."""

    user_id: UUID

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    """Thông tin application user hiện tại."""

    user_id: UUID
    name: str | None = None
    username: str | None = None
    avatar_url: str | None = None
    role: RoleResponse

    model_config = ConfigDict(from_attributes=True)


class ForgotPasswordRequest(BaseModel):
    """Yêu cầu gửi email khôi phục mật khẩu."""

    email: EmailStr = Field(
        ...,
        description="Địa chỉ email tài khoản cần khôi phục",
        examples=["user@example.com"],
    )


class ForgotPasswordResponse(BaseModel):
    """Kết quả tiếp nhận yêu cầu quên mật khẩu."""

    message: str = Field(
        ...,
        description="Thông báo trạng thái xử lý",
        examples=[
            "Nếu email tồn tại trên hệ thống, liên kết đặt lại mật khẩu đã được gửi."
        ],
    )


class ResetPasswordRequest(BaseModel):
    """Yêu cầu cập nhật mật khẩu mới với recovery token."""

    token: str = Field(
        ...,
        min_length=1,
        description="Recovery token nhận được từ liên kết trong email",
        examples=["pkce_recovery_token_or_hash_123456"],
    )
    new_password: str = Field(
        ...,
        min_length=6,
        max_length=64,
        description="Mật khẩu mới (tối thiểu 6 ký tự)",
        examples=["SecureP@ssword2026"],
    )


class ResetPasswordResponse(BaseModel):
    """Kết quả đặt lại mật khẩu thành công."""

    message: str = Field(
        default="Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
        description="Thông báo thành công",
    )