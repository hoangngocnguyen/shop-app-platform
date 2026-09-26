import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status


class MediaService:
    @staticmethod
    async def upload_image(
        file: UploadFile,
        folder: str,
    ) -> dict:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File tải lên phải là hình ảnh",
            )

        try:
            file_bytes = await file.read()

            response = cloudinary.uploader.upload(
                file_bytes,
                folder=folder,
                resource_type="image",
                quality="auto",
                fetch_format="auto",
            )

            return {
                "public_id": response.get("public_id"),
                "url": response.get("secure_url"),
                "format": response.get("format"),
            }
        finally:
            await file.seek(0)

    @staticmethod
    async def delete_image(public_id: str) -> dict:
        response = cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
        )

        if response.get("result") != "ok":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể xóa file: {public_id}",
            )

        return {
            "message": "Xóa thành công",
            "public_id": public_id,
        }
