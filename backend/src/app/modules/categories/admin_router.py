from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role
from src.app.core.pagination import PaginatedResponse, PaginationParams
from src.app.core.response import ApiResponse, success_response
from src.app.modules.categories.schema import (
    BulkDeleteCategoryRequest,
    CategoryCreate,
    CategoryResponse,
    CategoryStatsDTO,
    CategoryUpdate,
)
from src.app.modules.categories.service import CategoryService

# Khởi tạo Router cho phân hệ Admin Categories - Toàn bộ API yêu cầu quyền ADMIN
admin_category_router = APIRouter(
    prefix="/admin/categories",
    tags=["Admin Categories - Quản trị Danh mục"],
    dependencies=[Depends(require_role("ADMIN"))],
)


@admin_category_router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[CategoryStatsDTO]],
    status_code=status.HTTP_200_OK,
    summary="Danh sách danh mục dành cho Admin (Có phân trang)",
    description="Hiển thị bảng danh mục quản trị, hỗ trợ phân trang, tìm kiếm và tính kèm số lượng sản phẩm trực thuộc (product_count).",
)
def admin_get_categories(
    page: int = Query(default=1, ge=1, description="Trang hiện tại (bắt đầu từ 1)"),
    page_size: int = Query(
        default=10, ge=1, le=100, description="Số lượng mục mỗi trang (1 - 100)"
    ),
    search: str | None = Query(
        default=None, description="Từ khóa tìm kiếm theo tên danh mục"
    ),
    sort_by: str = Query(
        default="id_desc",
        description="Tiêu chí sắp xếp: id_desc, name_asc, name_desc",
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[PaginatedResponse[CategoryStatsDTO]]:
    """
    Endpoint phân trang danh mục Admin:
    """
    pagination = PaginationParams(page=page, page_size=page_size)
    result = CategoryService.get_admin_categories(
        db=db,
        pagination=pagination,
        search=search,
        sort_by=sort_by,
    )
    return success_response(
        data=result,
        message="Lấy danh sách danh mục quản trị thành công",
    )


@admin_category_router.post(
    "",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Thêm mới danh mục sản phẩm (Admin)",
    description="Tạo danh mục mới trong hệ thống. Tự động sinh slug chuẩn SEO và kiểm tra trùng lặp.",
)
def admin_create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
) -> ApiResponse[CategoryResponse]:
    """
    Endpoint tạo mới danh mục:
    """
    category = CategoryService.create_category(db=db, payload=payload)
    return success_response(
        data=category,
        message="Tạo mới danh mục thành công",
    )


@admin_category_router.put(
    "/{category_id}",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật danh mục sản phẩm (Admin)",
    description="Chỉnh sửa thông tin danh mục, tự động cập nhật lại slug và kiểm tra trùng lặp với danh mục khác.",
)
def admin_update_category(
    category_id: int = Path(..., description="ID danh mục cần cập nhật"),
    payload: CategoryUpdate = ...,
    db: Session = Depends(get_db),
) -> ApiResponse[CategoryResponse]:
    """
    Endpoint cập nhật danh mục:
    """
    category = CategoryService.update_category(
        db=db, category_id=category_id, payload=payload
    )
    return success_response(
        data=category,
        message="Cập nhật thông tin danh mục thành công",
    )


@admin_category_router.delete(
    "/{category_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa đơn lẻ danh mục (Admin)",
    description="Xóa danh mục theo ID. Nghiệp vụ: Chặn xóa nếu danh mục đang chứa sản phẩm hoặc danh mục con.",
)
def admin_delete_category(
    category_id: int = Path(..., description="ID danh mục cần xóa"),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Endpoint xóa danh mục:
    """
    CategoryService.delete_category(db=db, category_id=category_id)
    return success_response(
        data={"deleted_id": category_id},
        message=f"Đã xóa thành công danh mục có ID {category_id}",
    )


@admin_category_router.post(
    "/delete-multiple",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa hàng loạt danh mục (Admin)",
    description="Xóa danh sách ID danh mục trong một transaction. Tự động rollback nếu phát hiện bất kỳ danh mục nào còn sản phẩm.",
)
def admin_bulk_delete_categories(
    payload: BulkDeleteCategoryRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Endpoint xóa hàng loạt danh mục:
    """
    deleted_count = CategoryService.bulk_delete_categories(
        db=db, category_ids=payload.category_ids
    )
    return success_response(
        data={
            "deleted_count": deleted_count,
            "category_ids": payload.category_ids,
        },
        message=f"Đã xóa thành công {deleted_count} danh mục",
    )
