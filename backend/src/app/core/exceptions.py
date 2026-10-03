import time
from typing import Any, cast

import cloudinary.exceptions
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


# ==============================================================================
# 1. CẤU TRÚC PHẢN HỒI LỖI CHUẨN HÓA (ERROR RESPONSE DTO)
# ==============================================================================
class ErrorResponse(BaseModel):
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Cấu trúc phản hồi lỗi JSON đồng nhất cho Client.
    - success: Luôn bằng False khi có lỗi
    - error_code: Mã định danh lỗi (VD: NOT_FOUND, DUPLICATE_ENTRY, FORBIDDEN,...)
    - message: Thông báo lỗi thân thiện hiển thị cho người dùng
    - data: Luôn là None khi lỗi
    - errors: Chi tiết lỗi theo từng field (nếu có validation)
    - timestamp: Thời điểm xảy ra lỗi (Epoch milliseconds)
    """

    success: bool = Field(default=False, description="Trạng thái thực thi thất bại")
    error_code: str = Field(
        default="BUSINESS_ERROR", description="Mã phân loại lỗi hệ thống"
    )
    message: str = Field(description="Mô tả thông báo lỗi")
    data: Any | None = Field(default=None, description="Payload dữ liệu trả về")
    errors: dict[str, str] | None = Field(
        default_factory=dict, description="Chi tiết lỗi theo từng trường dữ liệu"
    )
    timestamp: int = Field(default_factory=lambda: int(time.time() * 1000))


# [REFACTOR COMPATIBILITY: Giữ lại alias ApiError để tương thích ngược với code cũ]
ApiError = ErrorResponse


# ==============================================================================
# 2. HỆ THỐNG CUSTOM EXCEPTIONS (EXCEPTION HIERARCHY)
# ==============================================================================
class AppException(Exception):
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Exception cha cho toàn bộ lỗi nghiệp vụ trong hệ thống.
    """

    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        message: str = "Đã xảy ra lỗi nghiệp vụ",
        error_code: str = "BUSINESS_ERROR",
        errors: dict[str, str] | None = None,
    ):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        self.errors = errors or {}
        super().__init__(message)


class NotFoundException(AppException):
    """Ngoại lệ khi không tìm thấy tài nguyên (404 Not Found)"""

    def __init__(
        self,
        resource: str = "Tài nguyên",
        id_or_slug: Any = None,
        message: str | None = None,
    ):
        msg = message or (
            f"{resource} '{id_or_slug}' không tồn tại trong hệ thống"
            if id_or_slug is not None
            else f"{resource} không tồn tại"
        )
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=msg,
            error_code="NOT_FOUND",
        )


class DuplicateException(AppException):
    """Ngoại lệ khi dữ liệu bị trùng lặp (400 Bad Request / 409 Conflict)"""

    def __init__(
        self,
        field: str = "Dữ liệu",
        value: Any = None,
        message: str | None = None,
    ):
        msg = message or (
            f"{field} '{value}' đã tồn tại trong hệ thống"
            if value is not None
            else f"{field} đã tồn tại trong hệ thống"
        )
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=msg,
            error_code="DUPLICATE_ENTRY",
        )


class BadRequestException(AppException):
    """Ngoại lệ dữ liệu hoặc logic nghiệp vụ không hợp lệ (400 Bad Request)"""

    def __init__(
        self,
        message: str = "Yêu cầu không hợp lệ",
        error_code: str = "BAD_REQUEST",
        errors: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code=error_code,
            errors=errors,
        )


class UnauthorizedException(AppException):
    """Ngoại lệ khi chưa xác thực hoặc token không hợp lệ / hết hạn (401 Unauthorized)"""

    def __init__(
        self,
        message: str = "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
        error_code: str = "UNAUTHORIZED",
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            error_code=error_code,
        )


class ForbiddenException(AppException):
    """Ngoại lệ khi người dùng không đủ quyền truy cập tài nguyên (403 Forbidden)"""

    def __init__(
        self,
        message: str = "Bạn không có quyền thực hiện hành động này",
        error_code: str = "FORBIDDEN",
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            error_code=error_code,
        )


