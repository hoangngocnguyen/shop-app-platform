from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class Role(Base):
    """Model đại diện cho bảng vai trò (roles) trong hệ thống."""

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh vai trò"
    )
    name: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, comment="Tên vai trò (ROLE_ADMIN, ROLE_USER)"
    )

    # Quan hệ 1-N với User
    users = relationship("User", back_populates="role")
