from collections.abc import Callable
from uuid import UUID

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from src.app.core.auth import get_current_auth_id
from src.app.core.database import get_db
from src.app.core.exceptions import (
    ForbiddenException,
    UnauthorizedException,
)
from src.app.modules.users.model import User


async def get_current_user(
    auth_id: UUID = Depends(get_current_auth_id),
    db: Session = Depends(get_db),
) -> User:
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Dependency trích xuất User hiện tại từ Supabase Auth JWT.
    # Bước 1: Query tìm User trong database theo auth_user_id (eager-load quan hệ role)
    # Bước 2: Kiểm tra tồn tại, nếu chưa có ném UnauthorizedException
    # Bước 3: Kiểm tra trạng thái khóa tài khoản (is_blocked), nếu bị khóa ném ForbiddenException
    # Bước 4: Trả về đối tượng User
    """
    query = (
        select(User)
        .options(joinedload(User.role))
        .where(User.auth_user_id == auth_id)
    )
    user = db.scalar(query)

    if not user:
        raise UnauthorizedException(
            message="Tài khoản chưa được đồng bộ vào hệ thống database",
            error_code="USER_NOT_SYNCED",
        )

    if user.is_blocked:
        raise ForbiddenException(
            message="Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
            error_code="ACCOUNT_LOCKED",
        )

    return user


async def get_current_user_id(
    current_user: User = Depends(get_current_user),
) -> UUID:
    """
    Dependency tiện ích lấy trực tiếp user_id (UUID) từ current_user đã xác thực.
    """
    return current_user.user_id


def require_role(required_role: str) -> Callable:
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Dependency kiểm tra quyền hạn theo vai trò (Role-Based Access Control).
    - required_role: Mã vai trò bắt buộc (VD: 'ADMIN', 'USER', 'STAFF')
    
    # Bước 1: Lấy current_user đã xác thực
    # Bước 2: Kiểm tra role.code có khớp với required_role không
    # Bước 3: Nếu không khớp, ném ForbiddenException (403 Forbidden)
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.role or current_user.role.code.upper() != required_role.upper():
            raise ForbiddenException(
                message=f"Hành động này yêu cầu quyền '{required_role}'. Bạn không có quyền truy cập.",
                error_code="FORBIDDEN_ROLE",
            )
        return current_user

    return role_checker


def require_any_role(required_roles: list[str]) -> Callable:
    """
    Dependency kiểm tra quyền hạn cho phép một trong các vai trò được chỉ định.
    - required_roles: Danh sách mã vai trò (VD: ['ADMIN', 'STAFF'])
    """
    async def multi_role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_code = current_user.role.code.upper() if current_user.role else ""
        allowed_roles = [r.upper() for r in required_roles]
        
        if user_role_code not in allowed_roles:
            raise ForbiddenException(
                message=f"Hành động này yêu cầu một trong các quyền {required_roles}. Bạn không có quyền truy cập.",
                error_code="FORBIDDEN_ROLE",
            )
        return current_user

    return multi_role_checker
