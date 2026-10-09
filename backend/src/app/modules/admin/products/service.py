import logging
from decimal import Decimal

from cloudinary.exceptions import Error as CloudinaryError
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.app.core.exceptions import CustomException
from src.app.modules.admin.products.schema import (
    ProductAddForm,
    ProductPatchForm,
)
from src.app.modules.categories.model import Category
from src.app.modules.media.cloudinary_folders import PRODUCT
from src.app.modules.media.service import MediaService
from src.app.modules.products.model import Product

logger = logging.getLogger(__name__)


async def _upload_product_image(file: UploadFile) -> tuple[str, str]:
    result = await MediaService.upload_image(file=file, folder=PRODUCT)
    image_url = result.get("url")
    public_id = result.get("public_id")

    if not isinstance(image_url, str) or not isinstance(public_id, str):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Dịch vụ lưu trữ ảnh không trả về URL hoặc public ID hợp lệ",
        )

    return image_url, public_id


async def _delete_uploaded_image(public_id: str) -> None:
    try:
        await MediaService.delete_image(public_id)
    except (CloudinaryError, HTTPException):
        logger.exception("Không thể xóa ảnh sản phẩm trên Cloudinary: %s", public_id)


def _get_product_or_404(db: Session, product_id: int) -> Product:
    product = (
        db.query(Product)
        .filter(Product.product_id == product_id)
        .first()
    )

    if product is None:
        raise CustomException(
            message="Không tìm thấy sản phẩm",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return product


def _validate_category(db: Session, category_id: int) -> None:
    category = (
        db.query(Category)
        .filter(Category.category_id == category_id)
        .first()
    )

    if category is None:
        raise CustomException(
            message="Không tìm thấy danh mục",
            status_code=status.HTTP_404_NOT_FOUND,
        )


def _validate_product_name(product_name: str) -> str:
    normalized_name = product_name.strip()
    if not normalized_name:
        raise CustomException(
            message="Tên sản phẩm không được để trống",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    return normalized_name


def _validate_sale_price(
    price: Decimal,
    sale_price: Decimal | None,
) -> None:
    if sale_price is not None and sale_price > price:
        raise CustomException(
            message="Giá khuyến mãi không được lớn hơn giá gốc",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


async def create_product(
    db: Session,
    data: ProductAddForm,
    file: UploadFile,
) -> Product:
    """Tạo sản phẩm và tải ảnh lên Cloudinary."""
    product_name = _validate_product_name(data.productName)
    _validate_category(db, data.categoryId)
    _validate_sale_price(data.price, data.salePrice)

    image_url, image_public_id = await _upload_product_image(file)
    product = Product(
        image_src=image_url,
        image_public_id=image_public_id,
        product_name=product_name,
        quantity=data.quantity,
        category_id=data.categoryId,
        price=data.price,
        sale_price=data.salePrice,
        description=data.description,
        origin=data.origin,
        brand=data.brand,
    )

    try:
        db.add(product)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        await _delete_uploaded_image(image_public_id)
        raise

    db.refresh(product)
    return product


async def update_product(
    db: Session,
    product_id: int,
    data: ProductAddForm,
    file: UploadFile | None = None,
) -> Product:
    """Thay thế thông tin sản phẩm, tùy chọn tải ảnh mới."""
    product = _get_product_or_404(db, product_id)
    product_name = _validate_product_name(data.productName)
    _validate_category(db, data.categoryId)
    _validate_sale_price(data.price, data.salePrice)

    new_image: tuple[str, str] | None = None
    if file is not None:
        new_image = await _upload_product_image(file)

    old_public_id = product.image_public_id
    product.product_name = product_name
    product.quantity = data.quantity
    product.category_id = data.categoryId
    product.price = data.price
    product.sale_price = data.salePrice
    product.description = data.description
    product.origin = data.origin
    product.brand = data.brand
    if new_image is not None:
        product.image_src, product.image_public_id = new_image

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        if new_image is not None:
            await _delete_uploaded_image(new_image[1])
        raise

    db.refresh(product)
    if new_image is not None and old_public_id:
        await _delete_uploaded_image(old_public_id)

    return product


async def patch_product(
    db: Session,
    product_id: int,
    data: ProductPatchForm,
    file: UploadFile | None = None,
) -> Product:
    """Cập nhật một phần thông tin sản phẩm, tùy chọn thay ảnh."""
    product = _get_product_or_404(db, product_id)
    updates = data.model_dump(exclude_unset=True)

    if not updates and file is None:
        raise CustomException(
            message="Cần cung cấp ít nhất một trường cần cập nhật hoặc ảnh mới",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    non_nullable_fields = ("productName", "quantity", "categoryId", "price")
    if any(field in updates and updates[field] is None for field in non_nullable_fields):
        raise CustomException(
            message="Tên, số lượng, danh mục và giá sản phẩm không được để trống",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if "categoryId" in updates and updates["categoryId"] is not None:
        _validate_category(db, updates["categoryId"])

    new_price = updates.get("price", product.price)
    new_sale_price = updates.get("salePrice", product.sale_price)
    _validate_sale_price(new_price, new_sale_price)

    new_image: tuple[str, str] | None = None
    if file is not None:
        new_image = await _upload_product_image(file)

    old_public_id = product.image_public_id
    field_mapping = {
        "productName": "product_name",
        "quantity": "quantity",
        "categoryId": "category_id",
        "price": "price",
        "salePrice": "sale_price",
        "description": "description",
        "origin": "origin",
        "brand": "brand",
    }

    for request_field, model_field in field_mapping.items():
        if request_field in updates:
            value = updates[request_field]
            if request_field == "productName":
                value = _validate_product_name(value)
            setattr(product, model_field, value)

    if new_image is not None:
        product.image_src, product.image_public_id = new_image

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        if new_image is not None:
            await _delete_uploaded_image(new_image[1])
        raise

    db.refresh(product)
    if new_image is not None and old_public_id:
        await _delete_uploaded_image(old_public_id)

    return product
