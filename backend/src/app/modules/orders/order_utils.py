from decimal import Decimal

from src.app.modules.emails.schema import EmailItemSummary
from src.app.modules.orders.model import Order


def get_order_address(order: Order) -> str:
    """Lấy địa chỉ giao hàng đầy đủ của đơn hàng, ghép từ các trường địa chỉ rời rạc."""
    return ", ".join(
        part.strip()
        for part in (
            order.shipping_address_line,
            order.shipping_ward_name,
            order.shipping_province_name,
        )
        if part and part.strip()
    )


def get_order_email_items(order: Order) -> list[EmailItemSummary]:
    """Build the product summary used by order notification emails."""
    items: list[EmailItemSummary] = []
    for detail in order.order_details:
        product_name = (
            detail.product.product_name
            if detail.product and detail.product.product_name
            else f"Sản phẩm #{detail.product_id}"
        )
        unit_price = Decimal(str(detail.price))
        items.append(
            EmailItemSummary(
                product_name=product_name,
                variant_info=None,
                quantity=detail.quantity,
                unit_price=unit_price,
                subtotal=unit_price * detail.quantity,
            )
        )
    return items
