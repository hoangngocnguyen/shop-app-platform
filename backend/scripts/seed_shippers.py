from sqlalchemy.orm import Session
from src.app.modules.shipper.model import Shipper


def seed_shippers(db: Session) -> None:
    """Nap du lieu mau cho cac don vi van chuyen (shipper)."""
    shippers_data = [
        {
            "shipper_id": 1,
            "name": "Giao Hàng Tiết Kiệm (GHTK)",
            "phone": "19006092",
            "status": "ACTIVE",
        },
        {
            "shipper_id": 2,
            "name": "Giao Hàng Nhanh (GHN)",
            "phone": "19006366",
            "status": "ACTIVE",
        },
        {
            "shipper_id": 3,
            "name": "Viettel Post",
            "phone": "19008095",
            "status": "ACTIVE",
        },
        {
            "shipper_id": 4,
            "name": "SPX Express",
            "phone": "19001221",
            "status": "ACTIVE",
        },
    ]

    for item in shippers_data:
        db.merge(Shipper(**item))

    db.commit()
    print("-> Shippers seeded successfully.")
