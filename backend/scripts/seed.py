from scripts.seed_categories import seed_categories
from scripts.seed_products import seed_products
from scripts.seed_roles import seed_roles
from scripts.seed_shipping_addresses import seed_shipping_addresses
from scripts.seed_users import seed_users
from scripts.seed_carts import seed_carts
from scripts.seed_shippers import seed_shippers
from scripts.seed_orders import seed_orders
from src.app.core.database import SessionLocal


def main():
    """Ham chay toan bo cac kich ban nap du lieu mau theo thu tu."""
    db = SessionLocal()

    try:
        print("Starting database seeding...")

        # 1. Nhom Vai tro & Nguoi dung
        seed_roles(db)
        seed_users(db)
        seed_shipping_addresses(db)

        # 2. Nhom Danh muc & San pham
        seed_categories(db)
        seed_products(db)

        # 3. Nhom Gio hang
        seed_carts(db)

        # 4. Nhom Van chuyen & Don hang
        seed_shippers(db)
        seed_orders(db)

        db.commit()
        print("Database seeded successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
