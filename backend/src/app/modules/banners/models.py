import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from src.app.core.database import Base


class BannerPosition(str, enum.Enum):
    HOME_HERO = "home_hero"
    HOME_BANNER_GRID = "home_banner_grid"
    CATEGORY_TOP = "category_top"
    POPUP = "popup"


_POSITIONS_SQL = ", ".join(f"'{p.value}'" for p in BannerPosition)


class Banner(Base):
    __tablename__ = "banners"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    image_public_id: Mapped[str | None] = mapped_column(String(255))
    mobile_image_url: Mapped[str | None] = mapped_column(Text)
    mobile_image_public_id: Mapped[str | None] = mapped_column(String(255))
    alt_text: Mapped[str | None] = mapped_column(String(255))
    link_url: Mapped[str | None] = mapped_column(Text)
    position: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint(f"position IN ({_POSITIONS_SQL})", name="ck_banners_position"),
        CheckConstraint(
            "start_time IS NULL OR end_time IS NULL OR end_time > start_time",
            name="ck_banners_time_range",
        ),
        CheckConstraint("priority BETWEEN 0 AND 9999", name="ck_banners_priority"),
        Index("idx_banners_public_query", "position", "is_active", text("priority DESC")),
    )

    @property
    def status(self) -> str:
        """running | scheduled | expired | disabled (cho Admin biết vì sao banner không hiện)."""
        now = datetime.now(timezone.utc)
        if not self.is_active:
            return "disabled"
        if self.start_time and self.start_time > now:
            return "scheduled"
        if self.end_time and self.end_time < now:
            return "expired"
        return "running"
