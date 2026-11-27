import logging
from datetime import datetime, timezone

import cloudinary.uploader  # Cloudinary đã được cấu hình sẵn trong backend
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .models import Banner, BannerPosition
from .schema import BannerCreate, BannerPublic, BannerUpdate

logger = logging.getLogger(__name__)

PUBLIC_LIMIT = {
    BannerPosition.POPUP: 1,
    BannerPosition.HOME_HERO: 8,
}
DEFAULT_PUBLIC_LIMIT = 20
NOT_NULLABLE = ("title", "image_url", "position", "priority", "is_active")
# (cột url, cột public_id) – để biết ảnh nào bị thay/xoá thì huỷ ảnh cũ trên Cloudinary
IMAGE_PAIRS = (
    ("image_url", "image_public_id"),
    ("mobile_image_url", "mobile_image_public_id"),
)
ORDER = (Banner.priority.desc(), Banner.created_at.desc(), Banner.id.desc())


# ---------- helpers ----------
def _destroy_images(public_ids: list[str | None]) -> None:
    """Lỗi Cloudinary chỉ log, không làm hỏng thao tác chính."""
    for pid in public_ids:
        if not pid:
            continue
        try:
            cloudinary.uploader.destroy(pid, invalidate=True)
        except Exception:
            logger.warning("Không xoá được ảnh Cloudinary: %s", pid, exc_info=True)


def _get_or_404(db: Session, banner_id: int) -> Banner:
    banner = db.get(Banner, banner_id)
    if banner is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy banner")
    return banner


def to_public(b: Banner) -> BannerPublic:
    return BannerPublic(
        id=b.id,
        title=b.title,
        image_url=b.image_url,
        mobile_image_url=b.mobile_image_url or b.image_url,
        link_url=b.link_url,
        alt_text=b.alt_text or b.title,
        position=BannerPosition(b.position),
    )


# ---------- public ----------
def list_public(db: Session, position: BannerPosition) -> list[BannerPublic]:
    now = datetime.now(timezone.utc)
    stmt = (
        select(Banner)
        .where(
            Banner.position == position.value,
            Banner.is_active.is_(True),
            or_(Banner.start_time.is_(None), Banner.start_time <= now),
            or_(Banner.end_time.is_(None), Banner.end_time >= now),
        )
        .order_by(*ORDER)
        .limit(PUBLIC_LIMIT.get(position, DEFAULT_PUBLIC_LIMIT))
    )
    return [to_public(b) for b in db.scalars(stmt).all()]


# ---------- admin ----------
def list_admin(
    db: Session,
    page: int,
    limit: int,
    position: BannerPosition | None,
    is_active: bool | None,
) -> tuple[list[Banner], int]:
    conditions = []
    if position is not None:
        conditions.append(Banner.position == position.value)
    if is_active is not None:
        conditions.append(Banner.is_active.is_(is_active))

    total = db.scalar(select(func.count()).select_from(Banner).where(*conditions)) or 0
    items = db.scalars(
        select(Banner)
        .where(*conditions)
        .order_by(*ORDER)
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()
    return list(items), total


def create_banner(db: Session, payload: BannerCreate) -> Banner:
    data = payload.model_dump()
    data["position"] = payload.position.value
    banner = Banner(**data)
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


def update_banner(db: Session, banner_id: int, payload: BannerUpdate) -> Banner:
    banner = _get_or_404(db, banner_id)
    data = payload.model_dump(exclude_unset=True)

    for field in NOT_NULLABLE:
        if field in data and data[field] is None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY, f"{field} không được để null"
            )
    if "position" in data:
        data["position"] = data["position"].value

    # end_time > start_time tính trên dữ liệu SAU khi gộp (payload có thể chỉ gửi 1 trong 2)
    start = data.get("start_time", banner.start_time)
    end = data.get("end_time", banner.end_time)
    if start and end and end <= start:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "end_time phải lớn hơn start_time")

    # ảnh bị thay/xoá -> gom public_id cũ để huỷ sau khi commit thành công
    to_destroy: list[str | None] = []
    for url_f, pid_f in IMAGE_PAIRS:
        if url_f in data and data[url_f] != getattr(banner, url_f):
            old_pid = getattr(banner, pid_f)
            if old_pid and old_pid != data.get(pid_f):
                to_destroy.append(old_pid)
            data.setdefault(pid_f, None)  # đổi ảnh mà không gửi public_id mới -> không giữ id cũ

    for field, value in data.items():
        setattr(banner, field, value)
    db.commit()
    db.refresh(banner)

    _destroy_images(to_destroy)
    return banner


def set_status(db: Session, banner_id: int, is_active: bool) -> Banner:
    banner = _get_or_404(db, banner_id)
    banner.is_active = is_active
    db.commit()
    db.refresh(banner)
    return banner


def delete_banner(db: Session, banner_id: int) -> None:
    banner = _get_or_404(db, banner_id)
    public_ids = [banner.image_public_id, banner.mobile_image_public_id]
    db.delete(banner)
    db.commit()
    _destroy_images(public_ids)  # xoá DB trước, rồi mới dọn ảnh mồ côi
