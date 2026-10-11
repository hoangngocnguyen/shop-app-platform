
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.carts.schema import (
    AddToCartRequest,
    CartResponse,
    DeleteMultipleCartItemsRequest,
    SyncCartRequest,
    UpdateCartItemRequest,
)
from src.app.modules.carts.service import CartService
from src.app.modules.users.dep import get_current_user_id


router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get(
    "",
    response_model=ApiResponse[CartResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết giỏ hàng",
)
def get_user_cart(
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    cart = CartService.get_user_cart(db=db, user_id=user_id)
    return success_response(
        data=cart,
        message="Lấy thông tin giỏ hàng thành công",
    )


@router.post(
    "/items",
    response_model=ApiResponse[CartResponse],
    status_code=status.HTTP_200_OK,
    summary="Thêm sản phẩm vào giỏ hàng",
)
def add_to_cart(
    payload: AddToCartRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    cart = CartService.add_to_cart(
        db=db,
        user_id=user_id,
        payload=payload,
    )
    return success_response(
        data=cart,
        message="Thêm sản phẩm vào giỏ hàng thành công",
    )


@router.patch(
    "/items/{cart_item_id}",
    response_model=ApiResponse[CartResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật số lượng sản phẩm",
)
def update_cart_item(
    cart_item_id: int,
    payload: UpdateCartItemRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    cart = CartService.update_cart_item(
        db=db,
        user_id=user_id,
        cart_item_id=cart_item_id,
        payload=payload,
    )
    return success_response(
        data=cart,
        message="Cập nhật số lượng sản phẩm thành công",
    )


@router.delete(
    "/items/{cart_item_id}",
    response_model=ApiResponse[CartResponse],
    status_code=status.HTTP_200_OK,
    summary="Xóa một sản phẩm khỏi giỏ hàng",
)
def delete_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    cart = CartService.delete_cart_item(
        db=db,
        user_id=user_id,
        cart_item_id=cart_item_id,
    )
    return success_response(
        data=cart,
        message="Xóa sản phẩm khỏi giỏ hàng thành công",
    )


@router.delete(
    "/items",
    response_model=ApiResponse[CartResponse],
    status_code=status.HTTP_200_OK,
    summary="Xóa nhiều sản phẩm khỏi giỏ hàng",
)
def delete_multiple_cart_items(
    payload: DeleteMultipleCartItemsRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    cart = CartService.delete_multiple_cart_items(
        db=db,
        user_id=user_id,
        payload=payload,
    )
    return success_response(
        data=cart,
        message="Xóa các sản phẩm được chọn thành công",
    )


@router.post(
    "/sync",
    response_model=ApiResponse[CartResponse],
    status_code=status.HTTP_200_OK,
    summary="Đồng bộ giỏ hàng sau khi đăng nhập",
)
def sync_cart(
    payload: SyncCartRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    cart = CartService.sync_cart(
        db=db,
        user_id=user_id,
        payload=payload,
    )
    return success_response(
        data=cart,
        message="Đồng bộ giỏ hàng thành công",
    )
