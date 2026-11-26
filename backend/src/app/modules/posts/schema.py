from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import AliasPath, BaseModel, ConfigDict, Field, HttpUrl, PositiveInt, field_validator

from src.app.core.pagination import PaginatedResponse, PaginationParams


class PostStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class CreatePostStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"


# ==========================================
# 2. QUERY PARAMS
# ==========================================
class AdminPostQueryParams(PaginationParams):
    """Query params để tìm kiếm, lọc và phân trang bài viết trong trang quản trị."""

    status: PostStatus | None = Field(default=None, description="Lọc theo trạng thái bài viết")
    topic_id: PositiveInt | None = Field(default=None, description="Lọc theo ID chủ đề")
    search: str | None = Field(default=None, description="Tìm kiếm theo tiêu đề hoặc slug")


# ==========================================
# 3. REQUEST SCHEMAS (Đầu vào)
# ==========================================
class TopicResponse(BaseModel):
    """Thông tin danh mục / chủ đề bài viết."""

    id: PositiveInt = Field(..., description="ID chủ đề")
    name: str = Field(..., description="Tên chủ đề")
    slug: str = Field(..., description="Slug SEO của chủ đề")

    model_config = ConfigDict(from_attributes=True)


class TopicCreateRequest(BaseModel):
    """Dữ liệu tạo mới danh mục / chủ đề bài viết."""

    name: str = Field(..., min_length=2, max_length=100, description="Tên danh mục bài viết")
    slug: str = Field(..., min_length=2, max_length=100, description="Slug SEO")


class TopicUpdateRequest(BaseModel):
    """Dữ liệu cập nhật danh mục / chủ đề bài viết."""

    name: str | None = Field(default=None, min_length=2, max_length=100, description="Tên danh mục bài viết")
    slug: str | None = Field(default=None, min_length=2, max_length=100, description="Slug SEO")

    model_config = ConfigDict(str_strip_whitespace=True)


class TopicDeleteResponse(BaseModel):
    """Thông báo sau khi xóa danh mục bài viết thành công."""

    id: int = Field(..., description="ID danh mục đã xóa")
    message: str = Field(default="Xóa danh mục thành công", description="Thông báo")


class CreatePostRequest(BaseModel):
    """Dữ liệu tạo bài viết mới; trạng thái ban đầu chỉ có thể là DRAFT hoặc PENDING."""

    title: str = Field(..., min_length=5, max_length=255, description="Tiêu đề bài viết")
    slug: str = Field(
        ...,
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="Slug SEO dạng chữ thường, số và dấu gạch ngang",
    )
    summary: str | None = Field(default=None, max_length=500, description="Mô tả ngắn / sapo")
    content: str = Field(..., min_length=1, description="Nội dung bài viết dạng HTML hoặc Markdown")
    thumbnail_url: HttpUrl | None = Field(default=None, description="URL ảnh đại diện bài viết")
    topic_id: PositiveInt | None = Field(default=None, description="ID danh mục/chủ đề bài viết (tùy chọn)")
    status: CreatePostStatus = Field(default=CreatePostStatus.DRAFT, description="Trạng thái ban đầu")

    model_config = ConfigDict(str_strip_whitespace=True)


class UpdatePostRequest(BaseModel):
    """Dữ liệu cập nhật một phần hoặc toàn bộ thông tin bài viết."""

    title: str | None = Field(default=None, min_length=5, max_length=255, description="Tiêu đề bài viết")
    slug: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="Slug SEO dạng chữ thường, số và dấu gạch ngang",
    )
    summary: str | None = Field(default=None, max_length=500, description="Mô tả ngắn / sapo")
    content: str | None = Field(default=None, min_length=1, description="Nội dung bài viết dạng HTML hoặc Markdown")
    thumbnail_url: HttpUrl | None = Field(default=None, description="URL ảnh đại diện bài viết")
    topic_id: PositiveInt | None = Field(default=None, description="ID danh mục/chủ đề bài viết (tùy chọn)")
    status: PostStatus | None = Field(default=None, description="Trạng thái bài viết")

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("title", "slug", "content", "status", mode="before")
    @classmethod
    def reject_explicit_null(cls, value: object) -> object:
        """Chặn client gửi null cho các field không được phép null khi đã cung cấp."""
        if value is None:
            raise ValueError("Trường này không được phép là null")
        return value


