import math
from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from src.app.modules.carts.model import Cart, CartItem
from src.app.modules.orders.model import Order, OrderDetail, OrderLog
from src.app.modules.products.model import Product
from src.app.modules.shipping_addresses.model import ShippingAddress


class OrderRepository:
    """Repository quản lý tương tác CSDL cho Orders và Checkout theo chuẩn SQLAlchemy 2.0."""

    def __init__(self, db: Session) -> None:
        self.db = db

    # ==========================================================================
    # 1. TRANSACTION CONTROLS
    # ==========================================================================

    def begin(self) -> None:
        if not self.db.in_transaction():
            self.db.begin()

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()

    # ==========================================================================
    # 2. PRODUCT & ADDRESS QUERIES (CHECKOUT SUPPORT)
    # ==========================================================================

    def get_product_by_id(
        self, product_id: int, for_update: bool = False
    ) -> Product | None:
        """Lấy thông tin sản phẩm theo product_id."""
        stmt = select(Product).where(Product.product_id == product_id)
        if for_update:
            stmt = stmt.with_for_update()
        return self.db.scalar(stmt)

    def exists_by_id(self, order_id: str) -> bool:
        """Kiểm tra xem mã đơn hàng đã tồn tại trong cơ sở dữ liệu hay chưa."""
        stmt = select(Order.order_id).where(Order.order_id == order_id).limit(1)
        return self.db.scalar(stmt) is not None

    def get_products_by_ids(self, product_ids: Sequence[int]) -> list[Product]:
        """Lấy danh sách sản phẩm theo danh sách product_id."""
        if not product_ids:
            return []
        stmt = select(Product).where(Product.product_id.in_(product_ids))
        return list(self.db.scalars(stmt).all())

    def get_cart_items_for_user(
        self, user_id: UUID, cart_item_ids: Sequence[int]
    ) -> list[CartItem]:
        """Lấy các mục giỏ hàng theo cart_item_id, nhưng chỉ từ giỏ hàng của user hiện tại."""
        if not cart_item_ids:
            return []
        unique_ids = list(
            dict.fromkeys(int(item_id) for item_id in cart_item_ids if item_id > 0)
        )
        if not unique_ids:
            return []

        stmt = (
            select(CartItem)
            .join(Cart, Cart.cart_id == CartItem.cart_id)
            .options(selectinload(CartItem.product))
            .where(Cart.user_id == user_id, CartItem.cart_item_id.in_(unique_ids))
        )
        return list(self.db.scalars(stmt).all())

    def get_shipping_address(
        self, address_id: int, user_id: UUID
    ) -> ShippingAddress | None:
        """
        Lấy địa chỉ giao hàng và kiểm tra quyền sở hữu của user.
        Load sẵn quan hệ province và ward để format địa chỉ đầy đủ.
        """
        stmt = (
            select(ShippingAddress)
            .options(
                joinedload(ShippingAddress.province),
                joinedload(ShippingAddress.ward),
            )
            .where(
                ShippingAddress.id == address_id,
                ShippingAddress.user_id == user_id,
            )
        )
        return self.db.scalar(stmt)

    # ==========================================================================
    # 3. ORDER CREATION & LOGGING
    # ==========================================================================

    def create_order(
        self,
        order: Order,
        items: list[OrderDetail],
        log_description: str = "Đơn hàng đã được tạo thành công",
    ) -> Order:
        """
        Tạo đơn hàng mới, danh sách chi tiết đơn hàng và bản ghi log ban đầu
        trong cùng một transaction.
        """
        self.db.add(order)
        self.db.flush()  # Đảm bảo order_id đã có hiệu lực

        for item in items:
            item.order_id = order.order_id
            self.db.add(item)

        initial_log = OrderLog(
            order_id=order.order_id,
            status=order.status,
            description=log_description,
            user_id=order.user_id,
            log_date=datetime.now(UTC),
        )
        self.db.add(initial_log)

        self.db.commit()
        self.db.refresh(order)
        return order

    def add_order_log(
        self,
        order_id: str,
        status: str,
        description: str,
        user_id: UUID | None = None,
    ) -> OrderLog:
        """Ghi thêm một bản ghi vào lịch sử trạng thái đơn hàng (order_logs)."""
        log_entry = OrderLog(
            order_id=order_id,
            status=status,
            description=description,
            user_id=user_id,
            log_date=datetime.now(UTC),
        )
        self.db.add(log_entry)
        return log_entry

    # ==========================================================================
    # 4. ORDER QUERIES
    # ==========================================================================

    def get_order_by_id(
        self, order_id: str, user_id: UUID | None = None
    ) -> Order | None:
        """
        Lấy thông tin chi tiết một đơn hàng kèm theo order_details, sản phẩm
        và order_logs (sắp xếp tăng dần theo thời gian log).
        """
        stmt = (
            select(Order)
            .options(
                selectinload(Order.order_details).joinedload(OrderDetail.product),
                selectinload(Order.order_logs),
            )
            .where(Order.order_id == order_id)
        )
        if user_id is not None:
            stmt = stmt.where(Order.user_id == user_id)

        return self.db.scalar(stmt)

    def get_user_orders_paginated(
        self,
        user_id: UUID,
        status: str | None = None,
        search: str | None = None,
        page: int = 1,
        limit: int = 10,
    ) -> tuple[list[Order], int, int]:
        """
        Lấy danh sách đơn hàng có phân trang, hỗ trợ lọc theo trạng thái
        và tìm kiếm theo mã đơn hàng hoặc tên sản phẩm liên kết.

        Returns:
            Tuple[List[Order], total_items, total_pages]
        """
        base_query = (
            select(Order)
            .options(selectinload(Order.order_details).joinedload(OrderDetail.product))
            .where(Order.user_id == user_id)
        )

        if status:
            base_query = base_query.where(Order.status == status)

        if search and search.strip():
            search_pattern = f"%{search.strip()}%"
            # Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm bên trong chi tiết đơn
            base_query = base_query.where(
                or_(
                    Order.order_id.ilike(search_pattern),
                    Order.order_details.any(
                        OrderDetail.product.has(
                            Product.product_name.ilike(search_pattern)
                        )
                    ),
                )
            )

        # Tính tổng số bản ghi
        count_stmt = select(func.count(Order.order_id)).select_from(
            base_query.subquery()
        )
        total_items: int = self.db.scalar(count_stmt) or 0

        total_pages = math.ceil(total_items / limit) if total_items > 0 else 1
        offset = (page - 1) * limit

        # Sắp xếp theo ngày đặt mới nhất
        paged_stmt = (
            base_query.order_by(desc(Order.order_date)).offset(offset).limit(limit)
        )
        orders = list(self.db.scalars(paged_stmt).all())

        return orders, total_items, total_pages

    # ==========================================================================
    # 5. ORDER STATUS TRANSITIONS & INVENTORY MANAGEMENT
    # ==========================================================================

    def update_order_status(
        self,
        order: Order,
        new_status: str,
        description: str,
        completed_date: datetime | None = None,
    ) -> Order:
        """Cập nhật trạng thái đơn hàng thông thường và ghi nhật ký log."""
        order.status = new_status
        order.updated_at = datetime.now(UTC)
        if completed_date:
            order.delivered_at = completed_date

        self.add_order_log(
            order_id=order.order_id,
            status=new_status,
            description=description,
            user_id=order.user_id,
        )
        self.db.commit()
        self.db.refresh(order)
        return order

    def cancel_order_record(
        self,
        order: Order,
        cancel_reason: str,
        cancelled_by_type: str,
        cancelled_by_id: UUID | None,
        cancelled_at: datetime,
        log_description: str,
    ) -> Order:
        """
        Cập nhật đơn hàng sang trạng thái CANCELLED, lưu đầy đủ thông tin:
        - cancel_reason: Lý do hủy
        - cancelled_by_type: Loại đối tượng hủy (CUSTOMER, SHOP_OWNER, SYSTEM, ADMIN)
        - cancelled_by_id: ID người thực hiện hủy (có thể None nếu SYSTEM)
        - cancelled_at: Thời điểm hủy (UTC)
        Và tự động ghi log vào order_logs.
        """
        order.status = "CANCELLED"
        order.cancel_reason = cancel_reason
        order.cancelled_by_type = cancelled_by_type
        order.cancelled_by_id = cancelled_by_id
        order.cancelled_at = cancelled_at
        order.updated_at = cancelled_at

        self.add_order_log(
            order_id=order.order_id,
            status="CANCELLED",
            description=log_description,
            user_id=cancelled_by_id,
        )
        self.db.commit()
        self.db.refresh(order)
        return order

    def deduct_inventory(self, product_id: int, quantity: int) -> None:
        """Trừ tồn kho và tăng số lượng đã bán khi đặt hàng thành công."""
        product = self.get_product_by_id(product_id)
        if product:
            product.quantity -= quantity
            product.sold += quantity

    def restore_inventory(self, order: Order) -> None:
        """Hoàn trả tồn kho và giảm số lượng bán khi đơn hàng bị hủy."""
        for item in order.order_details:
            product = self.get_product_by_id(item.product_id)
            if product:
                product.quantity += item.quantity
                product.sold = max(0, product.sold - item.quantity)
