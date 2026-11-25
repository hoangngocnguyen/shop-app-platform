from fastapi import APIRouter, Depends, Path, Request, UploadFile, status
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile as StarletteUploadFile

from src.app.core.database import get_db
from src.app.core.deps import require_any_role
from src.app.core.pagination import PaginatedResponse
from src.app.core.response import ApiResponse, success_response
from src.app.modules.posts.schema import (
    AdminPostDetailResponse,
    AdminPostListResponse,
    AdminPostQueryParams,
    CreatePostRequest,
    CreatePostStatus,
    DeleteResponse,
    PostStatus,
    TopicResponse,
    UpdatePostRequest,
    UpdatePostStatusRequest,
)
from src.app.modules.posts.service import AdminPostService, TopicService
from src.app.modules.users.model import User

admin_or_editor = require_any_role(["ADMIN", "EDITOR"])

router = APIRouter(prefix="/admin/posts", tags=["Admin - Quản lý bài viết"])


@router.get(
    "/topics",
    response_model=ApiResponse[list[TopicResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách danh mục/chủ đề bài viết",
)
def get_admin_post_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[list[TopicResponse]]:
    topics = TopicService.get_topics(db=db)
    return success_response(data=topics, message="Lấy danh sách danh mục thành công")


@router.get(
    "",
    response_model=ApiResponse[AdminPostListResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách bài viết quản trị",
    description="Phân trang và lọc bài viết theo trạng thái, chủ đề hoặc từ khóa.",
)
def get_admin_posts(
    params: AdminPostQueryParams = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[AdminPostListResponse]:
    result = AdminPostService.get_admin_posts(
        db=db,
        params=params,
        actor_id=current_user.user_id,
        actor_role=current_user.role.code,
    )
    return success_response(data=result, message="Lấy danh sách bài viết thành công")


@router.get(
    "/{post_id}",
    response_model=ApiResponse[AdminPostDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết bài viết",
)
def get_post_by_id(
    post_id: int = Path(..., gt=0, description="ID bài viết"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[AdminPostDetailResponse]:
    post = AdminPostService.get_post_by_id(
        db=db,
        post_id=post_id,
        actor_id=current_user.user_id,
        actor_role=current_user.role.code,
    )
    return success_response(data=post, message="Lấy chi tiết bài viết thành công")


@router.post(
    "",
    response_model=ApiResponse[AdminPostDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo bài viết",
    description="Admin hoặc Editor tạo bài viết ở trạng thái DRAFT hoặc PENDING. Hỗ trợ upload ảnh đại diện (file) lên Cloudinary qua multipart/form-data hoặc URL qua JSON.",
)
async def create_post(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[AdminPostDetailResponse]:
    content_type = request.headers.get("content-type", "")
    file: UploadFile | None = None
    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if isinstance(uploaded_file, StarletteUploadFile) and uploaded_file.filename:
            file = uploaded_file

        topic_id_raw = form.get("topic_id")
        topic_id = int(topic_id_raw) if topic_id_raw and str(topic_id_raw).strip() else None

        raw_status = form.get("status")
        post_status = CreatePostStatus(str(raw_status)) if raw_status else CreatePostStatus.DRAFT

        payload = CreatePostRequest(
            title=str(form.get("title", "")),
            slug=str(form.get("slug", "")),
            summary=str(form.get("summary")) if form.get("summary") else None,
            content=str(form.get("content", "")),
            thumbnail_url=str(form.get("thumbnail_url")) if form.get("thumbnail_url") else None,
            topic_id=topic_id,
            status=post_status,
        )
    else:
        body = await request.json()
        payload = CreatePostRequest.model_validate(body)

    post = await AdminPostService.create_post(
        db=db,
        payload=payload,
        actor_id=current_user.user_id,
        actor_role=current_user.role.code,
        file=file,
    )
    return success_response(data=post, message="Tạo bài viết thành công")


@router.put(
    "/{post_id}",
    response_model=ApiResponse[AdminPostDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật bài viết",
    description="Cập nhật bài viết; các trường không gửi sẽ giữ nguyên. Hỗ trợ đổi ảnh bằng cách đính kèm file mới.",
)
async def update_post(
    request: Request,
    post_id: int = Path(..., gt=0, description="ID bài viết cần cập nhật"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[AdminPostDetailResponse]:
    content_type = request.headers.get("content-type", "")
    file: UploadFile | None = None
    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if isinstance(uploaded_file, StarletteUploadFile) and uploaded_file.filename:
            file = uploaded_file

        update_dict = {}
        for key in ["title", "slug", "summary", "content", "thumbnail_url"]:
            if key in form:
                val = form.get(key)
                update_dict[key] = str(val) if val else None

        if "topic_id" in form:
            t_val = form.get("topic_id")
            update_dict["topic_id"] = int(t_val) if t_val and str(t_val).strip() else None

        if "status" in form and form.get("status"):
            update_dict["status"] = PostStatus(str(form.get("status")))

        payload = UpdatePostRequest.model_validate(update_dict)
    else:
        body = await request.json()
        payload = UpdatePostRequest.model_validate(body)

    post = await AdminPostService.update_post(
        db=db,
        post_id=post_id,
        payload=payload,
        actor_id=current_user.user_id,
        actor_role=current_user.role.code,
        file=file,
    )
    return success_response(data=post, message="Cập nhật bài viết thành công")


@router.patch(
    "/{post_id}/status",
    response_model=ApiResponse[AdminPostDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Thay đổi trạng thái bài viết",
)
def update_post_status(
    payload: UpdatePostStatusRequest,
    post_id: int = Path(..., gt=0, description="ID bài viết cần đổi trạng thái"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[AdminPostDetailResponse]:
    post = AdminPostService.update_post_status(
        db=db,
        post_id=post_id,
        payload=payload,
        actor_id=current_user.user_id,
        actor_role=current_user.role.code,
    )
    return success_response(data=post, message="Cập nhật trạng thái bài viết thành công")


@router.delete(
    "/{post_id}",
    response_model=ApiResponse[DeleteResponse],
    status_code=status.HTTP_200_OK,
    summary="Xóa bài viết",
)
def delete_post(
    post_id: int = Path(..., gt=0, description="ID bài viết cần xóa"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[DeleteResponse]:
    AdminPostService.delete_post(
        db=db,
        post_id=post_id,
        actor_id=current_user.user_id,
        actor_role=current_user.role.code,
    )
    return success_response(
        data=DeleteResponse(id=post_id),
        message="Xóa bài viết thành công",
    )


@router.post(
    "/{post_id}/restore",
    response_model=ApiResponse[AdminPostDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Khôi phục bài viết đã lưu trữ",
)
def restore_post(
    post_id: int = Path(..., gt=0, description="ID bài viết cần khôi phục"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[AdminPostDetailResponse]:
    post = AdminPostService.restore_post(
        db=db,
        post_id=post_id,
        actor_role=current_user.role.code,
    )
    return success_response(data=post, message="Khôi phục bài viết thành công")
