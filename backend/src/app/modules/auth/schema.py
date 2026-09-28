from uuid import UUID

from pydantic import BaseModel, ConfigDict

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