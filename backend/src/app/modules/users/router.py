from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
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
    response_model=ApiResponse[UserProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy thông tin profile cá nhân",
)
def get_my_profile(
    user: User = Depends(get_current_user),
):
    """
    Lấy thông tin profile của người dùng đang đăng nhập dựa trên token.
    """
    profile = UserProfileService.get_profile(
        user=user,
    )
    return success_response(
        data=profile, message="Lấy thông tin profile cá nhân thành công"
    )


@router.patch(
    "/me",
    response_model=ApiResponse[UserProfileResponse],
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
    updated_profile = UserProfileService.update_profile(
        db=db,
        user=user,
        data=data,
    )
    return success_response(
        data=updated_profile, message="Cập nhật thông tin profile thành công"
    )


@router.patch(
    "/me/avatar",
    response_model=ApiResponse[AvatarResponse],
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
    avatar_info = await UserProfileService.update_avatar(
        db=db,
        user=user,
        file=file,
    )
    return success_response(
        data=avatar_info, message="Cập nhật ảnh đại diện thành công"
    )


@router.delete(
    "/me/avatar",
    response_model=ApiResponse[AvatarResponse],
    status_code=status.HTTP_200_OK,
    summary="Xóa ảnh đại diện hiện tại của người dùng",
)
async def delete_my_avatar(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    avatar_info = await UserProfileService.delete_avatar(
        db=db,
        user=user,
    )
    return success_response(data=avatar_info, message="Xóa ảnh đại diện thành công")
