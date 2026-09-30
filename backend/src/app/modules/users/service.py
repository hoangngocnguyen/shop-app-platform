from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.app.core.exceptions import (
    CustomException,
)
from src.app.modules.media.cloudinary_folders import USER_AVATAR
from src.app.modules.media.service import MediaService
from src.app.modules.users.model import User
from src.app.modules.users.schema import (
    AvatarResponse,
    UpdateUserRequest,
    UserProfileResponse,
)


class UserProfileService:
    """Business logic liên quan đến profile của người dùng."""

    @staticmethod
    def get_profile(
        user: User,
    ) -> UserProfileResponse:
        return UserProfileResponse(
            user_id=user.user_id,
            name=user.name,
            username=user.username,
            email=user.email,
            phone=user.phone,
            avatar_url=user.avatar_url,
            date_of_birth=user.date_of_birth,
        )

    @staticmethod
    def update_profile(
        db: Session,
        user: User,
        data: UpdateUserRequest,
    ) -> UserProfileResponse:

        update_data = data.model_dump(exclude_unset=True)

        # Validate username nếu có trong payload
        if "username" in update_data and update_data["username"] != user.username:
            stmt = select(User).where(
                User.username == update_data["username"],
                User.user_id != user.user_id,
            )
            if db.scalar(stmt):
                raise CustomException(
                    message="Username đã được sử dụng",
                    status_code=409,
                )

        # Cập nhật động các field gửi lên
        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)

        return UserProfileResponse.model_validate(user)

    @staticmethod
    async def update_avatar(
        db: Session,
        user: User,
        file: UploadFile,
    ) -> AvatarResponse:

        user_avatar_folder = f"{USER_AVATAR}/{user.user_id}"

        # 1. Upload ảnh mới lên Cloudinary
        upload_res = await MediaService.upload_image(
            file=file, folder=user_avatar_folder
        )
        new_avatar_url = upload_res.get("url")
        new_public_id = upload_res.get("public_id")

        # 2. Xóa avatar cũ trên Cloudinary nếu có lưu public_id trong DB
        if user.avatar_public_id:
            await MediaService.delete_image(user.avatar_public_id)

        # 3. Cập nhật DB
        user.avatar_url = new_avatar_url
        user.avatar_public_id = new_public_id
        db.commit()
        db.refresh(user)

        return AvatarResponse(avatar_url=user.avatar_url)

    @staticmethod
    async def delete_avatar(
        db: Session,
        user: User,
    ) -> AvatarResponse:

        # 1. Kiểm tra xem người dùng có avatar để xóa hay không
        if not user.avatar_public_id and not user.avatar_url:
            raise CustomException(
                status_code=400,
                message="Người dùng chưa có avatar để xóa",
            )

        # 2. Xóa ảnh trên Cloudinary nếu có public_id
        if user.avatar_public_id:
            await MediaService.delete_image(user.avatar_public_id)

        # 3. Cập nhật DB (gán về None)
        user.avatar_url = None
        user.avatar_public_id = None
        db.commit()
        db.refresh(user)

        return AvatarResponse(avatar_url=user.avatar_url)
