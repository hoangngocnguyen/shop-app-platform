from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Cấu trúc phản hồi JSON đồng nhất cho toàn bộ API.
    - success: Trạng thái thành công (True/False)
    - message: Thông điệp phản hồi thân thiện với người dùng
    - data: Payload dữ liệu thực tế (hoặc None khi không có dữ liệu trả về)
    """

    success: bool = Field(default=True, description="Trạng thái thực thi API")
    message: str = Field(default="Thành công", description="Thông điệp phản hồi")
    data: T | None = Field(default=None, description="Dữ liệu trả về")


def success_response(
    data: T | None = None, message: str = "Thành công"
) -> ApiResponse[T]:
    """
    Hàm tiện ích tạo nhanh đối tượng ApiResponse thành công.
    # Bước 1: Khởi tạo ApiResponse với success=True
    # Bước 2: Trả về instance đã bọc dữ liệu
    """
    return ApiResponse[T](success=True, message=message, data=data)
