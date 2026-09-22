from contextlib import asynccontextmanager

import cloudinary.exceptions
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.app.api.v1.router import api_v1_router
from src.app.core.exceptions import (
    cloudinary_exception_handler,
    global_exception_handler,
    http_exception_handler,
)
from src.app.modules.media.config import setup_cloudinary


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    # Chạy tất cả các cấu hình 3rd-party dịch vụ ở đây
    setup_cloudinary()
    print("🚀 Cloudinary initialized successfully!")

    yield  # Ứng dụng bắt đầu nhận request từ Client tại đây

    # --- SHUTDOWN LOGIC ---
    # Dọn dẹp tài nguyên (kết nối DB, Redis...) nếu cần khi app tắt
    print("🛑 Application shutdown")


app = FastAPI(
    title="Shop App API",
    lifespan=lifespan,
)

app.include_router(api_v1_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler,
)

app.add_exception_handler(
    cloudinary.exceptions.Error,
    cloudinary_exception_handler,
)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)


@app.get("/")
def root():
    return {"message": "Shop App API"}
