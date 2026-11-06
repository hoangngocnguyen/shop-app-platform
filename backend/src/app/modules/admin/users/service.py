import math
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import String, asc, case, cast, desc, func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, joinedload, selectinload

from src.app.modules.admin.users.schema import (
    ShippingAddressDTO,
    SortDirection,
    UserBlockForm,
    UserDetailResponse,
    UserListResponse,
    UserRole,
    UserRoleUpdateForm,
    UserStatsResponse,
    UserStatus,
)
from src.app.modules.orders.model import Order
from src.app.modules.roles.model import Role
from src.app.modules.shipping_addresses.model import ShippingAddress
from src.app.modules.users.model import User


def _parse_user_id(user_id: str) -> UUID:
    try:
        return UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")


def _get_role_code(role: UserRole) -> str:
    return "USER" if role == UserRole.CUSTOMER else role.value


def _map_user_to_response(user: User) -> UserDetailResponse:
    role_code = user.role.code.upper() if (user.role and user.role.code) else "USER"
    response_role = UserRole.CUSTOMER if role_code in ("USER", "CUSTOMER") else UserRole(role_code)

    return UserDetailResponse(
        userId=str(user.user_id),
        fullName=user.name or "",
        email=user.email or "",
        phone=user.phone,
        shippingAddresses=[
            ShippingAddressDTO(
                id=address.id,
                recipientName=address.recipient_name,
                phone=address.phone,
                province=address.province_name,
                ward=address.ward_name,
                detailAddress=address.address_line,
                isDefault=address.is_default,
            )
            for address in user.shipping_addresses
        ],
        role=response_role,
        status=UserStatus.BLOCKED if getattr(user, "is_blocked", False) else UserStatus.ACTIVE,
        reason=getattr(user, "block_reason", None),
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
) -> UserListResponse:
    query = db.query(User).options(
        joinedload(User.role),
        selectinload(User.shipping_addresses).joinedload(ShippingAddress.province),
        selectinload(User.shipping_addresses).joinedload(ShippingAddress.ward),
    )

    if search and search.strip():
        fmt = f"%{search.strip()}%"
        filters = [User.name.ilike(fmt), User.email.ilike(fmt), User.phone.ilike(fmt), cast(User.user_id, String).ilike(fmt)]
        if hasattr(User, "username"):
            filters.append(getattr(User, "username").ilike(fmt))
        query = query.filter(or_(*filters))

    if role:
        role_code = _get_role_code(UserRole(role.upper()))
        query = query.join(User.role).filter(Role.code == role_code)

    if status_filter:
        norm_status = status_filter.upper()
        if norm_status == UserStatus.BLOCKED.value:
            query = query.filter(User.is_blocked.is_(True))
        elif norm_status == UserStatus.ACTIVE.value:
            query = query.filter(User.is_blocked.is_(False))

    sort_cols = {"createdAt": User.created_at, "fullName": User.name, "email": User.email}
    sort_col = sort_cols.get(sort_by, User.created_at)
    query = query.order_by(asc(sort_col) if sort_dir.lower() == "asc" else desc(sort_col))

    total = query.count()
    users = query.offset(page * page_size).limit(page_size).all()
    return UserListResponse(
        content=[_map_user_to_response(u) for u in users],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


def get_user_stats(db: Session) -> UserStatsResponse:
    total, customers, admins, staff, blocked = (
        db.query(
            func.count(User.user_id),
            func.coalesce(
                func.sum(case((func.upper(Role.code).in_(("USER", "CUSTOMER")), 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((func.upper(Role.code) == "ADMIN", 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((func.upper(Role.code) == "STAFF", 1), else_=0)),
                0,
            ),
            func.coalesce(func.sum(case((User.is_blocked.is_(True), 1), else_=0)), 0),
        )
        .join(Role, User.role_id == Role.id)
        .one()
    )
    return UserStatsResponse(
        total=total,
        customers=customers,
        admins=admins,
        staff=staff,
        blocked=blocked,
    )


def get_user_by_id(db: Session, user_id: str) -> UserDetailResponse:
    user = (
        db.query(User)
        .options(
            joinedload(User.role),
            selectinload(User.shipping_addresses).joinedload(ShippingAddress.province),
            selectinload(User.shipping_addresses).joinedload(ShippingAddress.ward),
        )
        .filter(User.user_id == _parse_user_id(user_id))
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")
    return _map_user_to_response(user)


def block_user(db: Session, user_id: str, form: UserBlockForm) -> UserDetailResponse:
    user = (
        db.query(User)
        .options(
            joinedload(User.role),
            selectinload(User.shipping_addresses).joinedload(ShippingAddress.province),
            selectinload(User.shipping_addresses).joinedload(ShippingAddress.ward),
        )
        .filter(User.user_id == _parse_user_id(user_id))
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")

    user.is_blocked = form.isBlocked
    user.block_reason = form.reason.strip() if form.isBlocked and form.reason else None
    try:
        db.commit()
        db.refresh(user)
        return _map_user_to_response(user)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="Không thể thay đổi trạng thái tài khoản") from error


def update_user_role(
    db: Session,
    user_id: str,
    form: UserRoleUpdateForm,
) -> UserDetailResponse:
    user = (
        db.query(User)
        .options(
            joinedload(User.role),
            selectinload(User.shipping_addresses).joinedload(ShippingAddress.province),
            selectinload(User.shipping_addresses).joinedload(ShippingAddress.ward),
        )
        .filter(User.user_id == _parse_user_id(user_id))
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")

    role_code = _get_role_code(form.role)
    role = db.query(Role).filter(Role.code == role_code).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy vai trò: {role_code}")

    user.role = role
    try:
        db.commit()
        db.refresh(user)
        return _map_user_to_response(user)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="Không thể cập nhật vai trò người dùng") from error


def delete_user(db: Session, user_id: str) -> None:
    uid = _parse_user_id(user_id)
    user = db.query(User).filter(User.user_id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")

    if db.query(Order).filter(Order.user_id == uid).first():
        raise HTTPException(status_code=409, detail="Không thể xóa người dùng đã có đơn hàng")

    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Không thể xóa người dùng do còn dữ liệu liên quan") from None