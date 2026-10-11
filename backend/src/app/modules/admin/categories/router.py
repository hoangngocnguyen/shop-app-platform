
from fastapi import APIRouter, Depends, Query, status

from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response

from src.app.modules.admin.categories import service
from src.app.modules.admin.categories.schema import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
)

router = APIRouter()


@router.get(
    "",
    response_model=ApiResponse[CategoryListResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách danh mục",
)
def list_categories(
    search: str | None = None,
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    categories = service.get_categories(db, search, page, size)

    return success_response(
        data=categories,
        message="Lấy danh sách danh mục thành công",
    )


@router.post(
    "",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo danh mục mới",
)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
):
    category = service.create_category(db, data)

    return success_response(
        data=category,
        message="Tạo danh mục thành công",
    )


@router.get(
    "/{categoryId}",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết danh mục",
)
def get_category(
    categoryId: int,
    db: Session = Depends(get_db),
):
    category = service.get_category(db, categoryId)

    return success_response(
        data=category,
        message="Lấy thông tin danh mục thành công",
    )


@router.put(
    "/{categoryId}",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật danh mục",
)
def update_category(
    categoryId: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
):
    category = service.update_category(db, categoryId, data)

    return success_response(
        data=category,
        message="Cập nhật danh mục thành công",
    )


@router.delete(
    "/{categoryId}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa danh mục",
)
def delete_category(
    categoryId: int,
    db: Session = Depends(get_db),
):
    deleted_id = service.delete_category(db, categoryId)

    return success_response(
        data={"id": deleted_id},
        message="Xóa danh mục thành công",
    )

