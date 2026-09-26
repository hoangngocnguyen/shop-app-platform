import time
from typing import cast

import cloudinary.exceptions
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


# --- ApiError DTO ---
class ApiError(BaseModel):
    message: str
    status: int
    errors: dict[str, str] | None = Field(default_factory=dict)
    timestamp: int = Field(default_factory=lambda: int(time.time() * 1000))


# --- Custom Exceptions ---
class CustomException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        errors: dict[str, str] | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.errors = errors or {}


class ResourceNotFoundException(CustomException):
    def __init__(self, message: str = "Tài nguyên không tồn tại"):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)


class UnauthorizedAccessException(CustomException):
    def __init__(self, message: str = "Không có quyền truy cập"):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)


# --- Response Helper ---
def build_api_error_response(
    status_code: int,
    message: str,
    errors: dict[str, str] | None = None,
) -> JSONResponse:
    api_error = ApiError(message=message, status=status_code, errors=errors or {})
    return JSONResponse(status_code=status_code, content=api_error.model_dump())


# --- Exception Handlers ---
async def custom_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    custom_exc = cast(CustomException, exc)
    return build_api_error_response(
        status_code=custom_exc.status_code,
        message=custom_exc.message,
        errors=custom_exc.errors,
    )


async def validation_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    val_exc = cast(RequestValidationError, exc)
    errors_dict: dict[str, str] = {}

    for err in val_exc.errors():
        loc_path = [str(loc) for loc in err.get("loc", []) if loc != "body"]
        field_name = ".".join(loc_path) or "request"
        errors_dict[field_name] = err.get("msg", "Dữ liệu không hợp lệ")

    return build_api_error_response(
        status_code=status.HTTP_400_BAD_REQUEST,
        message="Dữ liệu không hợp lệ",
        errors=errors_dict,
    )


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    http_exc = cast(StarletteHTTPException, exc)
    return build_api_error_response(
        status_code=http_exc.status_code,
        message=str(http_exc.detail),
    )


async def cloudinary_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    cloud_exc = cast(cloudinary.exceptions.Error, exc)
    return build_api_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message=f"Lỗi dịch vụ lưu trữ ảnh: {cloud_exc!s}",
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return build_api_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Có lỗi hệ thống xảy ra, vui lòng thử lại sau.",
    )
