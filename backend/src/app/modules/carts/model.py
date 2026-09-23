import uuid
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class Cart(Base):
    """Model đại diện cho bảng giỏ hàng (carts). Mỗi người dùng sở hữu tối đa 1 giỏ hàng."""

    __tablename__ = "carts"

    cart_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh giỏ hàng"
    )

    # Khóa ngoại FK liên kết 1-1 với users
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        comment="Mã người dùng sở hữu giỏ hàng",
    )

    # Quan hệ ORM
    user = relationship("User", back_populates="cart")
    cart_items = relationship(
        "CartItem", back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(Base):
    """Model đại diện cho bảng chi tiết giỏ hàng (cart_items)."""

    __tablename__ = "cart_items"

    cart_item_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh chi tiết giỏ"
    )

    # Khóa ngoại FK liên kết với carts
    cart_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("carts.cart_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="Mã giỏ hàng",
    )

    # Khóa ngoại FK liên kết với products
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="Mã sản phẩm",
    )

    quantity: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False, comment="Số lượng sản phẩm trong giỏ"
    )

    # Quan hệ ORM
    cart = relationship("Cart", back_populates="cart_items")
    product = relationship("Product")
