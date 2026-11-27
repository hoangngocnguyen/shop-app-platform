from datetime import UTC, datetime
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from src.app.core.exceptions import (
    BadRequestException,
    DuplicateException,
    ForbiddenException,
    NotFoundException,
)
from src.app.core.pagination import PaginatedResponse, PaginationParams, paginate_query
from src.app.modules.media.cloudinary_folders import POST
from src.app.modules.media.service import MediaService
from src.app.modules.posts.model import Post, Topic
from src.app.modules.posts.schema import (
    AdminPostQueryParams,
    CreatePostRequest,
    PostStatus,
    TopicCreateRequest,
    TopicUpdateRequest,
    UpdatePostRequest,
    UpdatePostStatusRequest,
)


class AdminPostService:
    """Nghiệp vụ quản lý bài viết cho Admin và Editor."""

    @staticmethod
    def _normalize_role(role: str) -> str:
        normalized_role = role.strip().upper()
        if normalized_role not in {"ADMIN", "EDITOR"}:
            raise ForbiddenException(
                message="Chỉ Admin hoặc Editor mới được quản lý bài viết",
                error_code="FORBIDDEN_ROLE",
            )
        return normalized_role

    @staticmethod
    def _ensure_post_access(post: Post, actor_id: UUID, actor_role: str) -> None:
        role = AdminPostService._normalize_role(actor_role)
        if role == "EDITOR" and post.author_id != actor_id:
            raise ForbiddenException(
                message="Editor chỉ được thao tác trên bài viết của mình",
                error_code="POST_ACCESS_DENIED",
            )

    @staticmethod
    def _get_post_or_404(db: Session, post_id: int) -> Post:
        post = db.scalar(
            select(Post)
            .options(joinedload(Post.topic), joinedload(Post.author))
            .where(Post.id == post_id)
        )
        if post is None:
            raise NotFoundException(
                resource="Bài viết",
                id_or_slug=post_id,
                message=f"Không tìm thấy bài viết với ID {post_id}",
            )
        return post

    @staticmethod
    def _validate_topic(db: Session, topic_id: int | None) -> None:
        if topic_id is None:
            return
        if db.scalar(
            select(Topic.id).where(Topic.id == topic_id)
        ) is None:
            raise NotFoundException(
                resource="Chủ đề",
                id_or_slug=topic_id,
                message=f"Chủ đề với ID {topic_id} không tồn tại",
            )

    @staticmethod
    def _ensure_unique_slug(
        db: Session, slug: str, exclude_post_id: int | None = None
    ) -> None:
        query = select(Post.id).where(Post.slug == slug)
        if exclude_post_id is not None:
            query = query.where(Post.id != exclude_post_id)
        if db.scalar(query) is not None:
            raise DuplicateException(
                field="Slug",
                value=slug,
                message=f"Slug '{slug}' đã được sử dụng",
            )

    @staticmethod
    def _commit_post(db: Session, slug: str, post_id: int | None = None) -> None:
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            query = select(Post.id).where(Post.slug == slug)
            if post_id is not None:
                query = query.where(Post.id != post_id)
            if db.scalar(query) is not None:
                raise DuplicateException(
                    field="Slug",
                    value=slug,
                    message=f"Slug '{slug}' đã được sử dụng",
                )
            raise BadRequestException(
                message="Dữ liệu bài viết không hợp lệ hoặc vi phạm ràng buộc dữ liệu",
                error_code="POST_INTEGRITY_ERROR",
            ) from None

    @staticmethod
    def _set_status(post: Post, new_status: PostStatus) -> None:
        previous_status = post.status
        if new_status == PostStatus.ARCHIVED and previous_status != PostStatus.ARCHIVED.value:
            post.archived_from_status = previous_status
        elif previous_status == PostStatus.ARCHIVED.value and new_status != PostStatus.ARCHIVED:
            post.archived_from_status = None
        post.status = new_status.value
        if new_status == PostStatus.PUBLISHED and previous_status not in {
            PostStatus.PUBLISHED.value,
            PostStatus.ARCHIVED.value,
        }:
            post.published_at = datetime.now(UTC)
        elif new_status in {PostStatus.DRAFT, PostStatus.PENDING}:
            post.published_at = None

    @classmethod
    def get_admin_posts(
        cls,
        db: Session,
        params: AdminPostQueryParams,
        actor_id: UUID,
        actor_role: str,
    ) -> PaginatedResponse[Post]:
        role = cls._normalize_role(actor_role)
        query = (
            select(Post)
            .options(joinedload(Post.topic), joinedload(Post.author))
            .order_by(Post.created_at.desc(), Post.id.desc())
        )

        if role == "EDITOR":
            query = query.where(
                Post.author_id == actor_id
            )
        if params.status is not None:
            query = query.where(Post.status == params.status.value)
        if params.topic_id is not None:
            query = query.where(Post.topic_id == params.topic_id)
        if params.search and params.search.strip():
            keyword = f"%{params.search.strip()}%"
            query = query.where(
                or_(Post.title.ilike(keyword), Post.slug.ilike(keyword))
            )

        return paginate_query(db=db, query=query, pagination=params)

    @classmethod
    def get_post_by_id(
        cls, db: Session, post_id: int, actor_id: UUID, actor_role: str
    ) -> Post:
        post = cls._get_post_or_404(db, post_id)
        cls._ensure_post_access(post, actor_id, actor_role)
        return post

    @classmethod
    async def create_post(
        cls,
        db: Session,
        payload: CreatePostRequest,
        actor_id: UUID,
        actor_role: str,
        file: UploadFile | None = None,
    ) -> Post:
        role = cls._normalize_role(actor_role)
        if payload.topic_id is not None:
            cls._validate_topic(db, payload.topic_id)
        cls._ensure_unique_slug(db, payload.slug)

        thumbnail_url = str(payload.thumbnail_url) if payload.thumbnail_url else None
        if file is not None and getattr(file, "filename", None):
            upload_res = await MediaService.upload_image(file=file, folder=POST)
            thumbnail_url = upload_res.get("url")

        post = Post(
            title=payload.title,
            slug=payload.slug,
            summary=payload.summary,
            content=payload.content,
            thumbnail_url=thumbnail_url,
            topic_id=payload.topic_id,
            author_id=actor_id,
            status=payload.status.value,
        )
        db.add(post)
        cls._commit_post(db, payload.slug)
        return cls._get_post_or_404(db, post.id)

    @classmethod
    async def update_post(
        cls,
        db: Session,
        post_id: int,
        payload: UpdatePostRequest,
        actor_id: UUID,
        actor_role: str,
        file: UploadFile | None = None,
    ) -> Post:
        role = cls._normalize_role(actor_role)
        post = cls._get_post_or_404(db, post_id)
        cls._ensure_post_access(post, actor_id, role)

        update_data = payload.model_dump(exclude_unset=True)
        if "topic_id" in update_data:
            cls._validate_topic(db, update_data["topic_id"])
        if "slug" in update_data:
            cls._ensure_unique_slug(
                db, update_data["slug"], exclude_post_id=post_id
            )

        if "status" in update_data:
            new_status = update_data.pop("status")
            if role == "EDITOR" and new_status not in {
                PostStatus.DRAFT,
                PostStatus.PENDING,
            }:
                raise ForbiddenException(
                    message="Editor chỉ được đề xuất trạng thái DRAFT hoặc PENDING",
                    error_code="POST_STATUS_CHANGE_FORBIDDEN",
                )
            cls._set_status(post, new_status)

        for field, value in update_data.items():
            if field == "thumbnail_url":
                value = str(value) if value is not None else None
            setattr(post, field, value)

        if file is not None and getattr(file, "filename", None):
            upload_res = await MediaService.upload_image(file=file, folder=POST)
            post.thumbnail_url = upload_res.get("url")

        cls._commit_post(db, post.slug, post_id=post_id)
        return cls._get_post_or_404(db, post_id)

    @classmethod
    def update_post_status(
        cls,
        db: Session,
        post_id: int,
        payload: UpdatePostStatusRequest,
        actor_id: UUID,
        actor_role: str,
    ) -> Post:
        role = cls._normalize_role(actor_role)
        post = cls._get_post_or_404(db, post_id)
        cls._ensure_post_access(post, actor_id, role)

        if role == "EDITOR" and payload.status not in {
            PostStatus.DRAFT,
            PostStatus.PENDING,
        }:
            raise ForbiddenException(
                message="Editor chỉ được đề xuất trạng thái DRAFT hoặc PENDING",
                error_code="POST_STATUS_CHANGE_FORBIDDEN",
            )

        cls._set_status(post, payload.status)
        cls._commit_post(db, post.slug, post_id=post_id)
        return cls._get_post_or_404(db, post_id)

    @classmethod
    def delete_post(
        cls, db: Session, post_id: int, actor_id: UUID, actor_role: str
    ) -> None:
        role = cls._normalize_role(actor_role)
        if role != "ADMIN":
            raise ForbiddenException(
                message="Chỉ Admin mới được xóa bài viết",
                error_code="POST_DELETE_FORBIDDEN",
            )

        post = cls._get_post_or_404(db, post_id)
        db.delete(post)
        db.commit()

    @classmethod
    def restore_post(
        cls, db: Session, post_id: int, actor_role: str
    ) -> Post:
        if cls._normalize_role(actor_role) != "ADMIN":
            raise ForbiddenException(
                message="Chỉ Admin mới được khôi phục bài viết đã lưu trữ",
                error_code="POST_RESTORE_FORBIDDEN",
            )
        post = cls._get_post_or_404(db, post_id)
        if post.status != PostStatus.ARCHIVED.value:
            raise BadRequestException(
                message="Chỉ có thể khôi phục bài viết đang ở trạng thái ARCHIVED",
                error_code="POST_NOT_ARCHIVED",
            )
        try:
            restored_status = PostStatus(post.archived_from_status or PostStatus.DRAFT.value)
        except ValueError:
            restored_status = PostStatus.DRAFT
        post.archived_from_status = None
        cls._set_status(post, restored_status)
        cls._commit_post(db, post.slug, post_id=post_id)
        return cls._get_post_or_404(db, post_id)


