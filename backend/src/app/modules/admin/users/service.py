import math
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import String, asc, cast, desc, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from src.app.modules.admin.users import schema
from src.app.modules.orders.model import Order
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User


def _parse_user_id(user_id: str) -> UUID:
    try:
        return UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy người dùng với ID: {user_id}",
        ) from None


def _get_role_code(role: schema.UserRole) -> str:
    return "USER" if role == schema.UserRole.CUSTOMER else role.value


def _map_user_to_response(user: User) -> schema.UserDetailResponse:
    role_code = user.role.code
    response_role = (
        schema.UserRole.CUSTOMER
        if role_code == "USER"
        else schema.UserRole(role_code)
    )
    return schema.UserDetailResponse(
        userId=str(user.user_id),
        fullName=user.name,
        email=user.email,
        phone=user.phone,
        address=None,
        role=response_role,
        status=(
            schema.UserStatus.BLOCKED
            if user.is_blocked
            else schema.UserStatus.ACTIVE
        ),
        reason=user.block_reason,
        createdAt=user.created_at,
        updatedAt=user.updated_at,
    )


def get_users_paginated(
    db: Session,
    page: int = 0,
    page_size: int = 10,
    search: str | None = None,
    role: str | None = None,
    status_filter: str | None = None,
    sort_by: str = "createdAt",
    sort_dir: str = "desc",
) -> schema.UserListResponse:
    if page < 0 or page_size < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Số trang phải từ 0, page_size phải lớn hơn 0",
        )

    query = db.query(User).options(joinedload(User.role))

    if search and search.strip():
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_fmt),
                User.username.ilike(search_fmt),
                User.email.ilike(search_fmt),
                User.phone.ilike(search_fmt),
                cast(User.user_id, String).ilike(search_fmt),
            )
        )

    if role:
        try:
            role_code = _get_role_code(schema.UserRole(role))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Vai trò không hợp lệ: {role}",
            ) from None
        query = query.join(User.role).filter(Role.code == role_code)

    if status_filter:
        normalized_status = status_filter.upper()
        if normalized_status == schema.UserStatus.BLOCKED.value:
            query = query.filter(User.is_blocked.is_(True))
        elif normalized_status == schema.UserStatus.ACTIVE.value:
            query = query.filter(User.is_blocked.is_(False))
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Trạng thái không hợp lệ: {status_filter}",
            )

    sort_columns = {
        "createdAt": User.created_at,
        "fullName": User.name,
        "email": User.email,
    }
    sort_column = sort_columns.get(sort_by, User.created_at)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_column))
    elif sort_dir.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Chiều sắp xếp không hợp lệ: {sort_dir}",
        )

    total = query.count()
    users = query.offset(page * page_size).limit(page_size).all()

    return schema.UserListResponse(
        content=[_map_user_to_response(user) for user in users],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=math.ceil(total / page_size),
    )


def create_user(
    db: Session, form: schema.UserCreateForm
) -> schema.UserDetailResponse:
    del db, form
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=(
            "Tạo tài khoản cần tích hợp Supabase Auth Admin API; "
            "luồng này hiện chưa được cấu hình."
        ),
    )


def get_user_by_id(db: Session, user_id: str) -> schema.UserDetailResponse:
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.user_id == _parse_user_id(user_id))
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy người dùng với ID: {user_id}",
        )
    return _map_user_to_response(user)


def update_user(
    db: Session, user_id: str, form: schema.UserUpdateForm
) -> schema.UserDetailResponse:
    parsed_user_id = _parse_user_id(user_id)
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.user_id == parsed_user_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại",
        )

    if form.address is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ được quản lý qua chức năng địa chỉ giao hàng",
        )

    if form.phone != user.phone:
        existing_phone = (
            db.query(User)
            .filter(User.phone == form.phone, User.user_id != parsed_user_id)
            .first()
        )
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số điện thoại đã được sử dụng bởi người dùng khác",
            )

    role = db.query(Role).filter(Role.code == _get_role_code(form.role)).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không tìm thấy vai trò: {form.role.value}",
        )

    user.name = form.fullName
    user.phone = form.phone
    user.role = role

    db.commit()
    db.refresh(user)
    return _map_user_to_response(user)


def block_user(
    db: Session, user_id: str, form: schema.UserBlockForm
) -> schema.UserDetailResponse:
    parsed_user_id = _parse_user_id(user_id)
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.user_id == parsed_user_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy người dùng với ID: {user_id}",
        )

    user.is_blocked = form.isBlocked
    user.block_reason = form.reason.strip() if form.isBlocked and form.reason else None

    db.commit()
    db.refresh(user)
    return _map_user_to_response(user)


def delete_user(db: Session, user_id: str) -> None:
    parsed_user_id = _parse_user_id(user_id)
    user = db.query(User).filter(User.user_id == parsed_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy người dùng với ID: {user_id}",
        )

    if db.query(Order).filter(Order.user_id == parsed_user_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Không thể xóa người dùng đã có đơn hàng",
        )

    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Không thể xóa người dùng do còn dữ liệu liên quan",
        ) from None
