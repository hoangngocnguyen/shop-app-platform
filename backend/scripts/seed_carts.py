from sqlalchemy.orm import Session
from scripts.seed_users import CUSTOMER_USER_ID
from src.app.modules.carts.model import Cart, CartItem


def seed_carts(db: Session) -> None:
    """Nap du lieu mau cho gio hang va chi tiet gio hang."""
    cart_data = {
        "cart_id": 1,
        "user_id": CUSTOMER_USER_ID,
    }
    db.merge(Cart(**cart_data))
    db.flush()

    cart_items_data = [
        {
            "cart_item_id": 1,
            "cart_id": 1,
            "product_id": 1,
            "quantity": 2,
        },
        {
            "cart_item_id": 2,
            "cart_id": 1,
            "product_id": 2,
            "quantity": 1,
        },
    ]

    for item in cart_items_data:
        db.merge(CartItem(**item))

    db.commit()
    print("-> Carts and CartItems seeded successfully.")
