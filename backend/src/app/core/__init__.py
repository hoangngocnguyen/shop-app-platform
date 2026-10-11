"""
Core package chứa các thành phần cốt lõi của ứng dụng:
- response: Chuẩn hóa ApiResponse[T] và helper
- pagination: Chuẩn hóa phân trang PaginationParams, PaginatedResponse[T], paginate_query
- exceptions: Hệ thống Custom Exceptions và Global Exception Handlers
- deps: Centralized FastAPI dependencies (get_current_user, require_role,...)
- database: Kết nối PostgreSQL và SessionMaker
- config: Quản lý biến môi trường qua Pydantic Settings
"""

from src.app.core.database import Base, get_db
from src.app.core.deps import (
    get_current_user,
    get_current_user_id,
    require_any_role,
    require_role,
)
from src.app.core.exceptions import (
    AppException,
    BadRequestException,
    DuplicateException,
    ForbiddenException,
    InternalServerException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
    register_exception_handlers,
)
from src.app.core.pagination import (
    PaginatedResponse,
    PaginationParams,
    paginate_list,
    paginate_query,
)
from src.app.core.response import ApiResponse, success_response
from src.app.core.utils import slugify_vietnamese

__all__ = [
    "ApiResponse",
    "success_response",
    "PaginationParams",
    "PaginatedResponse",
    "paginate_list",
    "paginate_query",
    "AppException",
    "NotFoundException",
    "DuplicateException",
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "ValidationException",
    "InternalServerException",
    "register_exception_handlers",
    "get_db",
    "Base",
    "get_current_user",
    "get_current_user_id",
    "require_role",
    "require_any_role",
    "slugify_vietnamese",
]
