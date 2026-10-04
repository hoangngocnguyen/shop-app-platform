from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.shipping_addresses.schema import (
    ShippingAddressCreate,
    ShippingAddressResponse,
    ShippingAddressUpdate,
)
from src.app.modules.shipping_addresses.service import ShippingAddressService
from src.app.modules.users.dep import get_current_user_id

router = APIRouter(prefix="/shipping-addresses", tags=["Shipping Addresses"])


@router.get(
    "",
    response_model=ApiResponse[list[ShippingAddressResponse]],  # 1. Đổi response_model
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách địa chỉ giao hàng của người dùng",
)
def get_user_addresses(
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    addresses = ShippingAddressService.get_user_addresses(db=db, user_id=user_id)
    return success_response(data=addresses, message="Lấy danh sách địa chỉ thành công")


@router.get(
    "/{address_id}",
    response_model=ApiResponse[ShippingAddressResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết một địa chỉ giao hàng",
)
def get_address_by_id(
    address_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    address = ShippingAddressService.get_address_by_id(
        db=db, address_id=address_id, user_id=user_id
    )
    return success_response(data=address)


@router.post(
    "",
    response_model=ApiResponse[ShippingAddressResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo địa chỉ giao hàng mới",
)
def create_address(
    payload: ShippingAddressCreate,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    new_address = ShippingAddressService.create_address(
        db=db, user_id=user_id, payload=payload
    )
    return success_response(data=new_address, message="Tạo địa chỉ mới thành công")


@router.put(
    "/{address_id}",
    response_model=ApiResponse[ShippingAddressResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật địa chỉ giao hàng",
)
def update_address(
    address_id: int,
    payload: ShippingAddressUpdate,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    updated_address = ShippingAddressService.update_address(
        db=db, address_id=address_id, user_id=user_id, payload=payload
    )
    return success_response(data=updated_address, message="Cập nhật địa chỉ thành công")


@router.delete(
    "/{address_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa địa chỉ giao hàng",
)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    deleted_id = ShippingAddressService.delete_address(
        db=db, address_id=address_id, user_id=user_id
    )
    return success_response(
        data={"id": deleted_id}, message="Xóa địa chỉ giao hàng thành công"
    )
