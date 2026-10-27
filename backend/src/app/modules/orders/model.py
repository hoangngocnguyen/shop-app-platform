import uuid
from datetime import UTC, datetime
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base

if TYPE_CHECKING:
    from src.app.modules.orders.model import OrderDetail, OrderLog
    from src.app.modules.products.model import Product
    from src.app.modules.shipping_addresses.model import ShippingAddress
    from src.app.modules.users.model import User


class CancelledByType(str, Enum):
    """
    Loại chủ thể thực hiện hủy đơn hàng:
    - CUSTOMER: Khách hàng chủ động hủy
    - STAFF: Nhân viên cửa hàng hủy
    - SYSTEM: Hệ thống tự động hủy (timeout, quy tắc hệ thống)
    - ADMIN: Quản trị viên hệ thống / Chăm sóc khách hàng hủy
    """

    CUSTOMER = "CUSTOMER"
    STAFF = "STAFF"
    SYSTEM = "SYSTEM"
    ADMIN = "ADMIN"


class Order(Base):
    """Model đại diện cho đơn hàng, lưu snapshot địa chỉ giao hàng tại thời điểm đặt hàng."""

    __tablename__ = "orders"

    order_id: Mapped[str] = mapped_column(
        String(30),
        primary_key=True,
        comment="Mã định danh đơn hàng",
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Mã người mua hàng",
    )

    address_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("shipping_addresses.id", ondelete="SET NULL"),
        nullable=True,
        comment="ID địa chỉ gốc từ sổ địa chỉ",
    )

    order_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        comment="Thời điểm đặt đơn",
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False,
        index=True,
        comment="Trạng thái đơn hàng",
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Tổng giá trị đơn hàng",
    )

    # Snapshot thông tin người nhận
    shipping_recipient_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Tên người nhận tại thời điểm đặt hàng",
    )

    shipping_phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Số điện thoại nhận hàng tại thời điểm đặt hàng",
    )

    # Snapshot địa chỉ giao hàng (Bao gồm cả Code phục vụ WMS / Vận chuyển)
    shipping_province_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Mã tỉnh/thành phố phục vụ tích hợp vận chuyển",
    )

    shipping_province_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Tên tỉnh/thành phố tại thời điểm đặt hàng",
    )

    shipping_ward_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Mã phường/xã phục vụ tích hợp vận chuyển",
    )

    shipping_ward_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Tên phường/xã tại thời điểm đặt hàng",
    )

    shipping_address_line: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Số nhà, tên đường và địa chỉ chi tiết",
    )

    # Thanh toán
    payment_method: Mapped[str] = mapped_column(
        String(30),
        default="COD",
        nullable=False,
        comment="Phương thức thanh toán",
    )

    payment_status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False,
        comment="Trạng thái thanh toán",
    )

    payment_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Thời điểm thanh toán thành công",
    )

    # Giao hàng
    estimated_delivery_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Thời gian giao hàng dự kiến",
    )

    delivered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Thời điểm giao hàng thực tế thành công",
    )

    return_period_day: Mapped[int] = mapped_column(
        Integer,
        default=7,
        nullable=False,
        comment="Số ngày được phép đổi trả theo đơn hàng",
    )

    # Ghi chú đơn hàng từ khách hàng
    note: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Ghi chú của khách hàng cho đơn hàng",
    )

    # ==========================================================================
    # CÁC TRƯỜNG DỮ LIỆU HỦY ĐƠN HÀNG (CANCELLATION AUDIT FIELDS)
    # ==========================================================================
    cancel_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Lý do hủy đơn hàng (chuỗi mô tả hoặc mã lý do kèm ghi chú)",
    )

    cancelled_by_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
        comment="Loại người hủy: CUSTOMER, SHOP_OWNER, SYSTEM, ADMIN",
    )

    cancelled_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="ID của tài khoản/người thực hiện hủy (NULL nếu do hệ thống SYSTEM)",
    )

    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Thời điểm thực hiện hủy đơn (chuẩn UTC)",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
        comment="Thời điểm cập nhật đơn hàng gần nhất",
    )

    # Quan hệ ORM
    user: Mapped["User"] = relationship(
        "User",
        back_populates="orders",
    )

    shipping_address_rel: Mapped["ShippingAddress | None"] = relationship(
        "ShippingAddress",
        lazy="select",
    )

    order_details: Mapped[list["OrderDetail"]] = relationship(
        "OrderDetail",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    order_logs: Mapped[list["OrderLog"]] = relationship(
        "OrderLog",
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderDetail(Base):
    """Model đại diện cho bảng chi tiết đơn hàng (order_details)."""

    __tablename__ = "order_details"

    order_detail_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Mã định danh chi tiết đơn",
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
    order: Mapped["Order"] = relationship("Order", back_populates="order_details")
    product: Mapped["Product"] = relationship("Product")


class OrderLog(Base):
    """Model đại diện cho bảng nhật ký đơn hàng (order_logs)."""

    __tablename__ = "order_logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Mã định danh bản ghi log",
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

    extra_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
        default=None,
        comment="Metadata kỹ thuật chi tiết của sự kiện (dạng JSON)",
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
    order: Mapped["Order"] = relationship("Order", back_populates="order_logs")
    user: Mapped["User | None"] = relationship("User")
