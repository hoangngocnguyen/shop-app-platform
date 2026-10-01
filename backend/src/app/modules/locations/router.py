from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.locations.schema import ProvinceResponse, WardResponse
from src.app.modules.locations.service import LocationService

router = APIRouter(
    prefix="/locations",
    tags=["Locations - Địa chỉ hành chính"],
)


@router.get(
    "/provinces",
    response_model=list[ProvinceResponse],
)
def get_provinces(
    db: Session = Depends(get_db),
):
    return LocationService.get_provinces(db)


@router.get(
    "/provinces/{province_code}/wards",
    response_model=list[WardResponse],
)
def get_wards_by_province(
    province_code: str,
    db: Session = Depends(get_db),
):
    return LocationService.get_wards_by_province(
        db=db,
        province_code=province_code,
    )
