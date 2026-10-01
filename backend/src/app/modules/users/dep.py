from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.app.core.auth import get_current_auth_id
from src.app.core.database import get_db
from src.app.modules.users.model import User


async def get_current_user(
    auth_id: UUID = Depends(get_current_auth_id),
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.auth_user_id == auth_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tài khoản chưa được đồng bộ vào hệ thống database",
        )
    return user


async def get_current_user_id(
    current_user: User = Depends(get_current_user),
) -> UUID:
    return current_user.user_id
