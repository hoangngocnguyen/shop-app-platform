# Tạo Router tổng cho toàn bộ cổng Admin
from fastapi import APIRouter

from src.app.modules.admin.categories.router import router as categories_router
from src.app.modules.admin.products.router import router as products_router

admin_router = APIRouter(
    prefix="/admin",
    tags=["Admin Workflow"],
)

# Nhúng các router con vào admin_router
admin_router.include_router(
    categories_router, prefix="/categories", tags=["Admin - Categories"]
)
admin_router.include_router(
    products_router, prefix="/products", tags=["Admin - Products"]
)
