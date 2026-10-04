from functools import lru_cache
from uuid import UUID

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.app.core.config import settings
from src.app.core.exceptions import UnauthorizedException

# 1. Cấu hình HTTPBearer để lấy token từ Header (Authorization: Bearer <token>)
security = HTTPBearer()


@lru_cache(maxsize=1)
def get_jwks_client() -> jwt.PyJWKClient | None:
    """
    [LAZY INIT]: Lấy hoặc khởi tạo PyJWKClient từ Supabase JWKS URL.
    Khởi tạo lazy giúp app không bị crash khi chạy trong môi trường test/local khi chưa cấu hình SUPABASE_URL.
    """
    supabase_url = settings.SUPABASE_URL.strip() if settings.SUPABASE_URL else ""
    if not supabase_url.startswith(("http://", "https://")):
        return None
    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    return jwt.PyJWKClient(jwks_url)


async def get_jwt_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Trích xuất và verify chữ ký JWT payload từ Supabase Auth.
    """
    token = credentials.credentials
    jwks_client = get_jwks_client()

    if not jwks_client:
        raise UnauthorizedException(
            message="Chưa cấu hình Supabase Auth URL (SUPABASE_URL) trên server",
            error_code="AUTH_CONFIG_ERROR",
        )

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            leeway=5,
        )
        return payload

    except jwt.PyJWTError:
        # [REFACTOR: Ném UnauthorizedException chuẩn thay vì HTTPException thô]
        raise UnauthorizedException(
            message="Token xác thực không hợp lệ hoặc đã hết hạn",
            error_code="INVALID_TOKEN",
        )


async def get_current_auth_id(
    payload: dict = Depends(get_jwt_payload),
) -> UUID:
    """Lấy UUID sub (auth_user_id) từ decoded token payload"""
    return UUID(payload["sub"])
