from decimal import Decimal
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, joinedload

from src.app.core.exceptions import (
    BadRequestException,
    NotFoundException,
)
from src.app.core.pagination import PaginatedResponse, PaginationParams, paginate_query
from src.app.modules.categories.model import Category
from src.app.modules.orders.model import OrderDetail
from src.app.modules.products.model import Product
from src.app.modules.products.schema import (
    PriceOptionDTO,
    ProductCreate,
    ProductUpdate,
)

PRICE_OPTIONS_CONFIG: list[dict] = [
    {"key": "duoi-500k", "label": "Dưới 500.000đ", "min": Decimal("0"), "max": Decimal("500000")},
    {"key": "500k-1trieu", "label": "500.000đ - 1.000.000đ", "min": Decimal("500000"), "max": Decimal("1000000")},
    {"key": "1trieu-3trieu", "label": "1.000.000đ - 3.000.000đ", "min": Decimal("1000000"), "max": Decimal("3000000")},
    {"key": "3trieu-5trieu", "label": "3.000.000đ - 5.000.000đ", "min": Decimal("3000000"), "max": Decimal("5000000")},
    {"key": "tren-5trieu", "label": "Trên 5.000.000đ", "min": Decimal("5000000"), "max": None},
]


class ProductService:
    """
    Service xử lý nghiệp vụ sản phẩm (Products) cho cả Client và Admin.
    """

    # ==========================================================================
    # 1. PUBLIC APIS
    # ==========================================================================
    @staticmethod
    def get_public_products(
        db: Session,
        pagination: PaginationParams,
        category_slug: str | None = None,
        search: str | None = None,
        price_option: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        sort_by: str = "newest",
    ) -> PaginatedResponse[Product]:
        """
        Lọc và tìm kiếm danh sách sản phẩm nâng cao phía Client.
        """
        # Bước 1: Khởi tạo câu truy vấn cơ bản và eager-load quan hệ danh mục
        query = select(Product).options(joinedload(Product.category))

        # Bước 2: Lọc theo danh mục nếu có category_slug
        if category_slug and category_slug.strip():
            query = query.join(Category, Product.category_id == Category.category_id).where(
                Category.slug == category_slug.strip().lower()
            )

        # Bước 3: Tìm kiếm từ khóa theo tên sản phẩm
        if search and search.strip():
            query = query.where(Product.product_name.ilike(f"%{search.strip()}%"))

        # Bước 4: Lọc theo dải giá (ưu tiên price_option, sau đó đến min_price/max_price)
        effective_price = func.coalesce(Product.sale_price, Product.price)
        selected_option = next((opt for opt in PRICE_OPTIONS_CONFIG if opt["key"] == price_option), None)

        if selected_option:
            if selected_option["min"] is not None:
                query = query.where(effective_price >= selected_option["min"])
            if selected_option["max"] is not None:
                query = query.where(effective_price <= selected_option["max"])
        else:
            if min_price is not None:
                query = query.where(effective_price >= min_price)
            if max_price is not None:
                query = query.where(effective_price <= max_price)

        # Bước 5: Sắp xếp kết quả theo tiêu chí sort_by
        if sort_by == "price_asc":
            query = query.order_by(effective_price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(effective_price.desc())
        elif sort_by == "best_seller":
            query = query.order_by(Product.sold.desc())
        else:
            query = query.order_by(Product.product_id.desc())

        # Bước 6: Thực thi phân trang tự động bằng paginate_query
        return paginate_query(db=db, query=query, pagination=pagination)

    @staticmethod
    def get_price_options() -> list[PriceOptionDTO]:
        """
        Trả về danh sách các dải giá cố định cho Client render bộ lọc nhanh.
        """
        return [
            PriceOptionDTO(
                key=opt["key"],
                label=opt["label"],
                min=opt["min"],
                max=opt["max"],
            )
            for opt in PRICE_OPTIONS_CONFIG
        ]

    @staticmethod
    def get_product_detail(db: Session, product_id: int) -> Product:
        """
        Tra cứu chi tiết một sản phẩm theo ID kèm thông tin danh mục cha.
        """
        # Bước 1: Query tìm sản phẩm với eager-load danh mục
        query = (
            select(Product)
            .options(joinedload(Product.category))
            .where(Product.product_id == product_id)
        )
        product = db.scalar(query)

        # Bước 2: Kiểm tra tồn tại, nếu không có ném 404 Not Found
        if not product:
            raise NotFoundException(
                resource="Sản phẩm",
                id_or_slug=product_id,
                message=f"Không tìm thấy sản phẩm với ID {product_id}",
            )

        return product

    @staticmethod
    def get_related_products(
        db: Session, product_id: int, limit: int = 4
    ) -> list[Product]:
        """
        Lấy danh sách các sản phẩm liên quan cùng danh mục (loại trừ chính sản phẩm đang xem).
        """
        # Bước 1: Lấy chi tiết sản phẩm hiện tại để biết category_id
        current_product = ProductService.get_product_detail(db=db, product_id=product_id)

        # Bước 2: Truy vấn các sản phẩm cùng danh mục khác
        query = (
            select(Product)
            .options(joinedload(Product.category))
            .where(
                Product.category_id == current_product.category_id,
                Product.product_id != product_id,
            )
            .order_by(Product.sold.desc(), Product.product_id.desc())
            .limit(limit)
        )

        return list(db.scalars(query).all())

    # ==========================================================================
    # 2. ADMIN APIS
    # ==========================================================================
    @staticmethod
    def get_admin_products(
        db: Session,
        pagination: PaginationParams,
        category_id: int | None = None,
        search: str | None = None,
        stock_status: str = "all",
        sort_by: str = "id_desc",
    ) -> PaginatedResponse[Product]:
        """
        Lấy danh sách sản phẩm quản trị kèm bộ lọc kho hàng và sắp xếp.
        """
        # Bước 1: Khởi tạo query và eager-load danh mục
        query = select(Product).options(joinedload(Product.category))

        # Bước 2: Áp dụng lọc theo category_id nếu có
        if category_id is not None:
            query = query.where(Product.category_id == category_id)

        # Bước 3: Áp dụng tìm kiếm theo tên sản phẩm
        if search and search.strip():
            query = query.where(Product.product_name.ilike(f"%{search.strip()}%"))

        # Bước 4: Áp dụng lọc theo trạng thái tồn kho (stock_status)
        if stock_status == "in_stock":
            query = query.where(Product.quantity > 5)
        elif stock_status == "low_stock":
            query = query.where(Product.quantity > 0, Product.quantity <= 5)
        elif stock_status == "out_of_stock":
            query = query.where(Product.quantity == 0)

        # Bước 5: Sắp xếp theo sort_by
        effective_price = func.coalesce(Product.sale_price, Product.price)
        if sort_by == "price_asc":
            query = query.order_by(effective_price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(effective_price.desc())
        elif sort_by == "quantity_asc":
            query = query.order_by(Product.quantity.asc())
        elif sort_by == "quantity_desc":
            query = query.order_by(Product.quantity.desc())
        else:
            query = query.order_by(Product.product_id.desc())

        # Bước 6: Phân trang
        return paginate_query(db=db, query=query, pagination=pagination)

    @staticmethod
    def create_product(db: Session, payload: ProductCreate) -> Product:
        """
        Thêm mới sản phẩm (Admin). Kiểm tra danh mục và tính % giảm giá tự động.
        """
        # Bước 1: Kiểm tra category_id có tồn tại không
        category = db.scalar(
            select(Category).where(Category.category_id == payload.category_id)
        )
        if not category:
            raise NotFoundException(
                resource="Danh mục",
                id_or_slug=payload.category_id,
                message=f"Danh mục trực thuộc với ID {payload.category_id} không tồn tại",
            )

        # Bước 2: Kiểm tra ràng buộc giá khuyến mãi và tính % giảm giá
        sale_price = payload.sale_price if payload.sale_price is not None else payload.price
        if sale_price > payload.price:
            raise BadRequestException(
                message="Giá khuyến mãi (sale_price) không thể lớn hơn giá gốc (price)",
                error_code="INVALID_PRICE_RANGE",
            )

        discount_percent = 0
        if payload.price > 0 and sale_price < payload.price:
            discount_percent = int(round((1 - float(sale_price) / float(payload.price)) * 100))

        # Bước 3: Tạo thực thể Product và lưu DB
        product_data = payload.model_dump()
        product_data["sale_price"] = sale_price
        product_data["discount_percent"] = discount_percent

        new_product = Product(**product_data)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return new_product

    @staticmethod
    def update_product(
        db: Session, product_id: int, payload: ProductUpdate
    ) -> Product:
        """
        Cập nhật thông tin sản phẩm (Admin). Tự động cập nhật lại % giảm giá.
        """
        # Bước 1: Tìm sản phẩm cần cập nhật
        product = ProductService.get_product_detail(db=db, product_id=product_id)

        # Bước 2: Kiểm tra category_id mới nếu có truyền
        if payload.category_id is not None:
            category = db.scalar(
                select(Category).where(Category.category_id == payload.category_id)
            )
            if not category:
                raise NotFoundException(
                    resource="Danh mục",
                    id_or_slug=payload.category_id,
                    message=f"Danh mục trực thuộc với ID {payload.category_id} không tồn tại",
                )
            product.category_id = payload.category_id

        # Bước 3: Cập nhật giá và tính lại discount_percent
        new_price = payload.price if payload.price is not None else product.price
        new_sale_price = payload.sale_price if payload.sale_price is not None else product.sale_price

        if new_sale_price is not None and new_price is not None:
            if new_sale_price > new_price:
                raise BadRequestException(
                    message="Giá khuyến mãi (sale_price) không thể lớn hơn giá gốc (price)",
                    error_code="INVALID_PRICE_RANGE",
                )
            if new_price > 0 and new_sale_price < new_price:
                product.discount_percent = int(round((1 - float(new_sale_price) / float(new_price)) * 100))
            else:
                product.discount_percent = 0

        # Bước 4: Cập nhật các trường dữ liệu khác
        update_data = payload.model_dump(exclude_unset=True, exclude={"category_id"})
        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> None:
        """
        Xóa đơn lẻ sản phẩm. Kiểm tra ràng buộc lịch sử đơn hàng trước khi xóa.
        """
        # Bước 1: Tra cứu sản phẩm
        product = ProductService.get_product_detail(db=db, product_id=product_id)

        # Bước 2: Kiểm tra ràng buộc khóa ngoại với bảng order_details
        order_count: int = (
            db.scalar(
                select(func.count(OrderDetail.order_detail_id)).where(
                    OrderDetail.product_id == product_id
                )
            )
            or 0
        )
        if order_count > 0:
            raise BadRequestException(
                message=f"Không thể xóa sản phẩm '{product.product_name}' vì đã có trong {order_count} chi tiết đơn hàng lịch sử",
                error_code="PRODUCT_IN_ORDERS",
            )

        # Bước 3: Xóa sản phẩm và commit
        db.delete(product)
        db.commit()

    @staticmethod
    def bulk_delete_products(db: Session, product_ids: list[int]) -> int:
        """
        Xóa hàng loạt sản phẩm trong 1 Database Transaction duy nhất.
        """
        # Bước 1: Lấy danh sách sản phẩm theo danh sách ID
        products = list(
            db.scalars(
                select(Product).where(Product.product_id.in_(product_ids))
            ).all()
        )
        if not products:
            raise NotFoundException(
                resource="Sản phẩm",
                id_or_slug=product_ids,
                message="Không tìm thấy sản phẩm nào trong danh sách yêu cầu xóa",
            )

        # Bước 2: Kiểm tra xem có sản phẩm nào đã từng nằm trong đơn hàng không
        order_details_exist = list(
            db.scalars(
                select(OrderDetail.product_id).where(
                    OrderDetail.product_id.in_(product_ids)
                )
            ).all()
        )
        if order_details_exist:
            unique_ids = list(set(order_details_exist))
            raise BadRequestException(
                message=f"Không thể xóa hàng loạt vì các sản phẩm có ID {unique_ids} đã tồn tại trong lịch sử đơn hàng",
                error_code="PRODUCT_IN_ORDERS",
            )

        # Bước 3: Thực thi xóa hàng loạt
        deleted_count = len(products)
        db.execute(
            delete(Product).where(
                Product.product_id.in_([p.product_id for p in products])
            )
        )
        db.commit()

        return deleted_count
