from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from src.app.core.exceptions import ResourceNotFoundException
from src.app.modules.auth.schema import SyncUserResponse
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User


class AuthService:
    """Service xử lý nghiệp vụ xác thực và đồng bộ application user."""

    @staticmethod
    def get_me(db: Session, auth_user_id: UUID) -> User:
        """
        Lấy application user hiện tại theo auth_user_id.

        Role được eager-load để phục vụ MeResponse.
        """
        user = (
            db.query(User)
            .options(joinedload(User.role))
            .filter(User.auth_user_id == auth_user_id)
            .first()
        )

        if not user:
            raise ResourceNotFoundException("Không tìm thấy thông tin người dùng")

        return user

    @staticmethod
    def sync_user(
        db: Session,
        auth_user_id: UUID,
        email: str | None = None,
        provider: str | None = "EMAIL",
    ) -> SyncUserResponse:
        """
        Đảm bảo Supabase Auth user đã có application user.

        - User đã tồn tại: trả về User hiện tại.
        - User chưa tồn tại: tạo User mới với role USER.
        """
        user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

        if user:
            return SyncUserResponse(user_id=user.user_id)

        # Tìm role mặc định
        default_role = db.query(Role).filter(Role.code == "USER").first()

        if not default_role:
            raise ResourceNotFoundException(
                "Không tìm thấy vai trò mặc định (USER) trong hệ thống"
            )

        new_user = User(
            auth_user_id=auth_user_id,
            email=email,
            provider=provider or "EMAIL",
            role_id=default_role.id,
        )

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return SyncUserResponse(user_id=new_user.user_id)

        except Exception:
            db.rollback()
            raise
