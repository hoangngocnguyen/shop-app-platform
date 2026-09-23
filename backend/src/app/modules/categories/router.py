from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.categories.model import Category
from src.app.modules.categories.schema import CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories - Quản lý Danh mục"])


@router.get(
    "/",
    response_model=list[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách tất cả danh mục",
    description="Truy vấn toàn bộ danh mục sản phẩm trong hệ thống, bao gồm thông tin phân cấp danh mục cha - con và slug SEO.",
    response_description="Danh sách các danh mục được tìm thấy.",
)
def get_categories(db: Session = Depends(get_db)) -> list[Category]:
    """
    Endpoint lấy danh sách danh mục:
    - **db**: Session kết nối cơ sở dữ liệu PostgreSQL được inject tự động qua dependency `get_db`.
    - **Trả về**: Danh sách các đối tượng `CategoryResponse`.
    """
    categories = db.query(Category).all()
    return categories
