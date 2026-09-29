from sqlalchemy import select
from sqlalchemy.orm import Session

from src.app.core.exceptions import ResourceNotFoundException
from src.app.modules.locations.model import Province, Ward
from src.app.modules.locations.schema import ProvinceResponse, WardResponse


class LocationService:
    @staticmethod
    def get_provinces(db: Session) -> list[ProvinceResponse]:
        stmt = select(Province).order_by(Province.code)
        provinces = db.scalars(stmt).all()

        return [
            ProvinceResponse(code=province.code, name=province.full_name)
            for province in provinces
        ]

    @staticmethod
    def get_wards_by_province(
        db: Session,
        province_code: str,
    ) -> list[WardResponse]:
        # Kiểm tra tỉnh/thành phố tồn tại
        province = db.get(Province, province_code)

        if not province:
            raise ResourceNotFoundException("Tỉnh/thành phố không tồn tại")

        stmt = (
            select(Ward).where(Ward.province_code == province_code).order_by(Ward.code)
        )

        wards = db.scalars(stmt).all()

        return [
            WardResponse(
                code=ward.code,
                name=ward.full_name,
            )
            for ward in wards
        ]

    @staticmethod
    def validate_address(
        db: Session,
        province_code: str,
        ward_code: str,
    ) -> tuple[Province, Ward]:

        province = db.get(Province, province_code)

        if not province:
            raise ResourceNotFoundException("Tỉnh/thành phố không tồn tại")

        ward = db.get(Ward, ward_code)

        if not ward:
            raise ResourceNotFoundException("Phường/xã không tồn tại")

        # Phường/xã phải thuộc đúng tỉnh/thành phố
        if ward.province_code != province.code:
            raise ResourceNotFoundException(
                "Phường/xã không thuộc tỉnh/thành phố đã chọn"
            )

        return province, ward
