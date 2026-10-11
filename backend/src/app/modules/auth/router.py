from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.auth import get_current_auth_id, get_jwt_payload
from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.auth.schema import MeResponse, SyncUserResponse
from src.app.modules.auth.service import AuthService

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
    auth_user_id: UUID = Depends(get_current_auth_id),
    db: Session = Depends(get_db),
):
    me = AuthService.get_me(
        db=db,
        auth_user_id=auth_user_id,
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
    provider = payload.get("app_metadata", {}).get("provider", "EMAIL")

    synced_user = AuthService.sync_user(
        db=db,
        auth_user_id=auth_user_id,
        email=email,
        provider=provider,
    )
    return success_response(data=synced_user, message="Đồng bộ người dùng thành công")
