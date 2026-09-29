from pathlib import Path

from sqlalchemy import text
from sqlalchemy.orm import Session


def seed_locations(db: Session) -> None:
    """Nạp dữ liệu từ file administrative_data.sql."""
    sql_file_path = Path(__file__).resolve().parent / "administrative_data.sql"

    print(f"-> Executing {sql_file_path}...")

    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Chạy toàn bộ nội dung SQL xuống database
    db.execute(text(sql_content))
    db.commit()

    print("-> Locations seeded successfully.")
