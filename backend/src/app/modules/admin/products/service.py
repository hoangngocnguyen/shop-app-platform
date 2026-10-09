from fastapi import status
from sqlalchemy.orm import Session

from src.app.core.exceptions import CustomException
from src.app.modules.admin.products.schema import (
    ProductAddForm,
    ProductUpdateForm,
    ProductPatchForm,
)
from src.app.modules.categories.model import Category
from src.app.modules.products.model import Product


def get_product_or_404(
    db: Session,
    product_id: int,
) -> Product:
    """Lấy sản phẩm theo ID, nếu không tồn tại thì báo lỗi."""

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise CustomException(
            message="Không tìm thấy sản phẩm",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return product


def validate_category(
    db: Session,
    category_id: int,
) -> None:
    """Kiểm tra danh mục có tồn tại hay không."""

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if category is None:
        raise CustomException(
            message="Không tìm thấy danh mục",
            status_code=status.HTTP_404_NOT_FOUND,
        )


def validate_sale_price(
    price,
    sale_price,
) -> None:
    """Kiểm tra giá khuyến mãi không lớn hơn giá gốc."""

    if sale_price is not None and sale_price > price:
        raise CustomException(
            message="Giá khuyến mãi không được lớn hơn giá gốc",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def create_product(
    db: Session,
    data: ProductAddForm,
) -> Product:
    """Tạo sản phẩm mới."""

    validate_category(db, data.categoryId)
    validate_sale_price(data.price, getattr(data, "salePrice", None))

    product = Product(
        image_src=str(data.imageSrc),
        product_name=data.productName.strip(),
        quantity=data.quantity,
        category_id=data.categoryId,
        price=data.price,
        sale_price=getattr(data, "salePrice", None),
        description=data.description,
        origin=data.origin,
        brand=data.brand,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def update_product(
    db: Session,
    product_id: int,
    data: ProductUpdateForm,
) -> Product:
    """Cập nhật toàn bộ thông tin sản phẩm."""

    product = get_product_or_404(db, product_id)

    validate_category(db, data.categoryId)
    validate_sale_price(data.price, data.salePrice)

    product.image_src = str(data.imageSrc)
    product.product_name = data.productName.strip()
    product.quantity = data.quantity
    product.category_id = data.categoryId
    product.price = data.price
    product.sale_price = data.salePrice
    product.description = data.description
    product.origin = data.origin
    product.brand = data.brand

    db.commit()
    db.refresh(product)

    return product


def patch_product(
    db: Session,
    product_id: int,
    data: ProductPatchForm,
) -> Product:
    """Cập nhật một phần thông tin sản phẩm."""

    product = get_product_or_404(db, product_id)

    updates = data.model_dump(exclude_unset=True)

    # Chỉ kiểm tra danh mục nếu request có gửi categoryId.
    if "categoryId" in updates and updates["categoryId"] is not None:
        validate_category(db, updates["categoryId"])

    # Kiểm tra giá mới dựa trên giá gốc và giá khuyến mãi hiện tại.
    new_price = updates.get("price", product.price)
    new_sale_price = updates.get("salePrice", product.sale_price)

    if new_price is not None and new_sale_price is not None:
        validate_sale_price(new_price, new_sale_price)

    field_mapping = {
        "imageSrc": "image_src",
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

            if request_field == "imageSrc" and value is not None:
                value = str(value)

            if request_field == "productName" and value is not None:
                value = value.strip()

            setattr(product, model_field, value)

    db.commit()
    db.refresh(product)

    return product