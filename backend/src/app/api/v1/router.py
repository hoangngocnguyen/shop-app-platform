from fastapi import APIRouter

from src.app.modules.auth.router import router as auth_router
from src.app.modules.carts.router import router as cart_router
from src.app.modules.categories.admin_router import admin_category_router
from src.app.modules.categories.router import router as categories_router
from src.app.modules.locations.router import router as locations_router
from src.app.modules.media import media_router
from src.app.modules.orders.routers.admin_order_router import admin_order_router
from src.app.modules.orders.routers.checkout_router import router as checkout_router
from src.app.modules.orders.routers.order_router import router as order_router
from src.app.modules.payments.router import router as payments_router
from src.app.modules.products.admin_router import admin_product_router
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
api_v1_router.include_router(admin_product_router)
api_v1_router.include_router(categories_router)
api_v1_router.include_router(admin_category_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(shipping_addresses_router)
api_v1_router.include_router(cart_router)
api_v1_router.include_router(checkout_router)
api_v1_router.include_router(order_router)
api_v1_router.include_router(admin_order_router)
api_v1_router.include_router(payments_router)
