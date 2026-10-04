import math
from typing import Generic, Sequence, TypeVar
from pydantic import BaseModel, Field
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

T = TypeVar("T")


class PaginationParams(BaseModel):
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Tham số Query Params chuẩn cho toàn bộ API phân trang.
    """

    page: int = Field(
        default=1,
        ge=1,
        description="Số trang hiện tại (bắt đầu từ 1)",
        examples=[1],
    )
    page_size: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Số lượng mục trên mỗi trang (1 - 100)",
        examples=[10],
    )

    @property
    def offset(self) -> int:
        """Tính toán vị trí offset trong câu truy vấn SQL"""
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Cấu trúc dữ liệu trả về cho danh sách có phân trang.
    """

    items: list[T] = Field(description="Danh sách dữ liệu của trang hiện tại")
    total: int = Field(description="Tổng số lượng bản ghi thỏa mãn điều kiện")
    page: int = Field(description="Trang hiện tại")
    page_size: int = Field(description="Số lượng bản ghi trên một trang")
    total_pages: int = Field(description="Tổng số trang")


def paginate_list(
    items: Sequence[T],
    total: int,
    page: int,
    page_size: int,
) -> PaginatedResponse[T]:
    """
    Hàm tiện ích gom nhóm mảng dữ liệu đã tính toán và trả về PaginatedResponse.
    # Bước 1: Tính toán tổng số trang dựa trên total và page_size
    # Bước 2: Bọc kết quả vào PaginatedResponse
    """
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedResponse[T](
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def paginate_query(
    db: Session,
    query: Select,
    pagination: PaginationParams,
) -> PaginatedResponse[T]:
    """
    Hàm tiện ích phân trang tự động từ SQLAlchemy 2.0 Select query.
    # Bước 1: Đếm tổng số bản ghi bằng câu lệnh count() tối ưu
    # Bước 2: Áp dụng offset và limit vào câu query chính
    # Bước 3: Thực thi query lấy danh sách items
    # Bước 4: Trả về PaginatedResponse chuẩn
    """
    # Đếm tổng số lượng bản ghi
    count_query = select(func.count()).select_from(query.subquery())
    total: int = db.scalar(count_query) or 0

    # Lấy dữ liệu phân trang
    paged_query = query.offset(pagination.offset).limit(pagination.page_size)
    items = list(db.scalars(paged_query).all())

    # Tính toán tổng số trang
    total_pages = math.ceil(total / pagination.page_size) if total > 0 else 1

    return PaginatedResponse[T](
        items=items,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=total_pages,
    )
