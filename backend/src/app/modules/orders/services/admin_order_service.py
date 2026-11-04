from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from src.app.core.exceptions import AppException, NotFoundException
from src.app.core.pagination import PaginatedResponse
from src.app.modules.orders.enums.order_enums import (
    CANCEL_REASON_TEXT,
    ORDER_STATUS_LABELS,
    AdminCancelReason,
    CancelledByType,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.checkout_schema import CheckoutItemResponse
from src.app.modules.orders.schemas.order_requests import AdminCancelOrderRequest
from src.app.modules.orders.schemas.order_responses import (
    AdminOrderSummaryResponse,
    BulkOrderActionResponse,
    BulkOrderActionResultItem,
    OrderActionResponse,
    OrderDetailResponse,
    OrderItemSummaryResponse,
    OrderLogResponse,
    OrderStatusCountDTO,
)


class AdminOrderService:
    """Service xử lý nghiệp vụ quản trị đơn hàng cho Admin / Staff."""

    def __init__(self, repository: OrderRepository) -> None:
        self.repository = repository

    # ==========================================================================
    # 1. QUERIES (DANH SÁCH & CHI TIẾT & THỐNG KÊ TAB)
    # ==========================================================================

    def get_admin_orders(
        self,
        order_status: OrderStatus | None = None,
        payment_method: PaymentMethod | None = None,
        payment_status: PaymentStatus | None = None,
        search: str | None = None,
        sort_by: str = "order_date_desc",
        page: int = 1,
        page_size: int = 10,
    ) -> PaginatedResponse[AdminOrderSummaryResponse]:
        """
        Lấy danh sách tất cả đơn hàng cho Admin (hỗ trợ phân trang, lọc và tìm kiếm đa năng).
        # Bước 1: Query CSDL qua repository với các tiêu chí lọc
        # Bước 2: Format dữ liệu đầu ra sang AdminOrderSummaryResponse
        # Bước 3: Đóng gói PaginatedResponse chuẩn hóa
        """
        status_filter = order_status.value if order_status else None
        method_filter = payment_method.value if payment_method else None
        payment_status_filter = payment_status.value if payment_status else None

        orders, total_items, total_pages = self.repository.get_admin_orders_paginated(
            status=status_filter,
            payment_method=method_filter,
            payment_status=payment_status_filter,
            search=search,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
        )

        items_response: list[AdminOrderSummaryResponse] = []
        for order in orders:
            item_summaries: list[OrderItemSummaryResponse] = []
            for detail in order.order_details:
                prod = detail.product
                item_summaries.append(
                    OrderItemSummaryResponse(
                        product_id=detail.product_id,
                        product_name=prod.product_name if prod else f"Sản phẩm #{detail.product_id}",
                        product_image=prod.image_src if prod and prod.image_src else None,
                        original_price=prod.price if prod else None,
                        price=detail.price,
                        quantity=detail.quantity,
                        total_price=detail.price * detail.quantity,
                    )
                )

            customer_name = None
            customer_email = None
            if order.user:
                customer_name = order.user.name or order.user.username
                customer_email = order.user.email

            items_response.append(
                AdminOrderSummaryResponse(
                    order_id=order.order_id,
                    user_id=order.user_id,
                    customer_name=customer_name,
                    customer_email=customer_email,
                    shipping_recipient_name=order.shipping_recipient_name,
                    shipping_phone=order.shipping_phone,
                    shipping_province_name=order.shipping_province_name,
                    status=OrderStatus(order.status),
                    payment_method=PaymentMethod(order.payment_method),
                    payment_status=PaymentStatus(order.payment_status),
                    payment_date=order.payment_date,
                    total_amount=order.total,
                    total_items=sum(detail.quantity for detail in order.order_details) or 1,
                    created_at=order.order_date,
                    delivered_at=order.delivered_at,
                    cancel_reason=order.cancel_reason,
                    cancelled_by_type=order.cancelled_by_type,
                    items=item_summaries,
                )
            )

        return PaginatedResponse[AdminOrderSummaryResponse](
            items=items_response,
            total=total_items,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_order_status_statistics(self) -> list[OrderStatusCountDTO]:
        """
        Thống kê số lượng đơn hàng theo từng trạng thái phục vụ hiển thị badge trên Tab Admin.
        # Bước 1: Đếm số lượng theo trạng thái từ repository
        # Bước 2: Tạo thống kê cho tất cả các trạng thái và tổng số đơn (ALL)
        """
        counts = self.repository.count_orders_by_statuses()
        total_all = sum(counts.values())

        stats: list[OrderStatusCountDTO] = [
            OrderStatusCountDTO(
                status="ALL",
                label="Tất cả đơn hàng",
                count=total_all,
            )
        ]

        for s in OrderStatus:
            stats.append(
                OrderStatusCountDTO(
                    status=s.value,
                    label=ORDER_STATUS_LABELS.get(s.value, s.value),
                    count=counts.get(s.value, 0),
                )
            )

        return stats

    def get_admin_order_detail(self, order_id: str) -> OrderDetailResponse:
        """
        Lấy thông tin chi tiết một đơn hàng bất kỳ cho Admin.
        # Bước 1: Lấy đơn hàng từ CSDL kèm items, logs, user
        # Bước 2: Kiểm tra tồn tại
        # Bước 3: Format sang OrderDetailResponse
        """
        order = self.repository.get_admin_order_by_id(order_id=order_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        checkout_items: list[CheckoutItemResponse] = []
        for detail in order.order_details:
            prod = detail.product
            checkout_items.append(
                CheckoutItemResponse(
                    product_id=detail.product_id,
                    product_name=prod.product_name if prod else f"Sản phẩm #{detail.product_id}",
                    product_image=prod.image_src if prod and prod.image_src else None,
                    price=detail.price,
                    quantity=detail.quantity,
                    total_price=detail.price * detail.quantity,
                )
            )

        order_logs_response: list[OrderLogResponse] = [
            OrderLogResponse(
                status=log.status,
                note=log.description,
                timestamp=log.log_date,
            )
            for log in order.order_logs
        ]

        subtotal = sum((item.total_price for item in checkout_items), Decimal("0.00"))

        return OrderDetailResponse(
            order_id=order.order_id,
            user_id=order.user_id,
            payment_method=PaymentMethod(order.payment_method),
            payment_status=PaymentStatus(order.payment_status),
            status=OrderStatus(order.status),
            address_id=order.address_id,
            shipping_recipient_name=order.shipping_recipient_name,
            shipping_phone=order.shipping_phone,
            shipping_province_name=order.shipping_province_name,
            shipping_ward_name=order.shipping_ward_name,
            shipping_address_line=order.shipping_address_line,
            note=order.note,
            order_details=checkout_items,
            order_logs=order_logs_response,
            subtotal=subtotal,
            shipping_fee=Decimal("0.00"),
            total_amount=order.total,
            created_at=order.order_date,
            estimated_delivery_date=order.estimated_delivery_date,
            delivered_at=order.delivered_at,
            cancel_reason=order.cancel_reason,
            cancelled_by_type=order.cancelled_by_type,
            cancelled_by_id=order.cancelled_by_id,
            cancelled_at=order.cancelled_at,
        )

    # ==========================================================================
    # 2. STATUS TRANSITIONS (CONFIRM, SHIPPING, DELIVERED, CANCEL)
    # ==========================================================================

    def confirm_orders(
        self,
        admin_id: UUID,
        order_ids: list[str],
        note: str | None = None,
    ) -> BulkOrderActionResponse:
        """
        Admin xác nhận đơn hàng (PENDING -> PROCESSING).
        Hỗ trợ danh sách 1 hoặc nhiều đơn hàng.
        - Nếu thanh toán là BANK_TRANSFER (QR), tự động xác nhận đã thanh toán (payment_status = PAID).
        - Ghi log vào order_logs.
        """
        results: list[BulkOrderActionResultItem] = []
        success_count = 0

        # Loại bỏ trùng lặp order_ids
        unique_order_ids = list(dict.fromkeys(order_ids))
        orders = self.repository.get_orders_by_ids(unique_order_ids, for_update=True)
        order_map = {o.order_id: o for o in orders}

        now_time = datetime.now(UTC)

        for oid in unique_order_ids:
            order = order_map.get(oid)
            if not order:
                results.append(
                    BulkOrderActionResultItem(
                        order_id=oid,
                        success=False,
                        message="Đơn hàng không tồn tại trong hệ thống.",
                    )
                )
                continue

            if order.status != OrderStatus.PENDING.value:
                prev_status = order.status
                results.append(
                    BulkOrderActionResultItem(
                        order_id=oid,
                        success=False,
                        previous_status=prev_status,
                        current_status=prev_status,
                        message=f"Không thể xác nhận đơn hàng đang ở trạng thái '{prev_status}'. Chỉ xác nhận đơn 'PENDING'.",
                    )
                )
                continue

            # Chuyển trạng thái
            order.status = OrderStatus.PROCESSING.value
            order.updated_at = now_time

            # Nếu thanh toán là chuyển khoản QR (BANK_TRANSFER), đồng thời cập nhật thanh toán thành công
            if order.payment_method == PaymentMethod.BANK_TRANSFER.value and order.payment_status != PaymentStatus.PAID.value:
                order.payment_status = PaymentStatus.PAID.value
                order.payment_date = now_time

            log_desc = note.strip() if note and note.strip() else "Shop đã xác nhận đơn hàng và đang chuẩn bị hàng để giao đến bạn"
            self.repository.add_order_log(
                order_id=order.order_id,
                status=OrderStatus.PROCESSING.value,
                description=log_desc,
                user_id=admin_id,
            )

            success_count += 1
            results.append(
                BulkOrderActionResultItem(
                    order_id=oid,
                    success=True,
                    previous_status=OrderStatus.PENDING.value,
                    current_status=OrderStatus.PROCESSING.value,
                    message="Xác nhận đơn hàng thành công.",
                )
            )

        if success_count > 0:
            self.repository.commit()

        return BulkOrderActionResponse(
            total_requested=len(unique_order_ids),
            success_count=success_count,
            failure_count=len(unique_order_ids) - success_count,
            results=results,
        )

    def start_shipping_orders(
        self,
        admin_id: UUID,
        order_ids: list[str],
        note: str | None = None,
    ) -> BulkOrderActionResponse:
        """
        Admin chuyển trạng thái sang giao hàng (PROCESSING -> SHIPPING).
        Hỗ trợ danh sách 1 hoặc nhiều đơn hàng.
        - Ghi log vào order_logs.
        """
        results: list[BulkOrderActionResultItem] = []
        success_count = 0

        unique_order_ids = list(dict.fromkeys(order_ids))
        orders = self.repository.get_orders_by_ids(unique_order_ids, for_update=True)
        order_map = {o.order_id: o for o in orders}

        now_time = datetime.now(UTC)

        for oid in unique_order_ids:
            order = order_map.get(oid)
            if not order:
                results.append(
                    BulkOrderActionResultItem(
                        order_id=oid,
                        success=False,
                        message="Đơn hàng không tồn tại trong hệ thống.",
                    )
                )
                continue

            if order.status != OrderStatus.PROCESSING.value:
                prev_status = order.status
                results.append(
                    BulkOrderActionResultItem(
                        order_id=oid,
                        success=False,
                        previous_status=prev_status,
                        current_status=prev_status,
                        message=f"Không thể chuyển sang giao hàng cho đơn đang ở trạng thái '{prev_status}'. Chỉ áp dụng cho đơn 'PROCESSING'.",
                    )
                )
                continue

            order.status = OrderStatus.SHIPPING.value
            order.updated_at = now_time

            log_desc = note.strip() if note and note.strip() else "Đơn hàng bắt đầu vận chuyển"
            self.repository.add_order_log(
                order_id=order.order_id,
                status=OrderStatus.SHIPPING.value,
                description=log_desc,
                user_id=admin_id,
            )

            success_count += 1
            results.append(
                BulkOrderActionResultItem(
                    order_id=oid,
                    success=True,
                    previous_status=OrderStatus.PROCESSING.value,
                    current_status=OrderStatus.SHIPPING.value,
                    message="Chuyển đơn hàng sang trạng thái vận chuyển thành công.",
                )
            )

        if success_count > 0:
            self.repository.commit()

        return BulkOrderActionResponse(
            total_requested=len(unique_order_ids),
            success_count=success_count,
            failure_count=len(unique_order_ids) - success_count,
            results=results,
        )

    def complete_delivery_orders(
        self,
        admin_id: UUID,
        order_ids: list[str],
        note: str | None = None,
    ) -> BulkOrderActionResponse:
        """
        Admin xác nhận đơn hàng đã giao thành công (SHIPPING -> DELIVERED).
        Hỗ trợ danh sách 1 hoặc nhiều đơn hàng.
        - Tự động set delivered_at = now().
        - Nếu đơn là COD hoặc chưa thanh toán, tự động set payment_status = PAID.
        - Ghi log vào order_logs.
        """
        results: list[BulkOrderActionResultItem] = []
        success_count = 0

        unique_order_ids = list(dict.fromkeys(order_ids))
        orders = self.repository.get_orders_by_ids(unique_order_ids, for_update=True)
        order_map = {o.order_id: o for o in orders}

        now_time = datetime.now(UTC)

        for oid in unique_order_ids:
            order = order_map.get(oid)
            if not order:
                results.append(
                    BulkOrderActionResultItem(
                        order_id=oid,
                        success=False,
                        message="Đơn hàng không tồn tại trong hệ thống.",
                    )
                )
                continue

            if order.status != OrderStatus.SHIPPING.value:
                prev_status = order.status
                results.append(
                    BulkOrderActionResultItem(
                        order_id=oid,
                        success=False,
                        previous_status=prev_status,
                        current_status=prev_status,
                        message=f"Không thể xác nhận giao thành công cho đơn đang ở trạng thái '{prev_status}'. Chỉ áp dụng cho đơn 'SHIPPING'.",
                    )
                )
                continue

            order.status = OrderStatus.DELIVERED.value
            order.delivered_at = now_time
            order.updated_at = now_time

            # Đơn hàng COD hoặc chưa thanh toán được thanh toán khi nhận hàng
            if order.payment_status != PaymentStatus.PAID.value:
                order.payment_status = PaymentStatus.PAID.value
                order.payment_date = now_time

            log_desc = note.strip() if note and note.strip() else "Giao hàng thành công"
            self.repository.add_order_log(
                order_id=order.order_id,
                status=OrderStatus.DELIVERED.value,
                description=log_desc,
                user_id=admin_id,
            )

            success_count += 1
            results.append(
                BulkOrderActionResultItem(
                    order_id=oid,
                    success=True,
                    previous_status=OrderStatus.SHIPPING.value,
                    current_status=OrderStatus.DELIVERED.value,
                    message="Xác nhận giao hàng thành công.",
                )
            )

        if success_count > 0:
            self.repository.commit()

        return BulkOrderActionResponse(
            total_requested=len(unique_order_ids),
            success_count=success_count,
            failure_count=len(unique_order_ids) - success_count,
            results=results,
        )

    def admin_cancel_order(
        self,
        admin_id: UUID,
        order_id: str,
        request: AdminCancelOrderRequest,
        role_type: CancelledByType = CancelledByType.ADMIN,
    ) -> OrderActionResponse:
        """Admin / ShopOwner hủy đơn hàng với lý do chuẩn hóa theo catalog."""
        order = self.repository.get_admin_order_by_id(order_id=order_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        if order.status in {OrderStatus.COMPLETED.value, OrderStatus.CANCELLED.value}:
            raise AppException(
                status_code=409,
                message=f"Đơn hàng đang ở trạng thái '{order.status}', không thể thực hiện hủy.",
                error_code="INVALID_ORDER_STATE",
            )

        reason_code_str = request.reason_code.value
        reason_label = CANCEL_REASON_TEXT.get(reason_code_str, reason_code_str)

        custom_reason = (
            request.custom_reason.strip() if request.custom_reason is not None else ""
        )

        if request.reason_code == AdminCancelReason.OTHER:
            if not custom_reason:
                raise AppException(
                    status_code=400,
                    message="Vui lòng nhập ghi chú chi tiết khi chọn lý do OTHER.",
                    error_code="INVALID_REASON",
                )
            display_reason = f"Lý do khác: {custom_reason}"
            log_reason = f"[{reason_code_str}] Lý do khác: {custom_reason}"
        elif custom_reason:
            display_reason = f"{reason_label} (Ghi chú: {custom_reason})"
            log_reason = f"[{reason_code_str}] {reason_label} (Ghi chú: {custom_reason})"
        else:
            display_reason = reason_label
            log_reason = f"[{reason_code_str}] {reason_label}"

        self.repository.restore_inventory(order=order)

        cancelled_now = datetime.now(UTC)
        actor_name = (
            "Quản trị viên" if role_type == CancelledByType.ADMIN else "Chủ cửa hàng"
        )
        log_desc = (
            f"{actor_name} (ID: {admin_id}) hủy đơn hàng. Lý do: {log_reason}."
        )

        updated_order = self.repository.cancel_order_record(
            order=order,
            cancel_reason=display_reason,
            cancelled_by_type=role_type.value,
            cancelled_by_id=admin_id,
            cancelled_at=cancelled_now,
            log_description=log_desc,
        )

        return OrderActionResponse(
            order_id=updated_order.order_id,
            status=OrderStatus.CANCELLED,
            message=f"{actor_name} đã hủy đơn hàng thành công.",
            cancel_reason=updated_order.cancel_reason,
            cancelled_by_type=updated_order.cancelled_by_type,
            cancelled_at=updated_order.cancelled_at,
        )
