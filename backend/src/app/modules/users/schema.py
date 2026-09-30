from datetime import UTC, date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator

from src.app.core.exceptions import CustomException


class UserProfileResponse(BaseModel):
    """Thông tin profile của người dùng hiện tại."""

    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=255,
    )
    email: EmailStr | None = Field(
        default=None,
        max_length=255,
    )
    phone: str | None = None
    avatar_url: HttpUrl | None = None
    date_of_birth: date | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        if not value.isdigit() or len(value) != 10 or not value.startswith("0"):
            raise CustomException(
                message="Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0"
            )

        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date | None) -> date | None:
        if value is not None and value > datetime.now(UTC).date():
            raise CustomException(message="Ngày sinh không được lớn hơn ngày hiện tại")

        return value


class UpdateUserRequest(BaseModel):
    """Dữ liệu cập nhật profile."""

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=255,
    )
    phone: str | None = None
    date_of_birth: date | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        if not value.isdigit() or len(value) != 10 or not value.startswith("0"):
            raise CustomException(
                message="Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0"
            )

        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date | None) -> date | None:
        if value is not None and value > datetime.now(UTC).date():
            raise CustomException(message="Ngày sinh không được lớn hơn ngày hiện tại")

        return value


class AvatarResponse(BaseModel):
    avatar_url: str | None