class TopicService:
    """Nghiệp vụ quản lý danh mục / chủ đề bài viết."""

    @staticmethod
    def get_topics(db: Session, topic_type: str | None = None) -> list[Topic]:
        query = select(Topic).order_by(Topic.id.asc())
        if topic_type:
            query = query.where(Topic.type == topic_type)
        topics = list(db.scalars(query).all())
        return topics

    @staticmethod
    def create_topic(db: Session, payload: TopicCreateRequest) -> Topic:
        existing = db.scalar(select(Topic).where(Topic.slug == payload.slug))
        if existing:
            raise DuplicateException(
                field="slug",
                value=payload.slug,
                message=f"Chủ đề với slug '{payload.slug}' đã tồn tại",
            )
        topic = Topic(name=payload.name, slug=payload.slug, type="CATEGORY")
        db.add(topic)
        db.commit()
        db.refresh(topic)
        return topic

    @staticmethod
    def get_topic_by_id(db: Session, topic_id: int) -> Topic:
        topic = db.scalar(select(Topic).where(Topic.id == topic_id))
        if topic is None:
            raise NotFoundException(
                resource="Chủ đề",
                id_or_slug=topic_id,
                message=f"Không tìm thấy chủ đề với ID {topic_id}",
            )
        return topic

    @staticmethod
    def update_topic(db: Session, topic_id: int, payload: TopicUpdateRequest) -> Topic:
        topic = TopicService.get_topic_by_id(db, topic_id)
        update_data = payload.model_dump(exclude_unset=True)

        if "slug" in update_data and update_data["slug"]:
            new_slug = update_data["slug"]
            existing = db.scalar(
                select(Topic.id).where(Topic.slug == new_slug, Topic.id != topic_id)
            )
            if existing:
                raise DuplicateException(
                    field="slug",
                    value=new_slug,
                    message=f"Chủ đề với slug '{new_slug}' đã tồn tại",
                )
            topic.slug = new_slug

        if "name" in update_data and update_data["name"]:
            topic.name = update_data["name"]

        db.commit()
        db.refresh(topic)
        return topic

    @staticmethod
    def delete_topic(db: Session, topic_id: int) -> None:
        topic = TopicService.get_topic_by_id(db, topic_id)
        db.query(Post).filter(Post.topic_id == topic_id).update({Post.topic_id: None})
        db.delete(topic)
        db.commit()


