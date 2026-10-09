
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.admin.products import service
from src.app.modules.admin.products.schema import (
    ProductAddForm,
    ProductPatchForm,
    ProductDetailResponse,
)

router = APIRouter()


def _product_form(
    productName: Annotated[str, Form(min_length=1, max_length=256)],
    quantity: Annotated[int, Form(ge=0)],
    categoryId: Annotated[int, Form(gt=0)],
    price: Annotated[Decimal, Form(gt=0)],
    salePrice: Annotated[Decimal | None, Form(gt=0)] = None,
    description: str | None = Form(default=None),
    origin: str | None = Form(default=None),
    brand: str | None = Form(default=None),
) -> ProductAddForm:
    return ProductAddForm(
        productName=productName,
        quantity=quantity,
        categoryId=categoryId,
        price=price,
        salePrice=salePrice,
        description=description,
        origin=origin,
        brand=brand,
    )


def _product_patch_form(
    productName: Annotated[str | None, Form(min_length=1, max_length=256)] = None,
    quantity: Annotated[int | None, Form(ge=0)] = None,
    categoryId: Annotated[int | None, Form(gt=0)] = None,
    price: Annotated[Decimal | None, Form(gt=0)] = None,
    salePrice: Annotated[Decimal | None, Form(gt=0)] = None,
    description: str | None = Form(default=None),
    origin: str | None = Form(default=None),
    brand: str | None = Form(default=None),
) -> ProductPatchForm:
    values = {
        field: value
        for field, value in {
            "productName": productName,
            "quantity": quantity,
            "categoryId": categoryId,
            "price": price,
            "salePrice": salePrice,
            "description": description,
            "origin": origin,
            "brand": brand,
        }.items()
        if value is not None
    }
    return ProductPatchForm(**values)


@router.post(
    "",
    response_model=ApiResponse[ProductDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo sản phẩm mới kèm ảnh",
)
async def create_product(
    data: Annotated[ProductAddForm, Depends(_product_form)],
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    product = await service.create_product(db, data, file)

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
async def update_product(
    id: int,
    data: Annotated[ProductAddForm, Depends(_product_form)],
    file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    product = await service.update_product(db, id, data, file)

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
async def patch_product(
    id: int,
    data: Annotated[ProductPatchForm, Depends(_product_patch_form)],
    file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    product = await service.patch_product(db, id, data, file)

    return success_response(
        data=product,
        message="Cập nhật thông tin sản phẩm thành công",
    )
