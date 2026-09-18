from scripts.seed_categories import seed_categories
from scripts.seed_products import seed_products
from src.app.core.database import SessionLocal


def main():
    db = SessionLocal()

    try:
        seed_categories(db)
        seed_products(db)

        db.commit()

        print("Database seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
