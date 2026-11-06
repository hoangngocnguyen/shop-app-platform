from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role
from src.app.core.response import ApiResponse, success_response
from src.app.modules.admin.users import schema, service

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin - Quản lý người dùng"],
    dependencies=[Depends(require_role("ADMIN"))],
)


@router.get(
    "",
    response_model=ApiResponse[schema.UserListResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách người dùng",
    description="Lấy danh sách người dùng có hỗ trợ phân trang, tìm kiếm theo từ khóa và lọc theo vai trò, trạng thái tài khoản.",
    response_description="Danh sách người dùng cùng thông tin phân trang.",
)
def get_users(
    page: int = Query(0, ge=0, description="Số trang, mặc định = 0"),
    page_size: int = Query(10, ge=1, le=100, description="Số lượng bản ghi mỗi trang, mặc định = 10"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, email, sđt hoặc userId"),
    role: Optional[schema.UserRole] = Query(None, description="Lọc theo vai trò (ADMIN, CUSTOMER, STAFF)"),
    status_filter: Optional[schema.UserStatus] = Query(None, alias="status", description="Lọc theo trạng thái (ACTIVE, BLOCKED)"),
    sortBy: str = Query("createdAt", description="Trường sắp xếp (createdAt, fullName, email)"),
    sortDir: schema.SortDirection = Query(schema.SortDirection.DESC, description="Chiều sắp xếp: asc hoặc desc"),
    db: Session = Depends(get_db),
):
    result = service.get_users_paginated(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        role=role.value if role else None,
        status_filter=status_filter.value if status_filter else None,
        sort_by=sortBy,
        sort_dir=getattr(sortDir, "value", sortDir),
    )
    return success_response(data=result, message="Lấy danh sách người dùng thành công")


@router.post(
    "",
    response_model=ApiResponse[schema.UserDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo người dùng mới",
    description="Admin tạo trực tiếp một tài khoản người dùng mới trên hệ thống.",
    response_description="Thông tin chi tiết người dùng vừa tạo thành công.",
)
def create_user(
    form: schema.UserCreateForm,
    db: Session = Depends(get_db),
):
    created_user = service.create_user(db=db, form=form)
    return success_response(data=created_user, message="Tạo tài khoản người dùng thành công")


@router.get(
    "/{userId}",
    response_model=ApiResponse[schema.UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết người dùng",
    description="Lấy thông tin chi tiết của một người dùng dựa theo ID.",
    response_description="Thông tin chi tiết người dùng.",
)
def get_user_by_id(
    userId: str,
    db: Session = Depends(get_db),
):
    user = service.get_user_by_id(db=db, user_id=userId)
    return success_response(data=user, message="Lấy thông tin người dùng thành công")


@router.put(
    "/{userId}",
    response_model=ApiResponse[schema.UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật thông tin người dùng",
    description="Cập nhật thông tin cá nhân và vai trò của người dùng đã tồn tại.",
    response_description="Thông tin người dùng sau khi cập nhật.",
)
def update_user(
    userId: str,
    form: schema.UserUpdateForm,
    db: Session = Depends(get_db),
):
    updated_user = service.update_user(db=db, user_id=userId, form=form)
    return success_response(data=updated_user, message="Cập nhật thông tin người dùng thành công")


@router.patch(
    "/{userId}/block",
    response_model=ApiResponse[schema.UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Khóa hoặc mở khóa tài khoản",
    description="Thay đổi trạng thái tài khoản linh hoạt (Khóa kèm lý do hoặc Mở khóa tài khoản).",
    response_description="Thông tin người dùng sau khi thay đổi trạng thái.",
)
def block_user(
    userId: str,
    form: schema.UserBlockForm,
    db: Session = Depends(get_db),
):
    updated_user = service.block_user(db=db, user_id=userId, form=form)
    action_text = "Khóa" if form.isBlocked else "Mở khóa"
    return success_response(data=updated_user, message=f"{action_text} tài khoản thành công")


@router.delete(
    "/{userId}",
    response_model=ApiResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Xóa tài khoản người dùng",
    description="Xóa người dùng khỏi hệ thống (có kiểm tra ràng buộc liên quan đến đơn hàng).",
    response_description="Thông báo xóa thành công.",
)
def delete_user(
    userId: str,
    db: Session = Depends(get_db),
):
    service.delete_user(db=db, user_id=userId)
    return success_response(data=None, message="Xóa tài khoản người dùng thành công")
