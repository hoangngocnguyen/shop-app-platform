from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.app.core.auth import get_current_user, get_current_user_id
from src.app.core.database import get_db
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
async def get_me(
    user_id: UUID = Depends(get_current_user_id),
):
    return {
        "user_id": user_id,
    }


@router.post("/sync")
def sync_user(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_user_id = UUID(payload["sub"])

    # Kiểm tra application user đã tồn tại chưa
    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

    if user:
        return {
            "user_id": user.user_id,
            "auth_user_id": user.auth_user_id,
            "email": user.email,
            "role_id": user.role_id,
        }

    # Lấy role mặc định cho user mới
    user_role = db.query(Role).filter(Role.name == "ROLE_USER").first()

    if not user_role:
        raise HTTPException(
            status_code=500,
            detail="Default user role not found",
        )

    # Tạo application user
    user = User(
        auth_user_id=auth_user_id,
        email=payload.get("email"),
        provider="EMAIL",
        role_id=user_role.id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.user_id,
        "auth_user_id": user.auth_user_id,
        "email": user.email,
        "role_id": user.role_id,
    }
