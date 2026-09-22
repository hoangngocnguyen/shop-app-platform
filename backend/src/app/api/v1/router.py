from fastapi import APIRouter

from src.app.modules.auth.router import router as auth_router
from src.app.modules.media import media_router
from src.app.modules.products.router import router as products_router

# Tạo router tổng cho v1
api_v1_router = APIRouter(prefix="/api/v1")

# Nối các router từ từng module vào
api_v1_router.include_router(media_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(auth_router)
