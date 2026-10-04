from sqlalchemy import select
from sqlalchemy.orm import Session

from src.app.core.exceptions import NotFoundException
from src.app.modules.categories.model import Category


class CategoryService:
    """
    Service xử lý nghiệp vụ danh mục sản phẩm (Categories).
    """

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
