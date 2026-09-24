import uuid
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class ShippingAddress(Base):
    """Model đại diện cho bảng sổ địa chỉ giao hàng (shipping_addresses)."""

    __tablename__ = "shipping_addresses"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh địa chỉ"
    )
    receiver_name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Họ tên người nhận hàng"
    )
    phone: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Số điện thoại người nhận hàng"
    )
    address: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Địa chỉ nhận hàng chi tiết"
    )

    # Khóa ngoại FK liên kết với users
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="Mã người dùng sở hữu địa chỉ",
    )

    # Quan hệ ORM
    user = relationship("User", back_populates="shipping_addresses")
