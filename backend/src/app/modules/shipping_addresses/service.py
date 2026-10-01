from uuid import UUID

from fastapi import status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload

from src.app.core.exceptions import CustomException
from src.app.modules.locations.service import LocationService
from src.app.modules.shipping_addresses.model import ShippingAddress
from src.app.modules.shipping_addresses.schema import (
    ShippingAddressCreate,
    ShippingAddressUpdate,
)


class ShippingAddressService:
    @staticmethod
    def _unset_other_defaults(
        db: Session, user_id: UUID, exclude_id: int | None = None
    ) -> None:
        """Hàm hỗ trợ: Bỏ chọn địa chỉ mặc định cũ của user."""
        stmt = (
            update(ShippingAddress)
            .where(ShippingAddress.user_id == user_id)
            .where(ShippingAddress.is_default.is_(True))
        )
        if exclude_id:
            stmt = stmt.where(ShippingAddress.id != exclude_id)

        stmt = stmt.values(is_default=False)
        db.execute(stmt)

    @classmethod
    def get_user_addresses(cls, db: Session, user_id: UUID) -> list[ShippingAddress]:
        """
        Lấy danh sách địa chỉ giao hàng của User.
        Tự động JOIN lấy Province & Ward nhờ lazy="joined" trên Model.
        """
        stmt = (
            select(ShippingAddress)
            .options(
                joinedload(ShippingAddress.province), joinedload(ShippingAddress.ward)
            )
            .where(ShippingAddress.user_id == user_id)
            .order_by(ShippingAddress.is_default.desc(), ShippingAddress.id.desc())
        )

        return list(db.scalars(stmt).all())

    @classmethod
    def get_address_by_id(
        cls, db: Session, address_id: int, user_id: UUID
    ) -> ShippingAddress:
        """Lấy chi tiết 1 địa chỉ theo ID và kiểm tra quyền sở hữu."""
        address = db.get(ShippingAddress, address_id)
        if not address:
            raise CustomException(
                message="Địa chỉ giao hàng không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if address.user_id != user_id:
            raise CustomException(
                message="Bạn không có quyền truy cập địa chỉ này",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        return address

    @classmethod
    def create_address(
        cls, db: Session, user_id: UUID, payload: ShippingAddressCreate
    ) -> ShippingAddress:
        """Tạo địa chỉ giao hàng mới."""
        # 1. Validate mã Tỉnh/Thành và Phường/Xã
        LocationService.validate_address(
            db=db,
            province_code=payload.province_code,
            ward_code=payload.ward_code,
        )

        # 2. Xử lý cờ is_default
        existing_count = (
            db.query(ShippingAddress).filter(ShippingAddress.user_id == user_id).count()
        )

        is_default = payload.is_default
        if existing_count == 0:
            # Địa chỉ đầu tiên luôn là mặc định
            is_default = True
        elif is_default:
            # Nếu đặt làm mặc định thì gỡ mặc định các địa chỉ khác
            cls._unset_other_defaults(db=db, user_id=user_id)

        # 3. Khởi tạo đối tượng ORM
        new_address = ShippingAddress(
            user_id=user_id,
            recipient_name=payload.recipient_name,
            phone=payload.phone,
            province_code=payload.province_code,
            ward_code=payload.ward_code,
            address_line=payload.address_line,
            is_default=is_default,
        )
        db.add(new_address)
        db.commit()
        db.refresh(new_address)

        return new_address

    @classmethod
    def update_address(
        cls,
        db: Session,
        address_id: int,
        user_id: UUID,
        payload: ShippingAddressUpdate,
    ) -> ShippingAddress:
        """Cập nhật địa chỉ giao hàng."""
        address = cls.get_address_by_id(db=db, address_id=address_id, user_id=user_id)

        LocationService.validate_address(
            db=db,
            province_code=payload.province_code,
            ward_code=payload.ward_code,
        )

        if payload.is_default and not address.is_default:
            cls._unset_other_defaults(db=db, user_id=user_id, exclude_id=address_id)

        address.recipient_name = payload.recipient_name
        address.phone = payload.phone
        address.province_code = payload.province_code
        address.ward_code = payload.ward_code
        address.address_line = payload.address_line
        address.is_default = payload.is_default

        db.commit()
        db.refresh(address)

        return address

    @classmethod
    def delete_address(cls, db: Session, address_id: int, user_id: UUID) -> int:
        """Xóa địa chỉ giao hàng."""
        address = cls.get_address_by_id(db=db, address_id=address_id, user_id=user_id)
        was_default = address.is_default

        db.delete(address)
        db.commit()

        # Nếu xóa địa chỉ mặc định, tự động đôn địa chỉ mới nhất lên làm mặc định
        if was_default:
            next_address = (
                db.query(ShippingAddress)
                .filter(ShippingAddress.user_id == user_id)
                .order_by(ShippingAddress.id.desc())
                .first()
            )
            if next_address:
                next_address.is_default = True
                db.commit()

        return address_id
