from fastapi import APIRouter

from src.app.modules.admin import admin_router
from src.app.modules.auth.router import router as auth_router
from src.app.modules.locations.router import router as locations_router
from src.app.modules.media import media_router
from src.app.modules.products.router import router as products_router
from src.app.modules.shipping_addresses.router import (
    router as shipping_addresses_router,
)
from src.app.modules.users.router import router as users_router

# Tạo router tổng cho v1
api_v1_router = APIRouter(prefix="/api/v1")

# Nối các router từ từng module vào
api_v1_router.include_router(media_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(shipping_addresses_router)

# Router Admin
api_v1_router.include_router(admin_router)
