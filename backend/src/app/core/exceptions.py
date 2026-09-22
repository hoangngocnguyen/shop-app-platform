from typing import cast

import cloudinary.exceptions
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    exc = cast(StarletteHTTPException, exc)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
        },
    )


async def cloudinary_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    exc = cast(cloudinary.exceptions.Error, exc)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": f"Cloudinary error: {exc}",
        },
    )


async def global_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": "Internal server error",
        },
    )
