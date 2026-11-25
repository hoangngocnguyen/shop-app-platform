from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .models import BannerPosition

BannerStatus = Literal["running", "scheduled", "expired", "disabled"]


# ---------- validators dùng chung ----------
def _clean_link(v: str | None) -> str | None:
    if v is None:
        return None
    v = v.strip()
    if not v:
        return None
    # "//evil.com" và "/\evil.com" bị trình duyệt hiểu là link ngoài -> chặn
    if v.startswith("https://") or (
        v.startswith("/") and not v.startswith("//") and "\\" not in v
    ):
        return v
    raise ValueError("link_url chỉ được bắt đầu bằng '/' hoặc 'https://'")


def _clean_image(v: str | None) -> str | None:
    if v is None:
        return None
    v = v.strip()
    if not v:
        return None
    if not v.startswith("https://"):
        raise ValueError("URL ảnh phải bắt đầu bằng 'https://'")
    return v


def _aware(v: datetime | None) -> datetime | None:
    if v is not None and v.tzinfo is None:
        raise ValueError("Thời gian phải kèm múi giờ (ISO 8601, ví dụ 2026-12-01T00:00:00+07:00)")
    return v


def _check_range(start: datetime | None, end: datetime | None) -> None:
    if start and end and end <= start:
        raise ValueError("end_time phải lớn hơn start_time")


# ---------- request ----------
class BannerCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    image_url: str
    image_public_id: str | None = Field(default=None, max_length=255)
    mobile_image_url: str | None = None
    mobile_image_public_id: str | None = Field(default=None, max_length=255)
    alt_text: str | None = Field(default=None, max_length=255)
    link_url: str | None = None
    position: BannerPosition
    priority: int = Field(default=0, ge=0, le=9999)
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_active: bool = True

    @field_validator("title")
    @classmethod
    def _title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title không được rỗng")
        return v

    @field_validator("image_url")
    @classmethod
    def _image(cls, v: str) -> str:
        v = _clean_image(v)
        if v is None:
            raise ValueError("image_url không được rỗng")
        return v

    _mobile = field_validator("mobile_image_url")(lambda cls, v: _clean_image(v))
    _link = field_validator("link_url")(lambda cls, v: _clean_link(v))
    _aware_times = field_validator("start_time", "end_time")(lambda cls, v: _aware(v))

    @field_validator("alt_text")
    @classmethod
    def _alt(cls, v: str | None) -> str | None:
        return (v or "").strip() or None

    @model_validator(mode="after")
    def _range(self):
        _check_range(self.start_time, self.end_time)
        return self


class BannerUpdate(BaseModel):
    """PUT: form admin luôn gửi đủ field; field optional để linh hoạt.
    Field nào KHÔNG gửi -> giữ nguyên. Gửi null cho field nullable -> xoá giá trị."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    image_url: str | None = None
    image_public_id: str | None = Field(default=None, max_length=255)
    mobile_image_url: str | None = None
    mobile_image_public_id: str | None = Field(default=None, max_length=255)
    alt_text: str | None = Field(default=None, max_length=255)
    link_url: str | None = None
    position: BannerPosition | None = None
    priority: int | None = Field(default=None, ge=0, le=9999)
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_active: bool | None = None

    _image = field_validator("image_url", "mobile_image_url")(lambda cls, v: _clean_image(v))
    _link = field_validator("link_url")(lambda cls, v: _clean_link(v))
    _aware_times = field_validator("start_time", "end_time")(lambda cls, v: _aware(v))

    @field_validator("title")
    @classmethod
    def _title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("title không được rỗng")
        return v

    @model_validator(mode="after")
    def _range(self):
        _check_range(self.start_time, self.end_time)
        return self


class BannerStatusUpdate(BaseModel):
    is_active: bool


# ---------- response ----------
class BannerPublic(BaseModel):
    """Public campaign content without admin-only status or audit fields."""

    id: int
    title: str
    image_url: str
    mobile_image_url: str  # luôn có giá trị (fallback về image_url)
    link_url: str | None
    alt_text: str  # luôn có giá trị (fallback về title)
    position: BannerPosition


class BannerAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    image_url: str
    image_public_id: str | None
    mobile_image_url: str | None
    mobile_image_public_id: str | None
    alt_text: str | None
    link_url: str | None
    position: BannerPosition
    priority: int
    start_time: datetime | None
    end_time: datetime | None
    is_active: bool
    status: BannerStatus
    created_at: datetime
    updated_at: datetime


class BannerListOut(BaseModel):
    items: list[BannerAdminOut]
    total: int
    page: int
    limit: int
