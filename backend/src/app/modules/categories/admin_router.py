from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.categories.model import Category
from src.app.modules.categories.schema import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(
    prefix="/admin/categories", tags=["Admin Categories - Quản lý Danh mục Admin"]
)


@router.get(
    "/",
    response_model=list[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách tất cả danh mục (Admin)",
    description="Lấy danh sách tất cả danh mục sản phẩm phục vụ cho trang quản trị Admin.",
)
def admin_get_categories(db: Session = Depends(get_db)) -> list[Category]:
    categories = db.query(Category).all()
    return categories


@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Thêm danh mục mới",
    description="Tạo một danh mục sản phẩm mới trong hệ thống.",
)
def admin_create_category(
    payload: CategoryCreate, db: Session = Depends(get_db)
) -> Category:
    new_category = Category(**payload.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@router.get(
    "/{categoryId}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết danh mục theo ID",
)
def admin_get_category_detail(
    categoryId: int, db: Session = Depends(get_db)
) -> Category:
    category = (
        db.query(Category).filter(Category.category_id == categoryId).first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy danh mục với ID {categoryId}",
        )
    return category


@router.put(
    "/{categoryId}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Cập nhật thông tin danh mục",
)
def admin_update_category(
    categoryId: int, payload: CategoryUpdate, db: Session = Depends(get_db)
) -> Category:
    category = (
        db.query(Category).filter(Category.category_id == categoryId).first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy danh mục với ID {categoryId}",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/{categoryId}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa danh mục theo ID",
)
def admin_delete_category(categoryId: int, db: Session = Depends(get_db)) -> None:
    category = (
        db.query(Category).filter(Category.category_id == categoryId).first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy danh mục với ID {categoryId}",
        )

    db.delete(category)
    db.commit()
    return None