import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base
from src.app.modules.roles.model import Role  # noqa: F401
from src.app.modules.shipping_addresses.model import ShippingAddress  # noqa: F401
from src.app.modules.auth.model import PasswordResetToken, RefreshToken  # noqa: F401
from src.app.modules.carts.model import Cart  # noqa: F401
from src.app.modules.orders.model import Order  # noqa: F401


class User(Base):
    """Model đại diện cho bảng người dùng (users) trong hệ thống."""

    __tablename__ = "users"

    # Khóa chính UUID (16 bytes native PostgreSQL)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID định danh duy nhất của người dùng",
    )

    # Thông tin cá nhân
    name: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="Họ và tên người dùng"
    )
    username: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False, comment="Tên đăng nhập duy nhất"
    )
    password: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Mật khẩu đã được mã hóa (băm)"
    )
    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True, comment="Địa chỉ email duy nhất"
    )
    phone: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True, comment="Số điện thoại duy nhất"
    )
    address: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="Địa chỉ liên hệ chính"
    )

    # Trạng thái tài khoản & Phân quyền
    is_blocked: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Trạng thái khóa (False: Hoạt động, True: Khóa)"
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="URL ảnh đại diện trên Cloudinary"
    )
    date_of_birth: Mapped[date | None] = mapped_column(
        Date, nullable=True, comment="Ngày sinh"
    )
    provider: Mapped[str | None] = mapped_column(
        String(255), nullable=True, default="LOCAL", comment="Nhà cung cấp đăng nhập (LOCAL, GOOGLE...)"
    )
    role_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("roles.id", ondelete="RESTRICT"),
        default=2,
        nullable=False,
        comment="Mã vai trò (Mặc định 2: USER)",
    )

    # Nhật ký thời gian & Audit
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="Thời điểm đăng nhập gần nhất"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False, comment="Thời điểm tạo tài khoản"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="Thời điểm cập nhật tài khoản gần nhất",
    )

    # Quan hệ ORM
    role = relationship("Role", back_populates="users")
    shipping_addresses = relationship(
        "ShippingAddress", back_populates="user", cascade="all, delete-orphan"
    )
    password_reset_tokens = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    cart = relationship(
        "Cart", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="user")
