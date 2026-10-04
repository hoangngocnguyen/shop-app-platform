from decimal import Decimal
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.pagination import PaginatedResponse, PaginationParams
from src.app.core.response import ApiResponse, success_response
from src.app.modules.products.schema import (
    PriceOptionDTO,
    ProductDetailResponse,
    ProductResponse,
)
from src.app.modules.products.service import ProductService

# Khởi tạo Router cho phân hệ Client / Public Products
router = APIRouter(
    prefix="/products",
    tags=["Products - Sản phẩm (Client)"],
)


@router.get(
    "/price-options",
    response_model=ApiResponse[list[PriceOptionDTO]],
    status_code=status.HTTP_200_OK,
    summary="Lấy metadata các dải giá cố định (Client)",
    description="Trả về danh sách mapping dải giá để Frontend render các nút Filter nhanh (Dưới 500k, 500k-1tr, 1tr-3tr,...).",
)
def get_price_options() -> ApiResponse[list[PriceOptionDTO]]:
    """
    Endpoint lấy metadata dải giá cố định:
    """
    options = ProductService.get_price_options()
    return success_response(
        data=options,
        message="Lấy danh sách dải giá thành công",
    )


@router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[ProductResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lọc và tìm kiếm danh sách sản phẩm (Client)",
    description="API chính cho trang chủ và trang danh mục sản phẩm của khách hàng. Hỗ trợ lọc theo danh mục, dải giá, từ khóa và sắp xếp.",
)
def get_products(
    page: int = Query(default=1, ge=1, description="Số trang hiện tại (bắt đầu từ 1)"),
    page_size: int = Query(
        default=12, ge=1, le=100, description="Số lượng mục mỗi trang (mặc định phía Client là 12)"
    ),
    category_slug: str | None = Query(
        default=None, description="Lọc theo slug danh mục (VD: dien-thoai, laptop)"
    ),
    search: str | None = Query(
        default=None, description="Từ khóa tìm kiếm theo tên sản phẩm"
    ),
    price_option: str | None = Query(
        default=None,
        description="Key dải giá cố định: duoi-500k, 500k-1trieu, 1trieu-3trieu, 3trieu-5trieu, tren-5trieu",
    ),
    min_price: Decimal | None = Query(
        default=None, ge=Decimal("0"), description="Giá sàn tùy chỉnh (VNĐ)"
    ),
    max_price: Decimal | None = Query(
        default=None, ge=Decimal("0"), description="Giá trần tùy chỉnh (VNĐ)"
    ),
    sort_by: str = Query(
        default="newest",
        description="Tiêu chí sắp xếp: newest (Mới nhất), price_asc (Giá tăng dần), price_desc (Giá giảm dần), best_seller (Bán chạy nhất)",
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[PaginatedResponse[ProductResponse]]:
    """
    Endpoint tìm kiếm & lọc sản phẩm nâng cao:
    - **search**: Nếu có truyền từ khóa search, hệ thống ưu tiên reset về page = 1.
    """
    # Auto reset page: Nếu người dùng nhập từ khóa tìm kiếm mới, bắt đầu từ trang 1
    current_page = 1 if (search and page == 1) else page
    pagination = PaginationParams(page=current_page, page_size=page_size)

    result = ProductService.get_public_products(
        db=db,
        pagination=pagination,
        category_slug=category_slug,
        search=search,
        price_option=price_option,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
    )
    return success_response(
        data=result,
        message="Lấy danh sách sản phẩm thành công",
    )


@router.get(
    "/{id}",
    response_model=ApiResponse[ProductDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết một sản phẩm theo ID (Client)",
    description="Lấy đầy đủ thông tin chi tiết của sản phẩm (Tên, giá gốc, giá sale, tồn kho, rating, thương hiệu, danh mục cha).",
)
def get_product_detail(
    id: int = Path(..., description="Mã định danh duy nhất của sản phẩm"),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductDetailResponse]:
    """
    Endpoint lấy chi tiết sản phẩm:
    """
    product = ProductService.get_product_detail(db=db, product_id=id)
    return success_response(
        data=product,
        message="Lấy thông tin chi tiết sản phẩm thành công",
    )


@router.get(
    "/{id}/related",
    response_model=ApiResponse[list[ProductResponse]],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách sản phẩm liên quan (Client)",
    description="Lấy các sản phẩm có cùng danh mục với sản phẩm hiện tại, tự động loại trừ chính sản phẩm đang xem.",
)
def get_related_products(
    id: int = Path(..., description="ID sản phẩm đang xem"),
    limit: int = Query(default=4, ge=1, le=20, description="Số lượng sản phẩm liên quan cần lấy"),
    db: Session = Depends(get_db),
) -> ApiResponse[list[ProductResponse]]:
    """
    Endpoint lấy sản phẩm liên quan:
    """
    related = ProductService.get_related_products(db=db, product_id=id, limit=limit)
    return success_response(
        data=related,
        message="Lấy danh sách sản phẩm liên quan thành công",
    )
