from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class Role(Base):
    """Model đại diện cho bảng vai trò (roles) trong hệ thống."""

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh vai trò"
    )
    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Mã vai trò duy nhất (ADMIN, USER, STAFF...)",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Tên hiển thị của vai trò (Quản trị viên, Khách hàng...)",
    )

    # Quan hệ 1-N với User
    users = relationship("User", back_populates="role")