class PublicPostService:
    """Nghiệp vụ bài viết và chủ đề dành cho khách hàng (Public)."""

    @staticmethod
    def get_public_topics(db: Session) -> list[dict]:
        """Lấy danh sách các chủ đề kèm số lượng bài viết đã xuất bản."""
        # Đảm bảo có dữ liệu mẫu trước

        stmt = (
            select(
                Topic.id,
                Topic.name,
                Topic.slug,
                func.count(Post.id).filter(Post.status == PostStatus.PUBLISHED.value).label("posts_count"),
            )
            .outerjoin(Post, Topic.id == Post.topic_id)
            .group_by(Topic.id)
            .order_by(Topic.id.asc())
        )
        rows = db.execute(stmt).all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "slug": row.slug,
                "posts_count": row.posts_count,
            }
            for row in rows
        ]

    @staticmethod
    def get_public_posts(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        topic_slug: str | None = None,
        search: str | None = None,
    ) -> PaginatedResponse[Post]:
        """Lấy danh sách bài viết đã xuất bản, hỗ trợ lọc theo topic_slug và tìm kiếm."""

        query = (
            select(Post)
            .options(joinedload(Post.topic), joinedload(Post.author))
            .where(Post.status == PostStatus.PUBLISHED.value)
        )

        if topic_slug:
            query = query.join(Post.topic).where(Topic.slug == topic_slug)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Post.title.ilike(search_pattern),
                    Post.summary.ilike(search_pattern),
                )
            )

        query = query.order_by(Post.published_at.desc().nullslast(), Post.id.desc())

        return paginate_query(
            db=db,
            query=query,
            pagination=PaginationParams(page=page, page_size=page_size),
        )

    @staticmethod
    def get_public_post_detail(db: Session, topic_slug: str, post_slug: str) -> Post:
        """Lấy chi tiết bài viết theo topic_slug và post_slug, tăng lượt xem và lấy bài liên quan."""

        post = db.scalar(
            select(Post)
            .options(joinedload(Post.topic), joinedload(Post.author))
            .where(
                Post.slug == post_slug,
                Post.status == PostStatus.PUBLISHED.value,
            )
        )

        if post is None:
            raise NotFoundException(
                resource="Bài viết",
                id_or_slug=post_slug,
                message=f"Không tìm thấy bài viết '{post_slug}'",
            )

        if post.topic is None or post.topic.slug != topic_slug:
            raise NotFoundException(
                resource="Bài viết",
                id_or_slug=f"{topic_slug}/{post_slug}",
                message=f"Bài viết không thuộc chủ đề '{topic_slug}'",
            )

        # Lấy bài viết liên quan cùng chủ đề
        related_stmt = (
            select(Post)
            .options(joinedload(Post.topic), joinedload(Post.author))
            .where(
                Post.status == PostStatus.PUBLISHED.value,
                Post.id != post.id,
                Post.topic_id == post.topic_id,
            )
            .order_by(Post.published_at.desc().nullslast(), Post.id.desc())
            .limit(4)
        )
        related_posts = list(db.scalars(related_stmt).all())
        post.related_posts = related_posts

        return post

    