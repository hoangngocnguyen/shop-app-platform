from decimal import Decimal
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Path,
    Query,
    UploadFile,
    status,
)
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


def _product_create_form(
    product_name: Annotated[
        str,
        Form(
            min_length=1,
            max_length=255,
            description="Tên sản phẩm mới",
            examples=["iPhone 15 Pro Max 256GB"],
        ),
    ],
    category_id: Annotated[
        int,
        Form(
            gt=0,
            description="Mã danh mục sản phẩm trực thuộc",
            examples=[1],
        ),
    ],
    price: Annotated[
        Decimal,
        Form(
            gt=Decimal("0"),
            description="Giá bán gốc",
            examples=[Decimal("29990000.00")],
        ),
    ],
    sale_price: Annotated[
        Decimal | None,
        Form(
            gt=Decimal("0"),
            description="Giá bán khuyến mãi",
            examples=[Decimal("28490000.00")],
        ),
    ] = None,
    quantity: Annotated[
        int,
        Form(
            ge=0,
            description="Số lượng kho ban đầu",
            examples=[50],
        ),
    ] = 0,
    brand: Annotated[
        str | None,
        Form(
            max_length=255,
            description="Thương hiệu sản phẩm",
            examples=["Apple"],
        ),
    ] = None,
    origin: Annotated[
        str | None,
        Form(
            max_length=255,
            description="Xuất xứ sản phẩm",
            examples=["Chính hãng VN/A"],
        ),
    ] = None,
    description: Annotated[
        str | None,
        Form(
            description="Mô tả chi tiết sản phẩm",
            examples=["<p>Mô tả chi tiết...</p>"],
        ),
    ] = None,
) -> ProductCreate:
    return ProductCreate(
        product_name=product_name,
        category_id=category_id,
        price=price,
        sale_price=sale_price,
        quantity=quantity,
        brand=brand,
        origin=origin,
        description=description,
    )


