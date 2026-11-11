from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role
from src.app.core.response import ApiResponse, success_response
from src.app.modules.admin.users import service
from src.app.modules.admin.users.schema import (
    SortDirection,
    UserBlockForm,
    UserDetailResponse,
    UserDetailStatisticsResponseDTO,
    UserListResponse,
    UserRole,
    UserRoleUpdateForm,
    UserStatsResponse,
    UserStatus,
)

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin - Quản lý người dùng"],
    dependencies=[Depends(require_role("ADMIN"))],
)


@router.get(
    "",
    response_model=ApiResponse[UserListResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách người dùng",
    description="Lấy danh sách người dùng có hỗ trợ phân trang, tìm kiếm theo từ khóa và lọc theo vai trò, trạng thái tài khoản.",
    response_description="Danh sách người dùng cùng thông tin phân trang.",
)
def get_users(
    page: int = Query(0, ge=0, description="Số trang, mặc định = 0"),
    page_size: int = Query(10, ge=1, le=100, description="Số lượng bản ghi mỗi trang, mặc định = 10"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, email, sđt hoặc userId"),
    role: Optional[UserRole] = Query(None, description="Lọc theo vai trò (ADMIN, CUSTOMER, STAFF)"),
    status_filter: Optional[UserStatus] = Query(None, alias="status", description="Lọc theo trạng thái (ACTIVE, BLOCKED)"),
    sortBy: str = Query("createdAt", description="Trường sắp xếp (createdAt, fullName, email)"),
    sortDir: SortDirection = Query(SortDirection.DESC, description="Chiều sắp xếp: asc hoặc desc"),
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


@router.get(
    "/stats",
    response_model=ApiResponse[UserStatsResponse],
    status_code=status.HTTP_200_OK,
    summary="Lấy số liệu thống kê người dùng",
    description="Lấy số liệu tổng hợp toàn hệ thống theo vai trò và trạng thái tài khoản.",
    response_description="Số liệu người dùng toàn hệ thống.",
)
def get_user_stats(db: Session = Depends(get_db)):
    stats = service.get_user_stats(db=db)
    return success_response(data=stats, message="Lấy số liệu người dùng thành công")


@router.get(
    "/{userId}",
    response_model=ApiResponse[UserDetailResponse],
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


@router.get(
    "/{userId}/statistics",
    response_model=ApiResponse[UserDetailStatisticsResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Lấy chi tiết thống kê và lịch sử đơn hàng của người dùng",
    description="Lấy thông tin chi tiết, thống kê tài chính và lịch sử đơn hàng của user.",
    response_description="Thông tin chi tiết, thống kê tài chính và đơn hàng của user.",
)
def get_user_statistics(
    userId: str,
    page: int = Query(1, ge=1, description="Số trang (bắt đầu từ 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Số lượng bản ghi mỗi trang"),
    status_filter: Optional[str] = Query(None, alias="status", description="Lọc theo trạng thái đơn hàng"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo OrderID, tên sản phẩm hoặc người nhận"),
    db: Session = Depends(get_db),
):
    stats = service.get_user_statistics(
        db=db,
        user_id=userId,
        page=page,
        page_size=page_size,
        status=status_filter,
        search=search,
    )
    return success_response(data=stats, message="Lấy dữ liệu thống kê người dùng thành công")



@router.patch(
    "/{userId}/block",
    response_model=ApiResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Khóa hoặc mở khóa tài khoản",
    description="Khóa tài khoản với lý do hoặc mở khóa tài khoản.",
    response_description="Thông tin người dùng sau khi thay đổi trạng thái.",
)
def block_user(
    userId: str,
    form: UserBlockForm,
    db: Session = Depends(get_db),
):
    updated_user = service.block_user(db=db, user_id=userId, form=form)
    action_text = "Khóa" if form.isBlocked else "Mở khóa"
    return success_response(data=updated_user, message=f"{action_text} tài khoản thành công")


@router.patch(
    "/{userId}/role",
    response_model=ApiResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật vai trò người dùng",
    description="Chỉ cập nhật vai trò hệ thống của người dùng.",
    response_description="Thông tin người dùng sau khi cập nhật vai trò.",
)
def update_user_role(
    userId: str,
    form: UserRoleUpdateForm,
    db: Session = Depends(get_db),
):
    updated_user = service.update_user_role(db=db, user_id=userId, form=form)
    return success_response(data=updated_user, message="Cập nhật vai trò người dùng thành công")


@router.delete(
    "/{userId}",
    response_model=ApiResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Xóa tài khoản người dùng",
    description="Xóa tài khoản người dùng; không cho phép xóa nếu còn đơn hàng liên quan.",
    response_description="Thông báo xóa thành công.",
)
def delete_user(
    userId: str,
    db: Session = Depends(get_db),
):
    service.delete_user(db=db, user_id=userId)
    return success_response(data=None, message="Xóa tài khoản người dùng thành công")
