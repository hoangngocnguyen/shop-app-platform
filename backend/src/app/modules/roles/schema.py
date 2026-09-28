from pydantic import BaseModel, ConfigDict, Field


class RoleResponse(BaseModel):
    """Schema đại diện cho thông tin vai trò người dùng (Role DTO)."""

    code: str = Field(
        ...,
        description="Mã vai trò chuẩn hóa trong hệ thống (ADMIN, USER, STAFF...)",
        examples=["USER"],
    )
    name: str = Field(
        ...,
        description="Tên hiển thị của vai trò",
        examples=["Khách hàng"],
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "code": "USER",
                "name": "Khách hàng",
            }
        },
    )