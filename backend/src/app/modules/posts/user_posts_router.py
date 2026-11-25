from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.posts.schema import (
    PublicPostDetailResponse,
    PublicPostListResponse,
    PublicTopicResponse,
)
from src.app.modules.posts.service import PublicPostService

router = APIRouter(prefix="/posts", tags=["Client - Bài viết (Public)"])


@router.get(
    "/topics",
    response_model=list[PublicTopicResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách các chủ đề bài viết cho khách hàng",
)
def get_public_topics(
    db: Annotated[Session, Depends(get_db)],
) -> list[PublicTopicResponse]:
    """Trả về danh sách danh mục / chủ đề bài viết kèm số lượng bài viết đã xuất bản."""
    return PublicPostService.get_public_topics(db)


@router.get(
    "",
    response_model=PublicPostListResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách bài viết đã xuất bản (Client)",
)
def get_public_posts(
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1, description="Số trang")] = 1,
    page_size: Annotated[int, Query(ge=1, le=50, description="Số bài viết mỗi trang")] = 10,
    topic: Annotated[str | None, Query(description="Slug của chủ đề cần lọc")] = None,
    search: Annotated[str | None, Query(description="Từ khóa tìm kiếm tiêu đề hoặc tóm tắt")] = None,
) -> PublicPostListResponse:
    """Trả về danh sách bài viết phân trang dành cho khách hàng."""
    return PublicPostService.get_public_posts(
        db=db,
        page=page,
        page_size=page_size,
        topic_slug=topic,
        search=search,
    )


@router.get(
    "/{topic_slug}",
    response_model=PublicPostListResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách bài viết theo chủ đề",
)
def get_public_posts_by_topic(
    topic_slug: str,
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1, description="Số trang")] = 1,
    page_size: Annotated[int, Query(ge=1, le=50, description="Số bài viết mỗi trang")] = 10,
    search: Annotated[str | None, Query(description="Từ khóa tìm kiếm")] = None,
) -> PublicPostListResponse:
    """Trả về danh sách bài viết đã xuất bản thuộc chủ đề topic_slug."""
    return PublicPostService.get_public_posts(
        db=db,
        page=page,
        page_size=page_size,
        topic_slug=topic_slug,
        search=search,
    )


@router.get(
    "/{topic_slug}/{post_slug}",
    response_model=PublicPostDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết bài viết theo chủ đề và slug",
)
def get_public_post_detail(
    topic_slug: str,
    post_slug: str,
    db: Annotated[Session, Depends(get_db)],
) -> PublicPostDetailResponse:
    """Trả về thông tin chi tiết bài viết, tăng view và gợi ý các bài liên quan cùng chủ đề."""
    return PublicPostService.get_public_post_detail(
        db=db,
        topic_slug=topic_slug,
        post_slug=post_slug,
    )
