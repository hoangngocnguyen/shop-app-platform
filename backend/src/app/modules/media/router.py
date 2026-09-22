from fastapi import APIRouter, File, Query, UploadFile

from src.app.modules.media.cloudinary_folders import PRODUCT
from src.app.modules.media.service import MediaService

router = APIRouter(prefix="/media", tags=["Media Module"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Query("products", description="Thư mục trên Cloudinary"),
):
    result = await MediaService.upload_image(file=file, folder=folder)
    return {"success": True, "data": result}


@router.delete("/delete")
async def delete_file(public_id: str = Query(...)):
    result = await MediaService.delete_image(public_id=public_id)
    return result


@router.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    return await MediaService.upload_image(
        file=file,
        folder=PRODUCT,
    )
