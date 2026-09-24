import uuid
from datetime import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class PasswordResetToken(Base):
    """Model đại diện cho bảng token khôi phục mật khẩu (password_reset_token)."""

    __tablename__ = "password_reset_token"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh bản ghi"
    )
    token: Mapped[str] = mapped_column(
        String(255), index=True, nullable=False, comment="Chuỗi token đặt lại mật khẩu"
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        comment="Mã người dùng yêu cầu",
    )
    expiry_date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="Thời điểm hết hạn token"
    )

    # Quan hệ ORM
    user = relationship("User", back_populates="password_reset_tokens")


class RefreshToken(Base):
    """Model đại diện cho bảng JWT refresh token (refresh_token)."""

    __tablename__ = "refresh_token"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="Mã định danh token"
    )
    token: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False, comment="Chuỗi Refresh Token duy nhất"
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        comment="Mã người dùng sở hữu token",
    )
    expiry_date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="Thời điểm hết hạn của refresh token"
    )

    # Quan hệ ORM
    user = relationship("User", back_populates="refresh_tokens")
