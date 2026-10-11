
from decimal import Decimal
from uuid import UUID

from fastapi import status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from src.app.core.exceptions import CustomException
from src.app.modules.carts.model import Cart, CartItem
from src.app.modules.carts.schema import (
    AddToCartRequest,
    CartItemResponse,
    CartResponse,
    DeleteMultipleCartItemsRequest,
    SyncCartRequest,
    UpdateCartItemRequest,
)
from src.app.modules.products.model import Product


class CartService:

    @classmethod
    def _get_or_create_cart(cls, db: Session, user_id: UUID) -> Cart:
        stmt = (
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(
                selectinload(Cart.cart_items).selectinload(CartItem.product)
            )
        )
        cart = db.scalar(stmt)

        if cart is None:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.flush()

        return cart

    @classmethod
    def _validate_and_get_product(
        cls,
        db: Session,
        product_id: int,
        requested_quantity: int,
    ) -> Product:
        product = db.get(Product, product_id)

        if product is None:
            raise CustomException(
                message="Sản phẩm không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if product.quantity < requested_quantity:
            raise CustomException(
                message=(
                    f"Sản phẩm '{product.product_name}' chỉ còn "
                    f"{product.quantity} sản phẩm trong kho"
                ),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return product

    @classmethod
    def _build_cart_response(cls, cart: Cart) -> CartResponse:
        items = []
        total_quantity = 0
        total_price = Decimal("0.00")

        for item in cart.cart_items:
            product = item.product
            unit_price = Decimal(str(product.price))
            subtotal = unit_price * item.quantity

            items.append(
                CartItemResponse(
                    cart_item_id=item.cart_item_id,
                    product_id=item.product_id,
                    product_name=product.product_name,
                    product_image=product.image_src,
                    unit_price=unit_price,
                    quantity=item.quantity,
                    subtotal=subtotal,
                    stock_quantity=product.quantity,
                )
            )

            total_quantity += item.quantity
            total_price += subtotal

        return CartResponse(
            cart_id=cart.cart_id,
            items=items,
            total_quantity=total_quantity,
            total_price=total_price,
        )

    @classmethod
    def get_user_cart(cls, db: Session, user_id: UUID) -> CartResponse:
        cart = cls._get_or_create_cart(db, user_id)

        try:
            db.commit()
        except Exception:
            db.rollback()
            raise

        stmt = (
            select(Cart)
            .where(Cart.cart_id == cart.cart_id)
            .options(
                selectinload(Cart.cart_items).selectinload(CartItem.product)
            )
        )
        cart = db.scalar(stmt)

        return cls._build_cart_response(cart)

    @classmethod
    def add_to_cart(
        cls,
        db: Session,
        user_id: UUID,
        payload: AddToCartRequest,
    ) -> CartResponse:
        try:
            cart = cls._get_or_create_cart(db, user_id)

            stmt = select(CartItem).where(
                CartItem.cart_id == cart.cart_id,
                CartItem.product_id == payload.product_id,
            )
            item = db.scalar(stmt)

            new_quantity = (item.quantity if item else 0) + payload.quantity

            cls._validate_and_get_product(
                db, payload.product_id, new_quantity
            )

            if item:
                item.quantity = new_quantity
            else:
                db.add(
                    CartItem(
                        cart_id=cart.cart_id,
                        product_id=payload.product_id,
                        quantity=payload.quantity,
                    )
                )

            db.commit()
        except Exception:
            db.rollback()
            raise

        return cls.get_user_cart(db, user_id)

    @classmethod
    def update_cart_item(
        cls,
        db: Session,
        user_id: UUID,
        cart_item_id: int,
        payload: UpdateCartItemRequest,
    ) -> CartResponse:
        try:
            cart = cls._get_or_create_cart(db, user_id)
            item = db.get(CartItem, cart_item_id)

            if item is None or item.cart_id != cart.cart_id:
                raise CustomException(
                    message="Sản phẩm không có trong giỏ hàng",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            cls._validate_and_get_product(
                db, item.product_id, payload.quantity
            )

            item.quantity = payload.quantity
            db.commit()
        except Exception:
            db.rollback()
            raise

        return cls.get_user_cart(db, user_id)

    @classmethod
    def delete_cart_item(
        cls,
        db: Session,
        user_id: UUID,
        cart_item_id: int,
    ) -> CartResponse:
        try:
            cart = cls._get_or_create_cart(db, user_id)
            item = db.get(CartItem, cart_item_id)

            if item is None or item.cart_id != cart.cart_id:
                raise CustomException(
                    message="Sản phẩm không có trong giỏ hàng",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            db.delete(item)
            db.commit()
        except Exception:
            db.rollback()
            raise

        return cls.get_user_cart(db, user_id)

    @classmethod
    def delete_multiple_cart_items(
        cls,
        db: Session,
        user_id: UUID,
        payload: DeleteMultipleCartItemsRequest,
    ) -> CartResponse:
        try:
            cart = cls._get_or_create_cart(db, user_id)
            ids = set(payload.cart_item_ids)

            stmt = select(CartItem.cart_item_id).where(
                CartItem.cart_id == cart.cart_id,
                CartItem.cart_item_id.in_(ids),
            )
            found_ids = set(db.scalars(stmt).all())

            if found_ids != ids:
                raise CustomException(
                    message="Một hoặc nhiều sản phẩm không thuộc giỏ hàng",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            db.execute(
                delete(CartItem).where(
                    CartItem.cart_id == cart.cart_id,
                    CartItem.cart_item_id.in_(ids),
                )
            )
            db.commit()
        except Exception:
            db.rollback()
            raise

        return cls.get_user_cart(db, user_id)

    @classmethod
    def sync_cart(
        cls,
        db: Session,
        user_id: UUID,
        payload: SyncCartRequest,
    ) -> CartResponse:
        try:
            cart = cls._get_or_create_cart(db, user_id)

            quantities: dict[int, int] = {}
            for item in payload.items:
                quantities[item.product_id] = (
                    quantities.get(item.product_id, 0) + item.quantity
                )

            # Kiểm tra tất cả sản phẩm trước khi thay đổi giỏ hàng.
            existing_items = {}
            for product_id, quantity in quantities.items():
                stmt = select(CartItem).where(
                    CartItem.cart_id == cart.cart_id,
                    CartItem.product_id == product_id,
                )
                existing = db.scalar(stmt)
                existing_items[product_id] = existing

                total = (existing.quantity if existing else 0) + quantity
                cls._validate_and_get_product(db, product_id, total)

            for product_id, quantity in quantities.items():
                existing = existing_items[product_id]

                if existing:
                    existing.quantity += quantity
                else:
                    db.add(
                        CartItem(
                            cart_id=cart.cart_id,
                            product_id=product_id,
                            quantity=quantity,
                        )
                    )

            db.commit()
        except Exception:
            db.rollback()
            raise

        return cls.get_user_cart(db, user_id)
