from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.users.dep import get_current_user
from src.app.modules.users.model import User
from src.app.modules.users.schema import (
    AvatarResponse,
    UpdateUserRequest,
    UserProfileResponse,
)
from src.app.modules.users.service import UserProfileService

router = APIRouter(
    prefix="/users",
    tags=["Users - Người dùng"],
)


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy thông tin profile cá nhân",
)
def get_my_profile(
    user: User = Depends(get_current_user),
):
    """
    Lấy thông tin profile của người dùng đang đăng nhập dựa trên token.
    """
    return UserProfileService.get_profile(
        user=user,
    )


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Cập nhật thông tin profile (chữ)",
)
def update_my_profile(
    data: UpdateUserRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cập nhật một hoặc nhiều thông tin cá nhân (ngoại trừ avatar).
    Gửi request dạng JSON với các trường cần thay đổi.
    """
    return UserProfileService.update_profile(
        db=db,
        user=user,
        data=data,
    )


@router.patch(
    "/me/avatar",
    response_model=AvatarResponse,
    status_code=status.HTTP_200_OK,
    summary="Cập nhật ảnh đại diện (Avatar)",
)
async def update_my_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Tải file ảnh đại diện mới lên Cloudinary và cập nhật avatar_url trong database.
    Request dạng `multipart/form-data`.
    """
    return await UserProfileService.update_avatar(
        db=db,
        user=user,
        file=file,
    )


@router.delete(
    "/me/avatar",
    response_model=AvatarResponse,
    status_code=status.HTTP_200_OK,
    summary="Xóa ảnh đại diện hiện tại của người dùng",
)
async def delete_my_avatar(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await UserProfileService.delete_avatar(
        db=db,
        user=user,
    )
