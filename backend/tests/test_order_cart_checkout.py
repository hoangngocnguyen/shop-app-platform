from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from src.app.core.database import Base
from src.app.core.exceptions import AppException, NotFoundException
from src.app.modules.carts.model import Cart, CartItem
from src.app.modules.orders.enums.order_enums import CheckoutType
from src.app.modules.orders.schemas.checkout_schema import CheckoutPreviewRequest
from src.app.modules.orders.schemas.order_requests import CreateOrderRequest
from src.app.modules.orders.repositories.repository import OrderRepository
from src.app.modules.orders.services.checkout_service import CheckoutService
from src.app.modules.orders.services.order_service import OrderService
from src.app.modules.users.model import User  # noqa: F401 - registers Order relationship


class CheckoutRepository:
    def __init__(self, product, cart_items):
        self.product = product
        self.cart_items = cart_items

    def get_product_by_id(self, product_id):
        return self.product if self.product.product_id == product_id else None

    def get_cart_items_for_user(self, user_id, cart_item_ids):
        return [
            item
            for item in self.cart_items
            if item.cart_item_id in cart_item_ids
        ]


class FakeOrderRepository:
    def __init__(self, user_id, product, cart_items, delete_count=None):
        self.user_id = user_id
        self.product = product
        self.cart_items = cart_items
        self.delete_count = delete_count
        self.deleted_ids = []
        self.committed = False
        self.rolled_back = False
        self.order = None

    def begin(self):
        pass

    def get_shipping_address(self, address_id, user_id):
        if user_id != self.user_id or address_id != 9:
            return None
        return SimpleNamespace(
            id=9,
            recipient_name="Nguyễn An",
            phone="0900000000",
            province_code="79",
            province_name="TP Hồ Chí Minh",
            ward_code="1",
            ward_name="Phường 1",
            address_line="1 Đường A",
        )

    def get_cart_items_for_user(self, user_id, cart_item_ids, for_update=False):
        assert user_id == self.user_id
        assert for_update is True
        return [item for item in self.cart_items if item.cart_item_id in cart_item_ids]

    def get_product_by_id(self, product_id, for_update=False):
        assert for_update is True
        return self.product if self.product.product_id == product_id else None

    def deduct_inventory(self, product_id, quantity):
        self.product.quantity -= quantity
        self.product.sold += quantity

    def exists_by_id(self, order_id):
        return False

    def create_order(self, order, items, log_description):
        self.order = order
        order.order_details = items
        return order

    def delete_cart_items_for_user(self, user_id, cart_item_ids):
        assert user_id == self.user_id
        self.deleted_ids = list(cart_item_ids)
        if self.delete_count is not None:
            return self.delete_count
        return len(cart_item_ids)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True


def make_product():
    return SimpleNamespace(
        product_id=101,
        product_name="Sản phẩm thử",
        image_src=None,
        quantity=8,
        sold=2,
        price=Decimal("100000.00"),
        sale_price=None,
    )


def make_cart_item(cart_item_id=31, quantity=2, product=None):
    return SimpleNamespace(
        cart_item_id=cart_item_id,
        product_id=101,
        quantity=quantity,
        product=product or make_product(),
    )


def make_order_request(**overrides):
    values = {
        "items": [{"product_id": 101, "quantity": 2, "price": "100000.00"}],
        "expected_subtotal": "200000.00",
        "address_id": 9,
        "payment_method": "COD",
        "checkout_type": "CART",
        "cart_item_ids": [31],
    }
    values.update(overrides)
    return CreateOrderRequest(**values)


def test_cart_preview_returns_verified_cart_item_ids():
    user_id = uuid4()
    product = make_product()
    repo = CheckoutRepository(product, [make_cart_item(product=product)])
    request = CheckoutPreviewRequest(
        checkout_type=CheckoutType.CART,
        cart_item_ids=[31],
    )

    response = CheckoutService(repo).preview_checkout(user_id, request)

    assert response.checkout_type == CheckoutType.CART
    assert response.cart_item_ids == [31]
    assert response.items[0].product_id == 101
    assert response.items[0].quantity == 2


