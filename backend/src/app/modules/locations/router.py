from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.locations.schema import ProvinceResponse, WardResponse
from src.app.modules.locations.service import LocationService

router = APIRouter(
    prefix="/locations",
    tags=["Locations - Địa chỉ hành chính"],
)


@router.get(
    "/provinces",
    response_model=ApiResponse[list[ProvinceResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách tỉnh/thành phố",
)
def get_provinces(
    db: Session = Depends(get_db),
):
    provinces = LocationService.get_provinces(db)
    return success_response(
        data=provinces, message="Lấy danh sách tỉnh/thành phố thành công"
    )


@router.get(
    "/provinces/{province_code}/wards",
    response_model=ApiResponse[list[WardResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách phường/xã theo tỉnh/thành phố",
)
def get_wards_by_province(
    province_code: str,
    db: Session = Depends(get_db),
):
    wards = LocationService.get_wards_by_province(
        db=db,
        province_code=province_code,
    )
    return success_response(data=wards, message="Lấy danh sách phường/xã thành công")
