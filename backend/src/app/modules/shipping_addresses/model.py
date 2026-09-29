import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class ShippingAddress(Base):
    """Model đại diện cho bảng sổ địa chỉ giao hàng (shipping_addresses)."""

    __tablename__ = "shipping_addresses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Mã định danh địa chỉ",
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Số điện thoại người nhận",
    )

    recipient_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Tên người nhận",
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="Mã người dùng sở hữu địa chỉ",
    )

    province_code: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("provinces.code"),
        nullable=False,
        comment="Mã tỉnh/thành phố",
    )

    ward_code: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("wards.code"),
        nullable=False,
        comment="Mã phường/xã",
    )

    address_line: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Số nhà, tên đường, căn hộ...",
    )

    is_default: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Địa chỉ được chọn mặc định khi checkout",
    )

    # Quan hệ ORM
    user = relationship("User", back_populates="shipping_addresses")
    province = relationship("Province")
    ward = relationship("Ward")
