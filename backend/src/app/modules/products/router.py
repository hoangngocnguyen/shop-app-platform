from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.modules.products.model import Product
from src.app.modules.products.schema import ProductResponse

router = APIRouter(prefix="/products", tags=["Products - Quản lý Sản phẩm"])


@router.get(
    "/",
    response_model=list[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách tất cả sản phẩm",
    description="Truy vấn toàn bộ danh sách sản phẩm hiện có trong cơ sở dữ liệu, bao gồm giá gốc, giá khuyến mãi, tồn kho, thương hiệu và hình ảnh.",
    response_description="Danh sách sản phẩm được tìm thấy.",
)
def get_products(db: Session = Depends(get_db)) -> list[Product]:
    """
    Endpoint lấy danh sách sản phẩm:
    - **db**: Session kết nối cơ sở dữ liệu PostgreSQL được tự động inject qua dependency `get_db`.
    - **Trả về**: Danh sách các đối tượng `ProductResponse`.
    """
    products = db.query(Product).all()
    return products
