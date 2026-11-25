from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role

from . import service
from .models import BannerPosition
from .schema import (
    BannerAdminOut,
    BannerCreate,
    BannerListOut,
    BannerPublic,
    BannerStatusUpdate,
    BannerUpdate,
)

public_router = APIRouter(prefix="/banners", tags=["banners"])
admin_router = APIRouter(
    prefix="/admin/banners",
    tags=["admin-banners"],
    dependencies=[Depends(require_role("ADMIN"))],
)


# ---------- public ----------
@public_router.get("", response_model=list[BannerPublic])
def get_public_banners(
    response: Response,
    position: BannerPosition = Query(..., description="Sai giá trị Enum -> 422"),
    db: Session = Depends(get_db),
):
    response.headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=120"
    return service.list_public(db, position)


# ---------- admin ----------
@admin_router.get("", response_model=BannerListOut)
def admin_list_banners(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    position: BannerPosition | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
):
    items, total = service.list_admin(db, page, limit, position, is_active)
    return BannerListOut(items=items, total=total, page=page, limit=limit)


@admin_router.post("", response_model=BannerAdminOut, status_code=status.HTTP_201_CREATED)
def admin_create_banner(payload: BannerCreate, db: Session = Depends(get_db)):
    return service.create_banner(db, payload)


@admin_router.put("/{banner_id}", response_model=BannerAdminOut)
def admin_update_banner(banner_id: int, payload: BannerUpdate, db: Session = Depends(get_db)):
    return service.update_banner(db, banner_id, payload)


@admin_router.patch("/{banner_id}/status", response_model=BannerAdminOut)
def admin_set_banner_status(
    banner_id: int, payload: BannerStatusUpdate, db: Session = Depends(get_db)
):
    return service.set_status(db, banner_id, payload.is_active)


@admin_router.delete("/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_banner(banner_id: int, db: Session = Depends(get_db)):
    service.delete_banner(db, banner_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
