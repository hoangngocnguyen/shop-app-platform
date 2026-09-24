import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class Order(Base):
    """Model đại diện cho bảng đơn hàng (orders)."""

    __tablename__ = "orders"

    order_id: Mapped[str] = mapped_column(
        String(30), primary_key=True, comment="Mã định danh đơn hàng"
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
        comment="Mã người mua hàng",
    )

    order_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="Thời điểm đặt đơn",
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        index=True,
        nullable=False,
        comment="Trạng thái đơn hàng (PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED)",
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(38, 2),
        default=Decimal("0.00"),
        nullable=False,
        comment="Tổng giá trị đơn hàng",
    )

    shipping_address: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Địa chỉ nhận hàng",
    )

    receiver_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Tên người nhận hàng",
    )

    shipping_phone: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Số điện thoại nhận hàng",
    )

    payment_method: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        default="COD",
        comment="Hình thức thanh toán (COD, VNPAY, MOMO, CREDIT_CARD)",
    )

    payment_status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False,
        comment="Trạng thái thanh toán (PENDING, PAID, FAILED, REFUNDED)",
    )

    payment_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        comment="Thời điểm thanh toán thành công",
    )

    delivery_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        comment="Ngày giao hàng thực tế/dự kiến",
    )

    return_period_day: Mapped[int] = mapped_column(
        Integer,
        default=7,
        nullable=False,
        comment="Số ngày cho phép đổi trả",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="Thời điểm cập nhật đơn hàng",
    )

    # Quan hệ ORM
    user = relationship("User", back_populates="orders")
    order_details = relationship(
        "OrderDetail", back_populates="order", cascade="all, delete-orphan"
    )
    order_logs = relationship(
        "OrderLog", back_populates="order", cascade="all, delete-orphan"
    )


class OrderDetail(Base):
    """Model đại diện cho bảng chi tiết đơn hàng (order_details)."""

    __tablename__ = "order_details"

    order_detail_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh chi tiết đơn"
    )

    order_id: Mapped[str] = mapped_column(
        String(30),
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="Đơn hàng liên kết",
    )

    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.product_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
        comment="Sản phẩm được mua",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Số lượng mua",
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(38, 2),
        nullable=False,
        comment="Giá bán của sản phẩm tại thời điểm đặt hàng",
    )

    # Quan hệ ORM
    order = relationship("Order", back_populates="order_details")
    product = relationship("Product")


class OrderLog(Base):
    """Model đại diện cho bảng nhật ký đơn hàng (order_logs)."""

    __tablename__ = "order_logs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Mã định danh bản ghi log"
    )

    order_id: Mapped[str] = mapped_column(
        String(30),
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        comment="Đơn hàng được theo dõi",
    )

    status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="Trạng thái đơn tại thời điểm ghi log",
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Mô tả chi tiết hành động / diễn biến",
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
        comment="Người thực hiện thao tác",
    )

    log_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="Thời điểm ghi nhận sự kiện",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="Thời điểm cập nhật log",
    )

    # Quan hệ ORM
    order = relationship("Order", back_populates="order_logs")
    user = relationship("User")
