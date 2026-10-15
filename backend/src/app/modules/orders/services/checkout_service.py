"""
Business Logic Layer cho module Checkout và Reorder.
Xử lý tính toán giá bán, kiểm tra tồn kho, chuẩn bị phiên checkout Stateless
và hỗ trợ mua lại từ đơn hàng cũ.
"""

from decimal import Decimal
from uuid import UUID

from pydantic import HttpUrl

from src.app.core.exceptions import AppException, BadRequestException, NotFoundException
from src.app.modules.orders.enums.order_enums import CheckoutType
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.schemas.checkout_schema import (
    CheckoutItemResponse,
    CheckoutPreviewRequest,
    CheckoutPreviewResponse,
)
from src.app.modules.products.model import Product


class CheckoutService:
    """Service xử lý các nghiệp vụ kiểm tra và chuẩn bị dữ liệu thanh toán (Stateless)."""

    def __init__(self, repository: OrderRepository) -> None:
        self.repository = repository

    def _determine_effective_price(self, product: Product) -> Decimal:
        """
        Xác định đơn giá hiện tại từ Database:
        Ưu tiên giá khuyến mãi (sale_price) nếu có và lớn hơn 0,
        ngược lại lấy giá niêm yết (price).
        """
        if product.sale_price is not None and product.sale_price > Decimal("0.00"):
            return Decimal(str(product.sale_price))
        return Decimal(str(product.price))

    def _build_checkout_item(
        self, product: Product, quantity: int
    ) -> CheckoutItemResponse:
        """Chuyển đổi từ Model Product sang CheckoutItemResponse DTO."""
        effective_price = self._determine_effective_price(product)
        total_price = effective_price * quantity

        image_url = None
        if product.image_src and product.image_src.startswith(("http://", "https://")):
            image_url = HttpUrl(product.image_src)

        return CheckoutItemResponse(
            product_id=product.product_id,
            product_name=product.product_name,
            product_image=image_url,
            price=effective_price,
            quantity=quantity,
            total_price=total_price,
        )

    # ==========================================================================
    # 1. CHECKOUT PREVIEW (STATELESS)
    # ==========================================================================

    def preview_checkout(
        self, user_id: UUID, request: CheckoutPreviewRequest
    ) -> CheckoutPreviewResponse:
        """
        Kiểm tra tính hợp lệ của sản phẩm, tồn kho và đơn giá hiện tại.
        Trả về Snapshot cho Client mà không lưu session vào DB hay Redis.
        """
        checkout_items: list[CheckoutItemResponse] = []

        if request.checkout_type == CheckoutType.BUY_NOW:
            item_req = request.buy_now_item
            if not item_req:
                raise BadRequestException(
                    "buy_now_item là bắt buộc khi checkout_type là 'BUY_NOW'"
                )

            product = self.repository.get_product_by_id(item_req.product_id)
            if not product:
                raise NotFoundException("Sản phẩm", item_req.product_id)

            if product.quantity < item_req.quantity:
                raise AppException(
                    status_code=409,
                    message=f"Sản phẩm '{product.product_name}' không còn đủ số lượng tồn kho tại thời điểm xác nhận (hiện còn {product.quantity}).",
                    error_code="INSUFFICIENT_STOCK",
                )

            checkout_items.append(self._build_checkout_item(product, item_req.quantity))

        elif request.checkout_type == CheckoutType.CART:
            cart_ids = request.cart_item_ids or []
            if not cart_ids:
                raise BadRequestException(
                    "cart_item_ids không được rỗng khi checkout_type là 'CART'"
                )

            products = self.repository.get_products_by_ids(cart_ids)
            found_ids = {p.product_id for p in products}

            # Kiểm tra sản phẩm có tồn tại đầy đủ trong Database không
            for c_id in cart_ids:
                if c_id not in found_ids:
                    raise NotFoundException("Sản phẩm trong giỏ hàng", c_id)

            for product in products:
                if product.quantity < 1:
                    raise AppException(
                        status_code=409,
                        message=f"Sản phẩm '{product.product_name}' đã hết hàng trong kho.",
                        error_code="INSUFFICIENT_STOCK",
                    )
                checkout_items.append(self._build_checkout_item(product, quantity=1))

        subtotal = sum((item.total_price for item in checkout_items), Decimal("0.00"))

        return CheckoutPreviewResponse(
            items=checkout_items,
            subtotal=subtotal,
        )

    # ==========================================================================
    # 2. REORDER PAST ORDER (STATELESS SNAPSHOT)
    # ==========================================================================

    def reorder(self, user_id: UUID, order_id: str) -> CheckoutPreviewResponse:
        """
        Lấy thông tin các sản phẩm từ đơn hàng cũ để khởi tạo snapshot mua lại.
        Truy xuất đơn giá niêm yết mới nhất và kiểm tra tồn kho tại thời điểm hiện tại.
        """
        past_order = self.repository.get_order_by_id(order_id, user_id=user_id)
        if not past_order:
            raise NotFoundException("Đơn hàng", order_id)

        if not past_order.order_details:
            raise BadRequestException("Đơn hàng cũ không chứa sản phẩm nào.")

        product_ids = [d.product_id for d in past_order.order_details]
        current_products = {
            p.product_id: p for p in self.repository.get_products_by_ids(product_ids)
        }

        checkout_items: list[CheckoutItemResponse] = []
        for detail in past_order.order_details:
            product = current_products.get(detail.product_id)
            if not product:
                raise NotFoundException("Sản phẩm trong đơn hàng cũ", detail.product_id)

            if product.quantity < detail.quantity:
                raise AppException(
                    status_code=409,
                    message=f"Sản phẩm '{product.product_name}' không còn đủ tồn kho "
                    f"(yêu cầu {detail.quantity}, hiện có {product.quantity}).",
                    error_code="INSUFFICIENT_STOCK",
                )

            checkout_items.append(self._build_checkout_item(product, detail.quantity))

        subtotal = sum((item.total_price for item in checkout_items), Decimal("0.00"))

        return CheckoutPreviewResponse(
            items=checkout_items,
            subtotal=subtotal,
        )
