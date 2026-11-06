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
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")


def _get_role_code(role: schema.UserRole) -> str:
    return "USER" if role == schema.UserRole.CUSTOMER else role.value


def _map_user_to_response(user: User) -> schema.UserDetailResponse:
    role_code = user.role.code.upper() if (user.role and user.role.code) else "USER"
    response_role = schema.UserRole.CUSTOMER if role_code in ("USER", "CUSTOMER") else schema.UserRole(role_code)
    
    return schema.UserDetailResponse(
        userId=str(user.user_id),
        fullName=user.name or "",
        email=user.email or "",
        phone=user.phone,
        address=user.address,
        role=response_role,
        status=schema.UserStatus.BLOCKED if getattr(user, "is_blocked", False) else schema.UserStatus.ACTIVE,
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
) -> schema.UserListResponse:
    query = db.query(User).options(joinedload(User.role))

    if search and search.strip():
        fmt = f"%{search.strip()}%"
        filters = [User.name.ilike(fmt), User.email.ilike(fmt), User.phone.ilike(fmt), cast(User.user_id, String).ilike(fmt)]
        if hasattr(User, "username"):
            filters.append(getattr(User, "username").ilike(fmt))
        query = query.filter(or_(*filters))

    if role:
        role_code = _get_role_code(schema.UserRole(role.upper()))
        query = query.join(User.role).filter(Role.code == role_code)

    if status_filter:
        norm_status = status_filter.upper()
        if norm_status == schema.UserStatus.BLOCKED.value:
            query = query.filter(User.is_blocked.is_(True))
        elif norm_status == schema.UserStatus.ACTIVE.value:
            query = query.filter(User.is_blocked.is_(False))

    sort_cols = {"createdAt": User.created_at, "fullName": User.name, "email": User.email}
    sort_col = sort_cols.get(sort_by, User.created_at)
    query = query.order_by(asc(sort_col) if sort_dir.lower() == "asc" else desc(sort_col))

    total = query.count()
    users = query.offset(page * page_size).limit(page_size).all()
    return schema.UserListResponse(
        content=[_map_user_to_response(u) for u in users],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


def create_user(db: Session, form: schema.UserCreateForm) -> schema.UserDetailResponse:
    if db.query(User).filter(User.email == form.email).first():
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    if db.query(User).filter(User.phone == form.phone).first():
        raise HTTPException(status_code=400, detail="Số điện thoại đã được sử dụng")

    role = db.query(Role).filter(Role.code == _get_role_code(form.role)).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Không tìm thấy vai trò: {form.role.value}")

    try:
        new_user = User(name=form.fullName, email=form.email, phone=form.phone, role=role, is_blocked=False)
        if hasattr(new_user, "password"):
            setattr(new_user, "password", form.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return _map_user_to_response(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Không thể tạo tài khoản người dùng") from e


def get_user_by_id(db: Session, user_id: str) -> schema.UserDetailResponse:
    user = db.query(User).options(joinedload(User.role)).filter(User.user_id == _parse_user_id(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")
    return _map_user_to_response(user)


def update_user(db: Session, user_id: str, form: schema.UserUpdateForm) -> schema.UserDetailResponse:
    uid = _parse_user_id(user_id)
    user = db.query(User).options(joinedload(User.role)).filter(User.user_id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    if form.phone and form.phone != user.phone:
        if db.query(User).filter(User.phone == form.phone, User.user_id != uid).first():
            raise HTTPException(status_code=400, detail="Số điện thoại đã được sử dụng")

    role = db.query(Role).filter(Role.code == _get_role_code(form.role)).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Không tìm thấy vai trò: {form.role.value}")

    user.name, user.phone, user.address, user.role = (
        form.fullName,
        form.phone,
        form.address,
        role,
    )
    try:
        db.commit()
        db.refresh(user)
        return _map_user_to_response(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Không thể cập nhật người dùng") from e


def block_user(db: Session, user_id: str, form: schema.UserBlockForm) -> schema.UserDetailResponse:
    user = db.query(User).options(joinedload(User.role)).filter(User.user_id == _parse_user_id(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với ID: {user_id}")

    user.is_blocked = form.isBlocked
    user.block_reason = form.reason.strip() if form.isBlocked and form.reason else None
    try:
        db.commit()
        db.refresh(user)
        return _map_user_to_response(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Không thể thay đổi trạng thái tài khoản") from e


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