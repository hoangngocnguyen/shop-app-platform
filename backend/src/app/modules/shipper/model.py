from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.app.core.database import Base


class Shipper(Base):
    """Model đại diện cho bảng đơn vị / nhân viên vận chuyển (shipper)."""

    __tablename__ = "shipper"

    shipper_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh shipper"
    )

    name: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Tên shipper / Đơn vị vận chuyển"
    )

    phone: Mapped[str] = mapped_column(
        String(10), nullable=False, comment="Số điện thoại liên hệ"
    )

    status: Mapped[str | None] = mapped_column(
        String(50),
        default="ACTIVE",
        nullable=True,
        comment="Trạng thái hoạt động (ACTIVE, INACTIVE)",
    )
