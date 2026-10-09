from math import ceil

from fastapi import status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.app.core.exceptions import CustomException
from src.app.modules.admin.categories.schema import (
    CategoryCreate,
    CategoryUpdate,
)
from src.app.modules.categories.model import Category


def get_categories(
    db: Session,
    search: str | None = None,
    page: int = 0,
    size: int = 10,
):
    """Lấy danh sách danh mục, hỗ trợ tìm kiếm và phân trang."""

    query = db.query(Category)

    if search:
        keyword = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Category.category_name.ilike(keyword),
                Category.slug.ilike(keyword),
            )
        )

    total = query.count()

    categories = (
        query.order_by(Category.id.asc())
        .offset(page * size)
        .limit(size)
        .all()
    )

    return {
        "content": categories,
        "page": page,
        "size": size,
        "totalElements": total,
        "totalPages": ceil(total / size) if total else 0,
    }


def get_category(
    db: Session,
    category_id: int,
) -> Category:
    """Lấy chi tiết danh mục theo ID."""

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise CustomException(
            message="Không tìm thấy danh mục",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return category


def create_category(
    db: Session,
    data: CategoryCreate,
) -> Category:
    """Tạo danh mục mới."""

    category_name = data.categoryName.strip()
    slug = data.slug.strip()

    if not category_name or not slug:
        raise CustomException(
            message="Tên danh mục và slug không được để trống",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    existing = (
        db.query(Category)
        .filter(
            or_(
                Category.category_name == category_name,
                Category.slug == slug,
            )
        )
        .first()
    )

    if existing:
        raise CustomException(
            message="Tên danh mục hoặc slug đã tồn tại",
            status_code=status.HTTP_409_CONFLICT,
        )

    category = Category(
        category_name=category_name,
        slug=slug,
        description=data.description,
    )

    try:
        db.add(category)
        db.commit()
        db.refresh(category)

        return category

    except IntegrityError:
        db.rollback()

        raise CustomException(
            message="Tên danh mục hoặc slug đã tồn tại",
            status_code=status.HTTP_409_CONFLICT,
        )


def update_category(
    db: Session,
    category_id: int,
    data: CategoryUpdate,
) -> Category:
    """Cập nhật thông tin danh mục."""

    category = get_category(db, category_id)

    category_name = data.categoryName.strip()
    slug = data.slug.strip()

    if not category_name or not slug:
        raise CustomException(
            message="Tên danh mục và slug không được để trống",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    existing = (
        db.query(Category)
        .filter(
            Category.id != category_id,
            or_(
                Category.category_name == category_name,
                Category.slug == slug,
            ),
        )
        .first()
    )

    if existing:
        raise CustomException(
            message="Tên danh mục hoặc slug đã được sử dụng",
            status_code=status.HTTP_409_CONFLICT,
        )

    category.category_name = category_name
    category.slug = slug
    category.description = data.description

    try:
        db.commit()
        db.refresh(category)

        return category

    except IntegrityError:
        db.rollback()

        raise CustomException(
            message="Không thể cập nhật danh mục",
            status_code=status.HTTP_409_CONFLICT,
        )


def delete_category(
    db: Session,
    category_id: int,
) -> int:
    """Xóa danh mục theo ID."""

    category = get_category(db, category_id)

    try:
        db.delete(category)
        db.commit()

        return category_id

    except IntegrityError:
        db.rollback()

        raise CustomException(
            message="Không thể xóa danh mục đang được sử dụng",
            status_code=status.HTTP_409_CONFLICT,
        )