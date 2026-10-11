from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.response import ApiResponse, success_response
from src.app.modules.categories.schema import CategoryResponse
from src.app.modules.categories.service import CategoryService

# Khởi tạo Router cho phân hệ Client / Public Categories (Không yêu cầu đăng nhập)
router = APIRouter(
    prefix="/categories",
    tags=["Categories - Danh mục sản phẩm (Client)"],
)


@router.get(
    "",
    response_model=ApiResponse[list[CategoryResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách tất cả danh mục (Client)",
    description="Trả về toàn bộ danh mục hiển thị trên thanh Menu điều hướng / Header của trang chủ. Hỗ trợ lọc theo danh mục cha (parent_id).",
)
def get_categories(
    parent_id: int | None = Query(
        default=None,
        description="Mã danh mục cha (nếu muốn lọc danh mục con, null để lấy toàn bộ)",
        examples=[None],
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[list[CategoryResponse]]:
    """
    Endpoint lấy danh sách danh mục phía Client:
    - **parent_id**: Query parameter tùy chọn lọc theo ID cha.
    - **db**: Database Session inject tự động.
    """
    # Bước 1: Gọi tầng Service truy vấn dữ liệu
    categories = CategoryService.get_public_categories(db=db, parent_id=parent_id)

    # Bước 2: Bọc vào ApiResponse chuẩn hóa và trả về
    return success_response(
        data=categories,
        message="Lấy danh sách danh mục thành công",
    )


@router.get(
    "/{slug}",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy thông tin chi tiết danh mục theo Slug",
    description="Tra cứu thông tin chi tiết của danh mục dựa trên đường dẫn thân thiện SEO (Ví dụ: dien-thoai, laptop).",
)
def get_category_by_slug(
    slug: str = Path(
        ...,
        description="Đường dẫn tĩnh SEO của danh mục",
        examples=["dien-thoai"],
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[CategoryResponse]:
    """
    Endpoint lấy chi tiết danh mục theo slug:
    - **slug**: Path parameter tên định danh thân thiện.
    """
    # Bước 1: Gọi tầng Service tìm kiếm danh mục (tự raise 404 nếu không tìm thấy)
    category = CategoryService.get_category_by_slug(db=db, slug=slug)

    # Bước 2: Bọc vào ApiResponse chuẩn và trả về
    return success_response(
        data=category,
        message="Lấy thông tin chi tiết danh mục thành công",
    )