class UpdatePostStatusRequest(BaseModel):
    """Dữ liệu thay đổi nhanh trạng thái bài viết."""

    status: PostStatus = Field(..., description="Trạng thái mới của bài viết")


# ==========================================
# 4. RESPONSE SCHEMAS (Đầu ra)
# ==========================================
class DeleteResponse(BaseModel):
    """Response sau khi xóa thành công."""

    id: int = Field(..., description="ID tài nguyên đã xóa")


class AdminPostListItemResponse(BaseModel):
    """Thông tin bài viết dùng trong danh sách quản trị."""

    id: PositiveInt = Field(..., description="ID bài viết")
    title: str = Field(..., description="Tiêu đề bài viết")
    slug: str = Field(..., description="Slug SEO của bài viết")
    summary: str | None = Field(default=None, description="Mô tả ngắn / sapo")
    thumbnail_url: str | None = Field(default=None, description="URL ảnh đại diện bài viết")
    topic_id: PositiveInt | None = Field(default=None, description="ID chủ đề bài viết")
    topic_name: str | None = Field(default=None, validation_alias=AliasPath("topic", "name"))
    author_id: UUID = Field(..., description="UUID tác giả bài viết")
    author_name: str | None = Field(default=None, validation_alias=AliasPath("author", "name"))
    status: PostStatus = Field(..., description="Trạng thái bài viết")
    published_at: datetime | None = Field(default=None, description="Thời điểm xuất bản")
    created_at: datetime = Field(..., description="Thời điểm tạo bài viết")
    updated_at: datetime = Field(..., description="Thời điểm cập nhật bài viết")

    model_config = ConfigDict(from_attributes=True)


class AdminPostDetailResponse(AdminPostListItemResponse):
    """Thông tin đầy đủ bài viết dùng cho màn hình xem và chỉnh sửa (Edit Page)."""

    content: str = Field(..., description="Nội dung bài viết dạng HTML hoặc Markdown")


AdminPostListResponse = PaginatedResponse[AdminPostListItemResponse]


# ==========================================
# 5. PUBLIC RESPONSE SCHEMAS (Khách hàng)
# ==========================================
class PublicTopicResponse(BaseModel):
    """Thông tin danh mục/chủ đề bài viết phía khách hàng."""

    id: PositiveInt = Field(..., description="ID chủ đề")
    name: str = Field(..., description="Tên chủ đề")
    slug: str = Field(..., description="Slug SEO của chủ đề")
    posts_count: int = Field(default=0, ge=0, description="Số lượng bài viết đã xuất bản")

    model_config = ConfigDict(from_attributes=True)


class PublicPostListItemResponse(BaseModel):
    """Thông tin bài viết rút gọn hiển thị cho khách hàng."""

    id: PositiveInt = Field(..., description="ID bài viết")
    title: str = Field(..., description="Tiêu đề bài viết")
    slug: str = Field(..., description="Slug SEO của bài viết")
    summary: str | None = Field(default=None, description="Mô tả ngắn / sapo")
    thumbnail_url: str | None = Field(default=None, description="URL ảnh đại diện bài viết")
    topic_id: PositiveInt | None = Field(default=None, description="ID chủ đề")
    topic_name: str | None = Field(default=None, validation_alias=AliasPath("topic", "name"))
    topic_slug: str | None = Field(default=None, validation_alias=AliasPath("topic", "slug"))
    author_name: str | None = Field(default=None, validation_alias=AliasPath("author", "name"))
    published_at: datetime | None = Field(default=None, description="Thời điểm xuất bản")
    created_at: datetime = Field(..., description="Thời điểm tạo bài viết")

    model_config = ConfigDict(from_attributes=True)


class PublicPostDetailResponse(PublicPostListItemResponse):
    """Chi tiết bài viết hiển thị cho khách hàng kèm danh sách bài viết liên quan."""

    content: str = Field(..., description="Nội dung bài viết dạng HTML hoặc Markdown")
    related_posts: list[PublicPostListItemResponse] = Field(
        default_factory=list, description="Danh sách bài viết liên quan"
    )


PublicPostListResponse = PaginatedResponse[PublicPostListItemResponse]