def test_buy_now_preview_does_not_include_cart_items():
    product = make_product()
    repo = CheckoutRepository(product, [])
    request = CheckoutPreviewRequest(
        checkout_type=CheckoutType.BUY_NOW,
        buy_now_item={"product_id": 101, "quantity": 1},
    )

    response = CheckoutService(repo).preview_checkout(uuid4(), request)

    assert response.checkout_type == CheckoutType.BUY_NOW
    assert response.cart_item_ids == []


def test_create_order_removes_selected_cart_rows_before_commit():
    user_id = uuid4()
    repo = FakeOrderRepository(user_id, make_product(), [make_cart_item()])

    response = OrderService(repo).create_order(user_id, make_order_request())

    assert response.order_id == repo.order.order_id
    assert repo.deleted_ids == [31]
    assert repo.committed is True
    assert repo.rolled_back is False
    assert repo.product.quantity == 6


def test_create_order_rejects_cart_content_mismatch_and_rolls_back():
    user_id = uuid4()
    repo = FakeOrderRepository(user_id, make_product(), [make_cart_item(quantity=3)])

    with pytest.raises(AppException) as error:
        OrderService(repo).create_order(user_id, make_order_request())

    assert error.value.error_code == "CART_CHANGED"
    assert repo.committed is False
    assert repo.rolled_back is True
    assert repo.deleted_ids == []


def test_create_order_rolls_back_if_cart_delete_did_not_remove_all_rows():
    user_id = uuid4()
    repo = FakeOrderRepository(
        user_id,
        make_product(),
        [make_cart_item()],
        delete_count=0,
    )

    with pytest.raises(AppException) as error:
        OrderService(repo).create_order(user_id, make_order_request())

    assert error.value.error_code == "CART_CHANGED"
    assert repo.committed is False
    assert repo.rolled_back is True


def test_create_order_request_requires_unique_cart_item_ids_for_cart():
    with pytest.raises(ValidationError):
        make_order_request(cart_item_ids=[])

    with pytest.raises(ValidationError):
        make_order_request(cart_item_ids=[31, 31])

    assert make_order_request(
        checkout_type="BUY_NOW",
        cart_item_ids=None,
    ).checkout_type == CheckoutType.BUY_NOW


def test_create_order_rejects_cart_item_owned_by_another_user():
    user_id = uuid4()
    repo = FakeOrderRepository(uuid4(), make_product(), [make_cart_item()])

    with pytest.raises(NotFoundException):
        OrderService(repo).create_order(user_id, make_order_request())

    assert repo.committed is False
    assert repo.rolled_back is True


def test_repository_deletes_only_owned_cart_rows_and_supports_rollback():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(
        engine,
        tables=[Cart.__table__, CartItem.__table__],
    )

    owner_cart = Cart(user_id=uuid4())
    other_cart = Cart(user_id=uuid4())
    with Session(engine) as session:
        session.add_all([owner_cart, other_cart])
        session.flush()
        owner_item = CartItem(
            cart_id=owner_cart.cart_id,
            product_id=101,
            quantity=1,
        )
        unselected_item = CartItem(
            cart_id=owner_cart.cart_id,
            product_id=103,
            quantity=1,
        )
        other_item = CartItem(
            cart_id=other_cart.cart_id,
            product_id=102,
            quantity=1,
        )
        session.add_all([owner_item, unselected_item, other_item])
        session.flush()
        session.commit()

        removed = OrderRepository(session).delete_cart_items_for_user(
            owner_cart.user_id,
            [owner_item.cart_item_id, other_item.cart_item_id],
        )
        assert removed == 1

        session.rollback()
        remaining_ids = set(session.scalars(select(CartItem.cart_item_id)).all())
        assert remaining_ids == {
            owner_item.cart_item_id,
            unselected_item.cart_item_id,
            other_item.cart_item_id,
        }

        removed = OrderRepository(session).delete_cart_items_for_user(
            owner_cart.user_id,
            [owner_item.cart_item_id],
        )
        session.commit()
        remaining_ids = set(session.scalars(select(CartItem.cart_item_id)).all())
        assert removed == 1
        assert remaining_ids == {unselected_item.cart_item_id, other_item.cart_item_id}

    engine.dispose()
