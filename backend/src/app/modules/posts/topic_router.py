from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_any_role
from src.app.core.response import ApiResponse, success_response
from src.app.modules.posts.schema import (
    TopicCreateRequest,
    TopicDeleteResponse,
    TopicResponse,
    TopicUpdateRequest,
)
from src.app.modules.posts.service import TopicService
from src.app.modules.users.model import User

admin_or_editor = require_any_role(["ADMIN", "EDITOR"])

router = APIRouter(prefix="/admin/posts/topics", tags=["Admin - Quản lý chủ đề bài viết"])


@router.get(
    "",
    response_model=ApiResponse[list[TopicResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách danh mục/chủ đề bài viết",
    description="Trả về toàn bộ danh mục bài viết (hoặc tự động khởi tạo mặc định nếu chưa có).",
)
def get_topics(
    type: str | None = Query(default=None, description="Lọc theo loại: CATEGORY hoặc TAG"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[list[TopicResponse]]:
    topics = TopicService.get_topics(db=db, topic_type=type)
    return success_response(data=topics, message="Lấy danh sách danh mục thành công")


@router.get(
    "/{topic_id}",
    response_model=ApiResponse[TopicResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết danh mục bài viết",
)
def get_topic_by_id(
    topic_id: int = Path(..., gt=0, description="ID danh mục"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[TopicResponse]:
    topic = TopicService.get_topic_by_id(db=db, topic_id=topic_id)
    return success_response(data=topic, message="Lấy chi tiết danh mục thành công")


@router.post(
    "",
    response_model=ApiResponse[TopicResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo mới danh mục/chủ đề bài viết",
)
def create_topic(
    payload: TopicCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[TopicResponse]:
    topic = TopicService.create_topic(db=db, payload=payload)
    return success_response(data=topic, message="Tạo danh mục bài viết thành công")


@router.put(
    "/{topic_id}",
    response_model=ApiResponse[TopicResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật danh mục bài viết",
)
def update_topic(
    payload: TopicUpdateRequest,
    topic_id: int = Path(..., gt=0, description="ID danh mục cần cập nhật"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[TopicResponse]:
    topic = TopicService.update_topic(db=db, topic_id=topic_id, payload=payload)
    return success_response(data=topic, message="Cập nhật danh mục thành công")


@router.delete(
    "/{topic_id}",
    response_model=ApiResponse[TopicDeleteResponse],
    status_code=status.HTTP_200_OK,
    summary="Xóa danh mục bài viết",
)
def delete_topic(
    topic_id: int = Path(..., gt=0, description="ID danh mục cần xóa"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_editor),
) -> ApiResponse[TopicDeleteResponse]:
    TopicService.delete_topic(db=db, topic_id=topic_id)
    return success_response(
        data=TopicDeleteResponse(id=topic_id, message=f"Đã xóa thành công danh mục ID {topic_id}"),
        message="Xóa danh mục thành công",
    )
