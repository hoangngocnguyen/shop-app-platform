from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role
from src.app.core.pagination import PaginatedResponse, PaginationParams
from src.app.core.response import ApiResponse, success_response
from src.app.modules.products.schema import (
    BulkDeleteProductRequest,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from src.app.modules.products.service import ProductService

# Khởi tạo Router cho phân hệ Admin Products - Toàn bộ yêu cầu quyền ADMIN
admin_product_router = APIRouter(
    prefix="/admin/products",
    tags=["Admin Products - Quản trị Sản phẩm"],
    dependencies=[Depends(require_role("ADMIN"))],
)


@admin_product_router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[ProductResponse]],
    status_code=status.HTTP_200_OK,
    summary="Danh sách sản phẩm dành cho Admin (Có phân trang & Bộ lọc kho)",
    description="Hiển thị danh sách sản phẩm quản trị, hỗ trợ lọc theo danh mục, trạng thái tồn kho (in_stock, low_stock, out_of_stock) và sắp xếp.",
)
def admin_get_products(
    page: int = Query(default=1, ge=1, description="Trang hiện tại (bắt đầu từ 1)"),
    page_size: int = Query(
        default=10, ge=1, le=100, description="Số lượng mục mỗi trang (1 - 100)"
    ),
    category_id: int | None = Query(
        default=None, description="Lọc theo ID danh mục"
    ),
    search: str | None = Query(
        default=None, description="Từ khóa tìm kiếm theo tên sản phẩm"
    ),
    stock_status: str = Query(
        default="all",
        description="Trạng thái tồn kho: all (Tất cả), in_stock (Còn hàng > 5), low_stock (Sắp hết hàng <= 5), out_of_stock (Hết hàng = 0)",
    ),
    sort_by: str = Query(
        default="id_desc",
        description="Tiêu chí sắp xếp: id_desc, price_asc, price_desc, quantity_asc, quantity_desc",
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[PaginatedResponse[ProductResponse]]:
    """
    Endpoint phân trang sản phẩm Admin:
    """
    pagination = PaginationParams(page=page, page_size=page_size)
    result = ProductService.get_admin_products(
        db=db,
        pagination=pagination,
        category_id=category_id,
        search=search,
        stock_status=stock_status,
        sort_by=sort_by,
    )
    return success_response(
        data=result,
        message="Lấy danh sách sản phẩm quản trị thành công",
    )


@admin_product_router.post(
    "",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Thêm mới sản phẩm (Admin)",
    description="Tạo sản phẩm mới trong hệ thống. Tự động tính toán % giảm giá và kiểm tra danh mục tồn tại.",
)
def admin_create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    """
    Endpoint tạo mới sản phẩm:
    """
    product = ProductService.create_product(db=db, payload=payload)
    return success_response(
        data=product,
        message="Thêm mới sản phẩm thành công",
    )


@admin_product_router.put(
    "/{id}",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật thông tin sản phẩm (Admin)",
    description="Cập nhật thông tin sản phẩm theo ID. Tự động tính toán lại % giảm giá nếu có thay đổi giá gốc/giá sale.",
)
def admin_update_product(
    id: int = Path(..., description="Mã ID sản phẩm cần cập nhật"),
    payload: ProductUpdate = ...,
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    """
    Endpoint cập nhật sản phẩm:
    """
    product = ProductService.update_product(db=db, product_id=id, payload=payload)
    return success_response(
        data=product,
        message="Cập nhật thông tin sản phẩm thành công",
    )


@admin_product_router.delete(
    "/{id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa đơn lẻ sản phẩm (Admin)",
    description="Xóa sản phẩm theo ID. Nghiệp vụ: Chặn xóa nếu sản phẩm đã từng phát sinh giao dịch trong đơn hàng.",
)
def admin_delete_product(
    id: int = Path(..., description="Mã ID sản phẩm cần xóa"),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Endpoint xóa sản phẩm:
    """
    ProductService.delete_product(db=db, product_id=id)
    return success_response(
        data={"deleted_id": id},
        message=f"Đã xóa thành công sản phẩm có ID {id}",
    )


@admin_product_router.post(
    "/delete-multiple",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa hàng loạt sản phẩm (Admin)",
    description="Xóa danh sách ID sản phẩm trong 1 Database Transaction duy nhất. Tự động rollback nếu có sản phẩm đã nằm trong đơn hàng.",
)
def admin_bulk_delete_products(
    payload: BulkDeleteProductRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Endpoint xóa hàng loạt sản phẩm:
    """
    deleted_count = ProductService.bulk_delete_products(
        db=db, product_ids=payload.product_ids
    )
    return success_response(
        data={
            "deleted_count": deleted_count,
            "product_ids": payload.product_ids,
        },
        message=f"Đã xóa thành công {deleted_count} sản phẩm",
    )
