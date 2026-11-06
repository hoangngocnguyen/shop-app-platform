from datetime import datetime
from enum import Enum
from typing import Any, List, Optional
from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    model_validator,
)


# ==========================================
# Enums
# ==========================================
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"
    STAFF = "STAFF"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    BLOCKED = "BLOCKED"


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


# ==========================================
# Query Parameters Schema
# ==========================================
class AdminUserQueryParams(BaseModel):
    page: int = Field(default=0, ge=0, description="Số trang (mặc định = 0)")
    page_size: int = Field(default=10, ge=1, le=100, description="Số lượng bản ghi mỗi trang (mặc định = 10)")
    search: Optional[str] = Field(default=None, description="Tìm kiếm theo tên, userId, hoặc số điện thoại")
    role: Optional[UserRole] = Field(default=None, description="Lọc theo vai trò (ADMIN, CUSTOMER, STAFF)")
    status: Optional[UserStatus] = Field(default=None, description="Lọc theo tình trạng tài khoản (ACTIVE, BLOCKED)")
    sortBy: Optional[str] = Field(default="createdAt", description="Trường dùng để sắp xếp (VD: createdAt, fullName)")
    sortDir: Optional[SortDirection] = Field(default=SortDirection.DESC, description="Chiều sắp xếp: asc hoặc desc")


# ==========================================
# Request Body Schemas
# ==========================================
class UserCreateForm(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=256, description="Không được để trống, tối đa 256 ký tự")
    email: EmailStr = Field(..., description="Email hợp lệ, không trùng lặp")
    phone: str = Field(..., pattern=r"^(0|\+84)[0-9]{9}$", description="Số điện thoại hợp lệ (VD: 0912345678)")
    password: str = Field(..., min_length=6, description="Tối thiểu 6 ký tự bất kỳ (chữ, số hoặc ký tự đặc biệt)")
    role: UserRole = Field(..., description="Vai trò hợp lệ (ADMIN, CUSTOMER, STAFF)")


class UserUpdateForm(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=256, description="Không được để trống, tối đa 256 ký tự")
    phone: str = Field(..., pattern=r"^(0|\+84)[0-9]{9}$", description="Số điện thoại hợp lệ")
    address: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Địa chỉ liên hệ chính của người dùng",
    )
    role: UserRole = Field(..., description="Vai trò mới của người dùng")


class UserBlockForm(BaseModel):
    isBlocked: bool = Field(..., description="true: Khóa tài khoản, false: Mở khóa tài khoản")
    reason: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Lý do khóa tài khoản (bắt buộc nếu isBlocked = true)",
    )

    @model_validator(mode="after")
    def validate_reason_if_blocked(self) -> "UserBlockForm":
        if self.isBlocked and not (self.reason and self.reason.strip()):
            raise ValueError("Lý do khóa tài khoản (reason) là bắt buộc khi isBlocked = true")
        return self


# ==========================================
# Response DTO Schemas
# ==========================================
class UserDetailResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    userId: str = Field(
        ..., 
        validation_alias=AliasChoices("userId", "id"), 
        description="ID duy nhất của người dùng"
    )
    fullName: str = Field(
        ..., 
        validation_alias=AliasChoices("fullName", "full_name"), 
        description="Họ và tên người dùng"
    )
    email: EmailStr = Field(..., description="Địa chỉ email")
    phone: Optional[str] = Field(default=None, description="Số điện thoại liên lạc")
    address: Optional[str] = Field(default=None, description="Địa chỉ")
    role: UserRole = Field(..., description="Vai trò người dùng (ADMIN, CUSTOMER, STAFF)")
    status: UserStatus = Field(
        default=UserStatus.ACTIVE,
        description="Trạng thái tài khoản (ACTIVE, BLOCKED)"
    )
    reason: Optional[str] = Field(
        default=None, 
        validation_alias=AliasChoices("reason", "block_reason"), 
        description="Lý do khóa tài khoản (nếu bị khóa)"
    )
    createdAt: datetime = Field(
        ..., 
        validation_alias=AliasChoices("createdAt", "created_at"), 
        description="Thời gian tạo tài khoản"
    )
    updatedAt: Optional[datetime] = Field(
        default=None, 
        validation_alias=AliasChoices("updatedAt", "updated_at"), 
        description="Thời gian cập nhật gần nhất"
    )

    @model_validator(mode="before")
    @classmethod
    def resolve_status_from_orm(cls, data: Any) -> Any:
        """Tự động tính toán status = BLOCKED nếu object DB có is_blocked = True"""
        if hasattr(data, "is_blocked"):
            status_val = UserStatus.BLOCKED if getattr(data, "is_blocked", False) else UserStatus.ACTIVE
            if isinstance(data, dict):
                data["status"] = status_val
            else:
                setattr(data, "status", status_val)
        return data


class UserListResponse(BaseModel):
    content: List[UserDetailResponse] = Field(..., description="Danh sách người dùng")
    page: int = Field(..., description="Trang hiện tại (bắt đầu từ 0)")
    page_size: int = Field(..., description="Số bản ghi mỗi trang")
    total: int = Field(..., description="Tổng số người dùng")
    total_pages: int = Field(..., description="Tổng số trang")