def _product_update_form(
    product_name: Annotated[
        str | None,
        Form(
            min_length=1,
            max_length=255,
            description="Tên sản phẩm mới",
        ),
    ] = None,
    category_id: Annotated[
        int | None,
        Form(
            gt=0,
            description="Mã danh mục mới",
        ),
    ] = None,
    price: Annotated[
        Decimal | None,
        Form(
            gt=Decimal("0"),
            description="Giá bán gốc mới",
        ),
    ] = None,
    sale_price: Annotated[
        Decimal | None,
        Form(
            gt=Decimal("0"),
            description="Giá bán khuyến mãi mới",
        ),
    ] = None,
    quantity: Annotated[
        int | None,
        Form(
            ge=0,
            description="Số lượng kho mới",
        ),
    ] = None,
    brand: Annotated[
        str | None,
        Form(
            max_length=255,
            description="Thương hiệu mới",
        ),
    ] = None,
    origin: Annotated[
        str | None,
        Form(
            max_length=255,
            description="Xuất xứ mới",
        ),
    ] = None,
    description: Annotated[
        str | None,
        Form(
            description="Mô tả chi tiết mới",
        ),
    ] = None,
) -> ProductUpdate:
    values = {
        field: value
        for field, value in {
            "product_name": product_name,
            "category_id": category_id,
            "price": price,
            "sale_price": sale_price,
            "quantity": quantity,
            "brand": brand,
            "origin": origin,
            "description": description,
        }.items()
        if value is not None
    }
    return ProductUpdate(**values)


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
    summary="Thêm mới sản phẩm kèm ảnh Cloudinary (Admin)",
    description="Tạo sản phẩm mới trong hệ thống. Nhận file ảnh trực tiếp qua multipart/form-data và tự động tải lên Cloudinary.",
)
async def admin_create_product(
    data: Annotated[ProductCreate, Depends(_product_create_form)],
    file: UploadFile | None = File(
        default=None, description="File ảnh sản phẩm tải lên Cloudinary"
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    """
    Endpoint tạo mới sản phẩm:
    """
    product = await ProductService.create_product(db=db, payload=data, file=file)
    return success_response(
        data=product,
        message="Thêm mới sản phẩm thành công",
    )


@admin_product_router.put(
    "/{id}",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật thông tin sản phẩm kèm ảnh Cloudinary (Admin)",
    description="Cập nhật thông tin sản phẩm theo ID. Tự động tải ảnh mới lên Cloudinary và xóa ảnh cũ nếu có file đính kèm.",
)
async def admin_update_product(
    id: int = Path(..., description="Mã ID sản phẩm cần cập nhật"),
    data: Annotated[ProductUpdate, Depends(_product_update_form)] = None,
    file: UploadFile | None = File(
        default=None,
        description="File ảnh mới tải lên Cloudinary (nếu muốn thay đổi ảnh)",
    ),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    """
    Endpoint cập nhật sản phẩm:
    """
    product = await ProductService.update_product(
        db=db, product_id=id, payload=data, file=file
    )
    return success_response(
        data=product,
        message="Cập nhật thông tin sản phẩm thành công",
    )


@admin_product_router.patch(
    "/{id}/image",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật riêng ảnh sản phẩm (Admin - Tương tự User Avatar)",
    description="Tải file ảnh mới lên Cloudinary cho sản phẩm và tự động xóa ảnh cũ. Request dạng multipart/form-data.",
)
async def admin_update_product_image(
    id: int = Path(..., description="Mã ID sản phẩm cần cập nhật ảnh"),
    file: UploadFile = File(..., description="File ảnh mới tải lên"),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    """
    Endpoint cập nhật riêng ảnh sản phẩm:
    """
    product = await ProductService.update_product_image(
        db=db, product_id=id, file=file
    )
    return success_response(
        data=product,
        message="Cập nhật ảnh sản phẩm thành công",
    )


@admin_product_router.delete(
    "/{id}/image",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Xóa riêng ảnh sản phẩm trên Cloudinary (Admin - Tương tự Delete Avatar)",
    description="Xóa ảnh sản phẩm trên Cloudinary và đặt image_src, image_public_id về null.",
)
async def admin_delete_product_image(
    id: int = Path(..., description="Mã ID sản phẩm cần xóa ảnh"),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    """
    Endpoint xóa riêng ảnh sản phẩm:
    """
    product = await ProductService.delete_product_image(db=db, product_id=id)
    return success_response(
        data=product,
        message="Xóa ảnh sản phẩm thành công",
    )


@admin_product_router.delete(
    "/{id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa đơn lẻ sản phẩm (Admin)",
    description="Xóa sản phẩm theo ID. Nghiệp vụ: Chặn xóa nếu sản phẩm đã từng phát sinh giao dịch trong đơn hàng và dọn dẹp ảnh trên Cloudinary.",
)
async def admin_delete_product(
    id: int = Path(..., description="Mã ID sản phẩm cần xóa"),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Endpoint xóa sản phẩm:
    """
    await ProductService.delete_product(db=db, product_id=id)
    return success_response(
        data={"deleted_id": id},
        message=f"Đã xóa thành công sản phẩm có ID {id}",
    )


@admin_product_router.post(
    "/delete-multiple",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Xóa hàng loạt sản phẩm (Admin)",
    description="Xóa danh sách ID sản phẩm trong 1 Database Transaction duy nhất. Tự động rollback nếu có sản phẩm đã nằm trong đơn hàng và dọn dẹp toàn bộ ảnh trên Cloudinary.",
)
async def admin_bulk_delete_products(
    payload: BulkDeleteProductRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Endpoint xóa hàng loạt sản phẩm:
    """
    deleted_count = await ProductService.bulk_delete_products(
        db=db, product_ids=payload.product_ids
    )
    return success_response(
        data={
            "deleted_count": deleted_count,
            "product_ids": payload.product_ids,
        },
        message=f"Đã xóa thành công {deleted_count} sản phẩm",
    )
