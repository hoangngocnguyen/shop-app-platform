"""
Business Logic Layer cho module Quản lý Đơn hàng (Order Management).
Chịu trách nhiệm tạo đơn hàng, lấy lịch sử phân trang, chi tiết đơn hàng
và quản lý vòng đời đơn hàng (Xác nhận nhận hàng, Hủy đơn kèm Reason Catalog & Người hủy).
"""

import random
import string
from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import HttpUrl

from src.app.core.exceptions import AppException, BadRequestException, NotFoundException
from src.app.core.pagination import PaginatedResponse, paginate_list
from src.app.modules.orders.enums.order_enums import (
    CANCEL_REASON_TEXT,
    CancelledByType,
    CustomerCancelReason,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from src.app.modules.orders.model import Order, OrderDetail
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.checkout_schema import CheckoutItemResponse
from src.app.modules.orders.schemas.order_requests import (
    CancelOrderRequest,
    CreateOrderRequest,
    SystemCancelOrderRequest,
)
from src.app.modules.orders.schemas.order_responses import (
    OrderActionResponse,
    OrderCreateResponse,
    OrderDetailResponse,
    OrderItemSummaryResponse,
    OrderListResponse,
    OrderLogResponse,
    OrderSummaryResponse,
)
from src.app.modules.products.model import Product


class OrderService:
    """Service xử lý toàn bộ logic nghiệp vụ đơn hàng theo chuẩn API."""

    def __init__(self, repository: OrderRepository) -> None:
        self.repository = repository
        self.order_repository = repository

    def _generate_order_id(self) -> str:
        """Tạo mã định danh đơn hàng theo múi giờ Việt Nam, có dạng OD<yyMMddHHmmss><6 ký tự ngẫu nhiên>."""
        vietnam_tz = ZoneInfo("Asia/Ho_Chi_Minh")
        alphabet = string.ascii_uppercase + string.digits

        while True:
            timestamp = datetime.now(vietnam_tz).strftime("%y%m%d%H%M%S")
            random_suffix = "".join(random.choice(alphabet) for _ in range(6))
            order_id = f"OD{timestamp}{random_suffix}"

            if not self.order_repository.exists_by_id(order_id):
                return order_id

    def _determine_effective_price(self, product: Product) -> Decimal:
        """Lấy đơn giá hiện tại từ DB (ưu tiên sale_price > 0, ngược lại price)."""
        if product.sale_price is not None and product.sale_price > Decimal("0.00"):
            return Decimal(str(product.sale_price))
        return Decimal(str(product.price))

    # ==========================================================================
    # 1. CREATE ORDER (POST /api/v1/orders)
    # ==========================================================================

    def create_order(
        self,
        user_id: UUID,
        request: CreateOrderRequest,
        shipping_fee: Decimal = Decimal("30000.00"),
    ) -> OrderCreateResponse:
        """
        Tạo đơn hàng chính thức từ snapshot checkout:
        - Kiểm tra địa chỉ giao hàng hợp lệ thuộc user.
        - Kiểm tra chéo tồn kho và đơn giá hiện tại trong Database.
        - Trừ tồn kho và ghi nhận DB trong cùng một transaction.
        """
        self.repository.begin()
        try:
            # 1. Kiểm tra địa chỉ giao hàng
            address = self.repository.get_shipping_address(
                address_id=request.address_id, user_id=user_id
            )
            if not address:
                raise NotFoundException("Địa chỉ giao hàng", request.address_id)

            # 2. Kiểm tra trùng lặp sản phẩm trong request
            requested: dict[int, tuple[int, Decimal]] = {}
            for item in request.items:
                if item.product_id in requested:
                    raise BadRequestException(
                        f"Không được lặp product_id {item.product_id} trong danh sách items."
                    )
                requested[item.product_id] = (item.quantity, item.price)

            # 3. Kiểm tra chéo tồn kho và đơn giá hiện tại trong DB
            order_details: list[OrderDetail] = []
            subtotal = Decimal("0.00")

            for product_id, (qty, snapshot_price) in requested.items():
                product = self.repository.get_product_by_id(product_id, for_update=True)
                if not product:
                    raise NotFoundException("Sản phẩm", product_id)

                # 409 Conflict: Tồn kho thay đổi
                if product.quantity < qty:
                    raise AppException(
                        status_code=409,
                        message=(
                            f"Sản phẩm '{product.product_name}' không còn đủ số lượng tồn kho "
                            f"tại thời điểm xác nhận tạo đơn hàng (còn {product.quantity}, yêu cầu {qty})."
                        ),
                        error_code="INSUFFICIENT_STOCK",
                    )

                current_unit_price = self._determine_effective_price(product)

                # 409 Conflict: Giá thay đổi
                if current_unit_price != snapshot_price:
                    raise AppException(
                        status_code=409,
                        message=(
                            f"Đơn giá hiện tại trên Database của sản phẩm '{product.product_name}' "
                            f"({current_unit_price}) khác với giá trong snapshot checkout ({snapshot_price})."
                        ),
                        error_code="PRICE_CHANGED",
                        errors={
                            "product_id": str(product_id),
                            "current_price": str(current_unit_price),
                        },
                    )

                subtotal += current_unit_price * qty
                order_details.append(
                    OrderDetail(
                        product_id=product_id,
                        quantity=qty,
                        price=current_unit_price,
                    )
                )

            # Đối chiếu tổng tiền dự kiến
            if subtotal != request.expected_subtotal:
                raise AppException(
                    status_code=409,
                    message="Tổng tiền hàng hiện tại khác với snapshot checkout.",
                    error_code="PRICE_CHANGED",
                    errors={
                        "expected_subtotal": str(request.expected_subtotal),
                        "actual_subtotal": str(subtotal),
                    },
                )

            # 4. Trừ kho
            for product_id, (qty, _) in requested.items():
                self.repository.deduct_inventory(product_id=product_id, quantity=qty)

            # 5. Tạo Order chính thức
            total_amount = subtotal + shipping_fee
            new_order_id = self._generate_order_id()
            new_order = Order(
                order_id=new_order_id,
                user_id=user_id,
                order_date=datetime.now(UTC),
                status=OrderStatus.PENDING.value,
                total=total_amount,
                address_id=address.id,
                shipping_recipient_name=address.recipient_name,
                shipping_phone=address.phone,
                shipping_province_code=address.province_code,
                shipping_province_name=address.province_name or "",
                shipping_ward_code=address.ward_code,
                shipping_ward_name=address.ward_name or "",
                shipping_address_line=address.address_line,
                payment_method=request.payment_method.value,
                payment_status=PaymentStatus.PENDING.value,
                payment_date=None,
                delivered_at=None,
                return_period_day=7,
                note=request.note,
                cancel_reason=None,
                cancelled_by_type=None,
                cancelled_by_id=None,
                cancelled_at=None,
            )

            initial_note = "Đơn hàng đã được tạo thành công"
            if request.note:
                initial_note += f" (Ghi chú: {request.note})"

            created_order = self.repository.create_order(
                order=new_order,
                items=order_details,
                log_description=initial_note,
            )

            return OrderCreateResponse(
                order_id=created_order.order_id,
                payment_method=created_order.payment_method,
                total=Decimal(str(created_order.total)),
                status=OrderStatus(created_order.status),
            )
        except Exception:
            self.repository.rollback()
            raise

    # ==========================================================================
    # 2. GET ORDER LIST (GET /api/v1/orders)
    # ==========================================================================

    def get_orders(
        self,
        user_id: UUID,
        order_status: OrderStatus | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> PaginatedResponse[OrderSummaryResponse]:
        """Lấy danh sách lịch sử đơn hàng của người dùng hiện tại (hỗ trợ phân trang và lọc)."""
        status_val = order_status.value if order_status else None
        orders, total_items, total_pages = self.repository.get_user_orders_paginated(
            user_id=user_id,
            status=status_val,
            search=search,
            page=page,
            page_size=page_size,
        )

        summary_items: list[OrderSummaryResponse] = []
        for o in orders:
            order_items: list[OrderItemSummaryResponse] = []
            total_qty = 0
            for d in o.order_details:
                total_qty += d.quantity
                p = d.product
                p_name = p.product_name if p else f"Sản phẩm #{d.product_id}"
                img_url = None
                if (
                    p
                    and p.image_src
                    and p.image_src.startswith(("http://", "https://"))
                ):
                    img_url = HttpUrl(p.image_src)

                price_dec = Decimal(str(d.price))
                item_total_price = price_dec * d.quantity

                # Giá gốc (giá niêm yết cũ) hiển thị gạch ngang nếu có giảm giá
                orig_price = None
                if p and p.price is not None:
                    prod_price = Decimal(str(p.price))
                    if prod_price > price_dec:
                        orig_price = prod_price

                order_items.append(
                    OrderItemSummaryResponse(
                        product_id=d.product_id,
                        product_name=p_name,
                        product_image=img_url,
                        original_price=orig_price,
                        price=price_dec,
                        quantity=d.quantity,
                        total_price=item_total_price,
                    )
                )

            payment_method_enum = PaymentMethod.COD
            if (
                o.payment_method
                and o.payment_method in PaymentMethod._value2member_map_
            ):
                payment_method_enum = PaymentMethod(o.payment_method)

            payment_status_enum = PaymentStatus.PENDING
            if (
                o.payment_status
                and o.payment_status in PaymentStatus._value2member_map_
            ):
                payment_status_enum = PaymentStatus(o.payment_status)

            status_enum = OrderStatus.PENDING
            if o.status and o.status in OrderStatus._value2member_map_:
                status_enum = OrderStatus(o.status)

            summary_items.append(
                OrderSummaryResponse(
                    order_id=o.order_id,
                    status=status_enum,
                    payment_method=payment_method_enum,
                    payment_status=payment_status_enum,
                    total_amount=Decimal(str(o.total)),
                    total_items=total_qty,
                    created_at=o.order_date,
                    cancel_reason=o.cancel_reason,
                    cancelled_by_type=o.cancelled_by_type,
                    cancelled_at=o.cancelled_at,
                    items=order_items,
                )
            )

        return paginate_list(
            items=summary_items,
            total=total_items,
            page=page,
            page_size=page_size,
        )

    # ==========================================================================
    # 3. GET ORDER DETAIL (GET /api/v1/orders/{order_id})
    # ==========================================================================

    def get_order_detail(self, user_id: UUID, order_id: str) -> OrderDetailResponse:
        """Xem chi tiết đơn hàng, snapshot địa chỉ, sản phẩm, nhật ký trạng thái và thông tin hủy đơn."""
        order = self.repository.get_order_by_id(order_id=order_id, user_id=user_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        items_response: list[CheckoutItemResponse] = []
        subtotal = Decimal("0.00")
        for detail in order.order_details:
            p = detail.product
            img_url = None
            p_name = p.product_name if p else f"Sản phẩm #{detail.product_id}"
            if p and p.image_src and p.image_src.startswith(("http://", "https://")):
                img_url = HttpUrl(p.image_src)

            price_dec = Decimal(str(detail.price))
            total_item_price = price_dec * detail.quantity
            subtotal += total_item_price

            items_response.append(
                CheckoutItemResponse(
                    product_id=detail.product_id,
                    product_name=p_name,
                    product_image=img_url,
                    price=price_dec,
                    quantity=detail.quantity,
                    total_price=total_item_price,
                )
            )

        logs_response: list[OrderLogResponse] = []
        for log in sorted(order.order_logs, key=lambda l: l.log_date):
            log_status = OrderStatus.PENDING
            if log.status and log.status in OrderStatus._value2member_map_:
                log_status = OrderStatus(log.status)

            logs_response.append(
                OrderLogResponse(
                    status=log_status,
                    note=log.description,
                    timestamp=log.log_date,
                )
            )

        shipping_fee = max(Decimal("0.00"), Decimal(str(order.total)) - subtotal)

        payment_status_enum = PaymentStatus.PENDING
        if (
            order.payment_status
            and order.payment_status in PaymentStatus._value2member_map_
        ):
            payment_status_enum = PaymentStatus(order.payment_status)

        payment_method_enum = PaymentMethod.COD
        if (
            order.payment_method
            and order.payment_method in PaymentMethod._value2member_map_
        ):
            payment_method_enum = PaymentMethod(order.payment_method)

        return OrderDetailResponse(
            order_id=order.order_id,
            user_id=order.user_id,
            payment_method=payment_method_enum,
            payment_status=payment_status_enum,
            status=OrderStatus(order.status),
            address_id=order.address_id,
            shipping_recipient_name=order.shipping_recipient_name,
            shipping_phone=order.shipping_phone,
            shipping_province_name=order.shipping_province_name,
            shipping_ward_name=order.shipping_ward_name,
            shipping_address_line=order.shipping_address_line,
            note=order.note,
            order_details=items_response,
            order_logs=logs_response,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total_amount=Decimal(str(order.total)),
            created_at=order.order_date,
            estimated_delivery_date=order.estimated_delivery_date,
            delivered_at=order.delivered_at,
            cancel_reason=order.cancel_reason,
            cancelled_by_type=order.cancelled_by_type,
            cancelled_by_id=order.cancelled_by_id,
            cancelled_at=order.cancelled_at,
        )

    # ==========================================================================
    # 4. COMPLETE ORDER (PATCH /api/v1/orders/{order_id}/complete)
    # ==========================================================================

    def complete_order(self, user_id: UUID, order_id: str) -> OrderActionResponse:
        """Xác nhận đã nhận hàng (Chuyển sang COMPLETED)."""
        order = self.repository.get_order_by_id(order_id=order_id, user_id=user_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        # Cho phép hoàn thành khi đơn hàng đã giao hàng (DELIVERED) hoặc đang giao (SHIPPING)
        if order.status not in {
            OrderStatus.DELIVERED.value,
            OrderStatus.SHIPPING.value,
        }:
            raise AppException(
                status_code=409,
                message=(
                    f"Chỉ có thể xác nhận hoàn thành khi đơn hàng đang ở trạng thái 'DELIVERED'. "
                    f"Trạng thái hiện tại: '{order.status}'."
                ),
                error_code="INVALID_ORDER_STATE",
            )

        now = datetime.now(UTC)
        updated_order = self.repository.update_order_status(
            order=order,
            new_status=OrderStatus.COMPLETED.value,
            description="Người dùng xác nhận đã nhận hàng thành công.",
            completed_date=now,
        )

        return OrderActionResponse(
            order_id=updated_order.order_id,
            status=OrderStatus.COMPLETED,
            message="Xác nhận nhận hàng thành công. Trạng thái đơn hàng đã được chuyển sang COMPLETED.",
        )

    # ==========================================================================
    # 5. CANCEL ORDER (PATCH /api/v1/orders/{order_id}/cancel) - CUSTOMER
    # ==========================================================================

    def cancel_order(
        self,
        user_id: UUID,
        order_id: str,
        request: CancelOrderRequest,
    ) -> OrderActionResponse:
        """
        Khách hàng hủy đơn hàng (CUSTOMER):
        - Kiểm tra quyền sở hữu đơn hàng của user_id.
        - Kiểm tra trạng thái: chỉ cho phép hủy khi ở PENDING hoặc PROCESSING.
        - Kiểm tra trạng thái thanh toán: nếu đã thanh toán (PAID) thì không cho hủy trực tiếp.
        - Xây dựng nội dung cancel_reason chuẩn hóa dựa theo catalog và ghi chú.
        - Hoàn trả lại tồn kho vào bảng sản phẩm.
        - Ghi nhận cancel_reason, cancelled_by_type='CUSTOMER', cancelled_by_id=user_id, cancelled_at=now.
        - Ghi nhật ký vào order_logs.
        """
        order = self.repository.get_order_by_id(order_id=order_id, user_id=user_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        cancellable_statuses = {
            OrderStatus.PENDING.value,
            OrderStatus.PROCESSING.value,
        }
        if order.status not in cancellable_statuses:
            raise AppException(
                status_code=409,
                message=(
                    f"Không thể hủy đơn hàng ở trạng thái '{order.status}'. "
                    "Hệ thống chỉ cho phép hủy đơn khi đơn ở trạng thái PENDING hoặc PROCESSING."
                ),
                error_code="INVALID_ORDER_STATE",
            )

        if order.payment_status == PaymentStatus.PAID.value:
            raise AppException(
                status_code=409,
                message="Đơn hàng đã thanh toán thành công, không thể hủy trực tiếp. Vui lòng liên hệ CSKH để xử lý hoàn tiền.",
                error_code="INVALID_ORDER_STATE",
            )

        # Tách display_reason (lưu vào cancel_reason - hiển thị cho user/FE)
        # và log_reason (đầy đủ mã + chi tiết - audit trail nội bộ)
        reason_code_str = request.reason_code.value
        reason_label = CANCEL_REASON_TEXT.get(reason_code_str, reason_code_str)

        custom_reason = (
            request.custom_reason.strip() if request.custom_reason is not None else ""
        )

        if request.reason_code == CustomerCancelReason.OTHER:
            display_reason = f"Lý do khác: {custom_reason}" if custom_reason else "Lý do khác"
            log_reason = f"[{reason_code_str}] Lý do khác: {custom_reason}"
        elif custom_reason:
            display_reason = f"{reason_label} ({custom_reason})"
            log_reason = f"[{reason_code_str}] {reason_label} (Chi tiết: {custom_reason})"
        else:
            display_reason = reason_label
            log_reason = f"[{reason_code_str}] {reason_label}"

        # 1. Hoàn trả tồn kho cho các sản phẩm trong đơn
        self.repository.restore_inventory(order=order)

        # 2. Cập nhật trạng thái và thông tin hủy
        # cancel_reason lưu display_reason sạch cho FE; log_desc đầy đủ cho audit/admin
        cancelled_now = datetime.now(UTC)
        log_desc = f"Khách hàng hủy đơn hàng. Lý do: {log_reason}. Tồn kho đã được hoàn trả."

        updated_order = self.repository.cancel_order_record(
            order=order,
            cancel_reason=display_reason,
            cancelled_by_type=CancelledByType.CUSTOMER.value,
            cancelled_by_id=user_id,
            cancelled_at=cancelled_now,
            log_description=log_desc,
        )

        return OrderActionResponse(
            order_id=updated_order.order_id,
            status=OrderStatus.CANCELLED,
            message="Hủy đơn hàng thành công và hệ thống đã tự động hoàn trả tồn kho tương ứng.",
            cancel_reason=updated_order.cancel_reason,
            cancelled_by_type=updated_order.cancelled_by_type,
            cancelled_at=updated_order.cancelled_at,
        )

    # ==========================================================================
    # 6. SYSTEM AUTO-CANCEL ORDER
    # ==========================================================================

    def system_cancel_order(
        self,
        order_id: str,
        request: SystemCancelOrderRequest,
    ) -> OrderActionResponse:
        """
        Hệ thống tự động hủy đơn hàng (SYSTEM):
        - Hỗ trợ các mã lý do: PAYMENT_TIMEOUT, CONFIRMATION_TIMEOUT.
        - cancelled_by_id sẽ là None vì hành động do hệ thống tự động thực hiện.
        """
        order = self.repository.get_order_by_id(order_id=order_id)
        if not order:
            raise NotFoundException("Đơn hàng", order_id)

        if order.status in {OrderStatus.COMPLETED.value, OrderStatus.CANCELLED.value}:
            return OrderActionResponse(
                order_id=order.order_id,
                status=OrderStatus(order.status),
                message="Đơn hàng đã kết thúc trước đó, bỏ qua hủy tự động.",
            )

        reason_code_str = request.reason_code.value
        reason_label = CANCEL_REASON_TEXT.get(reason_code_str, reason_code_str)

        note = request.note.strip() if request.note is not None else ""

        if note:
            display_reason = f"{reason_label} ({note})"
            log_reason = f"[{reason_code_str}] {reason_label} ({note})"
        else:
            display_reason = reason_label
            log_reason = f"[{reason_code_str}] {reason_label}"

        # Hoàn tồn kho
        self.repository.restore_inventory(order=order)

        cancelled_now = datetime.now(UTC)
        log_desc = f"Hệ thống tự động hủy đơn hàng. Lý do: {log_reason}."

        updated_order = self.repository.cancel_order_record(
            order=order,
            cancel_reason=display_reason,
            cancelled_by_type=CancelledByType.SYSTEM.value,
            cancelled_by_id=None,
            cancelled_at=cancelled_now,
            log_description=log_desc,
        )

        return OrderActionResponse(
            order_id=updated_order.order_id,
            status=OrderStatus.CANCELLED,
            message="Hệ thống đã tự động hủy đơn hàng.",
            cancel_reason=updated_order.cancel_reason,
            cancelled_by_type=updated_order.cancelled_by_type,
            cancelled_at=updated_order.cancelled_at,
        )
