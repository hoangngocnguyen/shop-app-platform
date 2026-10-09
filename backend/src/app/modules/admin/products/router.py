
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.admin.products import service
from src.app.modules.admin.products.schema import (
    ProductAddForm,
    ProductUpdateForm,
    ProductPatchForm,
    ProductDetailResponse,
)

router = APIRouter()


@router.post(
    "",
    response_model=ApiResponse[ProductDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo sản phẩm mới",
)
def create_product(
    data: ProductAddForm,
    db: Session = Depends(get_db),
):
    product = service.create_product(db, data)

    return success_response(
        data=product,
        message="Tạo sản phẩm thành công",
    )


@router.put(
    "/{id}",
    response_model=ApiResponse[ProductDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật toàn bộ thông tin sản phẩm",
)
def update_product(
    id: int,
    data: ProductUpdateForm,
    db: Session = Depends(get_db),
):
    product = service.update_product(db, id, data)

    return success_response(
        data=product,
        message="Cập nhật sản phẩm thành công",
    )


@router.patch(
    "/{id}",
    response_model=ApiResponse[ProductDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật một phần thông tin sản phẩm",
)
def patch_product(
    id: int,
    data: ProductPatchForm,
    db: Session = Depends(get_db),
):
    product = service.patch_product(db, id, data)

    return success_response(
        data=product,
        message="Cập nhật thông tin sản phẩm thành công",
    )