class ValidationException(AppException):
    """Ngoại lệ dữ liệu không hợp lệ qua validation (422 Unprocessable Entity)"""

    def __init__(
        self,
        message: str = "Dữ liệu đầu vào không hợp lệ",
        errors: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message=message,
            error_code="VALIDATION_ERROR",
            errors=errors,
        )


class InternalServerException(AppException):
    """Ngoại lệ lỗi nội bộ hệ thống (500 Internal Server Error)"""

    def __init__(
        self,
        message: str = "Có lỗi hệ thống xảy ra, vui lòng thử lại sau.",
        error_code: str = "INTERNAL_SERVER_ERROR",
    ):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message=message,
            error_code=error_code,
        )


# ==============================================================================
# 3. ALIAS TƯƠNG THÍCH MÃ NGUỒN CŨ (BACKWARD COMPATIBILITY)
# ==============================================================================
# [REFACTOR: CustomException -> AppException]
CustomException = AppException

# [REFACTOR: ResourceNotFoundException -> NotFoundException]
ResourceNotFoundException = NotFoundException

# [REFACTOR: UnauthorizedAccessException -> ForbiddenException]
UnauthorizedAccessException = ForbiddenException


# ==============================================================================
# 4. RESPONSE BUILDER & EXCEPTION HANDLERS
# ==============================================================================
def build_api_error_response(
    status_code: int,
    message: str,
    error_code: str = "BUSINESS_ERROR",
    errors: dict[str, str] | None = None,
) -> JSONResponse:
    """Hàm tiện ích tạo JSONResponse theo ErrorResponse DTO chuẩn"""
    error_payload = ErrorResponse(
        success=False,
        error_code=error_code,
        message=message,
        data=None,
        errors=errors or {},
    )
    return JSONResponse(status_code=status_code, content=error_payload.model_dump())


async def app_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Bắt các ngoại lệ kế thừa từ AppException"""
    app_exc = cast(AppException, exc)
    return build_api_error_response(
        status_code=app_exc.status_code,
        message=app_exc.message,
        error_code=app_exc.error_code,
        errors=app_exc.errors,
    )


# [REFACTOR COMPATIBILITY: custom_exception_handler trỏ về app_exception_handler]
custom_exception_handler = app_exception_handler


async def validation_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Bắt lỗi RequestValidationError từ Pydantic V2"""
    val_exc = cast(RequestValidationError, exc)
    errors_dict: dict[str, str] = {}

    for err in val_exc.errors():
        loc_path = [str(loc) for loc in err.get("loc", []) if loc != "body"]
        field_name = ".".join(loc_path) or "request"
        errors_dict[field_name] = err.get("msg", "Dữ liệu không hợp lệ")

    return build_api_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Dữ liệu đầu vào không hợp lệ",
        error_code="VALIDATION_ERROR",
        errors=errors_dict,
    )


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Bắt lỗi HTTPException chuẩn từ FastAPI / Starlette"""
    http_exc = cast(StarletteHTTPException, exc)
    error_code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        422: "UNPROCESSABLE_ENTITY",
        500: "INTERNAL_SERVER_ERROR",
    }
    error_code = error_code_map.get(http_exc.status_code, "HTTP_ERROR")
    return build_api_error_response(
        status_code=http_exc.status_code,
        message=str(http_exc.detail),
        error_code=error_code,
    )


async def cloudinary_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Bắt lỗi từ Cloudinary SDK"""
    cloud_exc = cast(cloudinary.exceptions.Error, exc)
    return build_api_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message=f"Lỗi dịch vụ lưu trữ ảnh Cloudinary: {cloud_exc!s}",
        error_code="CLOUDINARY_ERROR",
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Bắt toàn bộ exception chưa được xử lý (500 Internal Server Error)"""
    return build_api_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Có lỗi hệ thống nội bộ xảy ra, vui lòng liên hệ quản trị viên.",
        error_code="INTERNAL_SERVER_ERROR",
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    [CHUẨN HÓA TOÀN DỰ ÁN]: Đăng ký toàn bộ exception handlers tập trung vào FastAPI instance.
    """
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(
        cloudinary.exceptions.Error, cloudinary_exception_handler
    )
    app.add_exception_handler(Exception, global_exception_handler)
