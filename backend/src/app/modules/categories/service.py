import math
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from src.app.core.exceptions import (
    BadRequestException,
    DuplicateException,
    NotFoundException,
)
from src.app.core.pagination import PaginatedResponse, PaginationParams
from src.app.core.utils import slugify_vietnamese
from src.app.modules.categories.model import Category
from src.app.modules.categories.schema import (
    CategoryCreate,
    CategoryStatsDTO,
    CategoryUpdate,
)
from src.app.modules.products.model import Product


class CategoryService:
    """
    Service xử lý nghiệp vụ danh mục sản phẩm (Categories) cho cả Public và Admin.
    """

    # ==========================================================================
    # 1. PUBLIC APIS
    # ==========================================================================
    @staticmethod
    def get_public_categories(
        db: Session, parent_id: int | None = None
    ) -> list[Category]:
        """
        Lấy danh sách danh mục phục vụ Client (Header, Navigation Menu).
        - Nếu truyền parent_id: Lọc danh mục con theo parent_id.
        - Nếu không truyền parent_id: Lấy tất cả danh mục sắp xếp theo thứ tự ID.
        """
        # Bước 1: Khởi tạo câu truy vấn SQLAlchemy 2.0 select
        query = select(Category).order_by(Category.category_id.asc())

        # Bước 2: Áp dụng điều kiện lọc theo parent_id nếu có
        if parent_id is not None:
            query = query.where(Category.parent_id == parent_id)

        # Bước 3: Thực thi truy vấn lấy toàn bộ danh sách
        categories = list(db.scalars(query).all())

        # Bước 4: Trả về danh sách Entity
        return categories

    @staticmethod
    def get_category_by_slug(db: Session, slug: str) -> Category:
        """
        Tra cứu chi tiết danh mục theo đường dẫn tĩnh SEO (slug).
        """
        # Bước 1: Tạo câu truy vấn tìm danh mục theo slug
        query = select(Category).where(Category.slug == slug.strip().lower())

        # Bước 2: Thực thi lấy bản ghi đầu tiên khớp điều kiện
        category = db.scalar(query)

        # Bước 3: Kiểm tra tồn tại, nếu không có ném NotFoundException (HTTP 404)
        if not category:
            raise NotFoundException(
                resource="Danh mục",
                id_or_slug=slug,
                message=f"Không tìm thấy danh mục với đường dẫn '{slug}'",
            )

        # Bước 4: Trả về đối tượng Category tìm thấy
        return category

    # ==========================================================================
    # 2. ADMIN APIS
    # ==========================================================================
    @staticmethod
    def get_admin_categories(
        db: Session,
        pagination: PaginationParams,
        search: str | None = None,
        sort_by: str = "id_desc",
    ) -> PaginatedResponse[CategoryStatsDTO]:
        """
        Lấy danh sách danh mục có phân trang, tìm kiếm và tính kèm số lượng sản phẩm.
        """
        # Bước 1: Tạo câu truy vấn cơ sở Join Product để đếm product_count
        base_query = (
            select(
                Category.category_id,
                Category.category_name,
                Category.parent_id,
                Category.slug,
                func.count(Product.product_id).label("product_count"),
            )
            .outerjoin(Product, Category.category_id == Product.category_id)
            .group_by(Category.category_id)
        )

        # Bước 2: Áp dụng tìm kiếm theo tên nếu có
        count_query = select(func.count(Category.category_id))
        if search and search.strip():
            search_keyword = f"%{search.strip()}%"
            base_query = base_query.where(Category.category_name.ilike(search_keyword))
            count_query = count_query.where(Category.category_name.ilike(search_keyword))

        # Bước 3: Sắp xếp dữ liệu theo sort_by
        if sort_by == "name_asc":
            base_query = base_query.order_by(Category.category_name.asc())
        elif sort_by == "name_desc":
            base_query = base_query.order_by(Category.category_name.desc())
        else:
            base_query = base_query.order_by(Category.category_id.desc())

        # Bước 4: Đếm tổng số lượng bản ghi và thực thi phân trang
        total: int = db.scalar(count_query) or 0
        paged_query = base_query.offset(pagination.offset).limit(pagination.page_size)
        rows = db.execute(paged_query).all()

        # Bước 5: Chuyển đổi kết quả sang CategoryStatsDTO
        items = [
            CategoryStatsDTO(
                category_id=r.category_id,
                category_name=r.category_name,
                parent_id=r.parent_id,
                slug=r.slug,
                product_count=r.product_count,
            )
            for r in rows
        ]

        total_pages = math.ceil(total / pagination.page_size) if total > 0 else 1

        return PaginatedResponse[CategoryStatsDTO](
            items=items,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages,
        )

    @staticmethod
    def create_category(db: Session, payload: CategoryCreate) -> Category:
        """
        Tạo mới danh mục sản phẩm (Admin). Tự động tạo slug và kiểm tra tính duy nhất.
        """
        # Bước 1: Chuẩn hóa tên và tự động sinh slug không dấu
        category_name = payload.category_name.strip()
        slug = slugify_vietnamese(category_name)

        # Bước 2: Kiểm tra tính duy nhất của tên và slug
        existing = db.scalar(
            select(Category).where(
                (Category.category_name == category_name) | (Category.slug == slug)
            )
        )
        if existing:
            raise DuplicateException(
                field="Tên danh mục hoặc slug",
                value=category_name,
                message="Tên danh mục hoặc slug đã tồn tại trong hệ thống",
            )

        # Bước 3: Kiểm tra danh mục cha nếu có
        if payload.parent_id is not None:
            parent = db.scalar(
                select(Category).where(Category.category_id == payload.parent_id)
            )
            if not parent:
                raise NotFoundException(
                    resource="Danh mục cha",
                    id_or_slug=payload.parent_id,
                    message=f"Danh mục cha với ID {payload.parent_id} không tồn tại",
                )

        # Bước 4: Tạo thực thể mới và lưu vào cơ sở dữ liệu
        new_category = Category(
            category_name=category_name,
            parent_id=payload.parent_id,
            slug=slug,
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return new_category

    @staticmethod
    def update_category(
        db: Session, category_id: int, payload: CategoryUpdate
    ) -> Category:
        """
        Cập nhật danh mục sản phẩm (Admin).
        """
        # Bước 1: Tra cứu danh mục cần cập nhật
        category = db.scalar(
            select(Category).where(Category.category_id == category_id)
        )
        if not category:
            raise NotFoundException(
                resource="Danh mục",
                id_or_slug=category_id,
                message=f"Không tìm thấy danh mục với ID {category_id}",
            )

        # Bước 2: Cập nhật tên và kiểm tra trùng lặp nếu có thay đổi tên
        if payload.category_name is not None:
            new_name = payload.category_name.strip()
            new_slug = slugify_vietnamese(new_name)

            duplicate = db.scalar(
                select(Category).where(
                    Category.category_id != category_id,
                    (Category.category_name == new_name) | (Category.slug == new_slug),
                )
            )
            if duplicate:
                raise DuplicateException(
                    field="Tên danh mục hoặc slug",
                    value=new_name,
                    message="Tên danh mục hoặc slug đã tồn tại ở danh mục khác",
                )
            category.category_name = new_name
            category.slug = new_slug

        # Bước 3: Cập nhật parent_id nếu có
        if payload.parent_id is not None:
            if payload.parent_id == category_id:
                raise BadRequestException(
                    message="Danh mục cha không thể là chính danh mục đang cập nhật",
                    error_code="INVALID_PARENT_ID",
                )
            parent = db.scalar(
                select(Category).where(Category.category_id == payload.parent_id)
            )
            if not parent:
                raise NotFoundException(
                    resource="Danh mục cha",
                    id_or_slug=payload.parent_id,
                    message=f"Danh mục cha với ID {payload.parent_id} không tồn tại",
                )
            category.parent_id = payload.parent_id

        # Bước 4: Lưu thay đổi
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete_category(db: Session, category_id: int) -> None:
        """
        Xóa đơn lẻ danh mục. Chặn xóa nếu còn sản phẩm hoặc danh mục con.
        """
        # Bước 1: Tìm danh mục cần xóa
        category = db.scalar(
            select(Category).where(Category.category_id == category_id)
        )
        if not category:
            raise NotFoundException(
                resource="Danh mục",
                id_or_slug=category_id,
                message=f"Không tìm thấy danh mục với ID {category_id}",
            )

        # Bước 2: Kiểm tra ràng buộc xem danh mục có đang chứa sản phẩm không
        product_count: int = (
            db.scalar(
                select(func.count(Product.product_id)).where(
                    Product.category_id == category_id
                )
            )
            or 0
        )
        if product_count > 0:
            raise BadRequestException(
                message=f"Không thể xóa danh mục '{category.category_name}' vì đang chứa {product_count} sản phẩm",
                error_code="CATEGORY_HAS_PRODUCTS",
            )

        # Bước 3: Kiểm tra ràng buộc danh mục con
        child_count: int = (
            db.scalar(
                select(func.count(Category.category_id)).where(
                    Category.parent_id == category_id
                )
            )
            or 0
        )
        if child_count > 0:
            raise BadRequestException(
                message=f"Không thể xóa danh mục '{category.category_name}' vì đang chứa {child_count} danh mục con",
                error_code="CATEGORY_HAS_CHILDREN",
            )

        # Bước 4: Thực hiện xóa và commit
        db.delete(category)
        db.commit()

    @staticmethod
    def bulk_delete_categories(db: Session, category_ids: list[int]) -> int:
        """
        Xóa hàng loạt danh mục trong một Database Transaction duy nhất.
        Nếu bất kỳ danh mục nào chứa sản phẩm -> Rollback toàn bộ transaction.
        """
        # Bước 1: Lấy danh sách các danh mục theo danh sách ID
        categories = list(
            db.scalars(
                select(Category).where(Category.category_id.in_(category_ids))
            ).all()
        )

        if not categories:
            raise NotFoundException(
                resource="Danh mục",
                id_or_slug=category_ids,
                message="Không tìm thấy danh mục nào trong danh sách yêu cầu xóa",
            )

        # Bước 2: Kiểm tra từng danh mục xem có sản phẩm hoặc danh mục con không
        for cat in categories:
            prod_count: int = (
                db.scalar(
                    select(func.count(Product.product_id)).where(
                        Product.category_id == cat.category_id
                    )
                )
                or 0
            )
            if prod_count > 0:
                raise BadRequestException(
                    message=f"Không thể xóa vì danh mục '{cat.category_name}' (ID: {cat.category_id}) đang chứa {prod_count} sản phẩm",
                    error_code="CATEGORY_HAS_PRODUCTS",
                )

            child_count: int = (
                db.scalar(
                    select(func.count(Category.category_id)).where(
                        Category.parent_id == cat.category_id
                    )
                )
                or 0
            )
            if child_count > 0:
                raise BadRequestException(
                    message=f"Không thể xóa vì danh mục '{cat.category_name}' (ID: {cat.category_id}) đang chứa {child_count} danh mục con",
                    error_code="CATEGORY_HAS_CHILDREN",
                )

        # Bước 3: Thực hiện xóa hàng loạt trong cùng 1 transaction
        deleted_count = len(categories)
        db.execute(
            delete(Category).where(
                Category.category_id.in_([c.category_id for c in categories])
            )
        )
        db.commit()

        # Bước 4: Trả về số lượng danh mục đã xóa thành công
        return deleted_count
