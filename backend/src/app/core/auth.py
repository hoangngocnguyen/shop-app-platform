from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.app.core.config import settings

# 1. Cấu hình HTTPBearer để lấy token từ Header (Authorization: Bearer <token>)
security = HTTPBearer()

# 2. Đường dẫn lấy Public key từ Supabase
JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"

# 3. Tạo PyJWKClient để tự động lấy và cache public key theo header 'kid' của JWT
jwks_client = jwt.PyJWKClient(JWKS_URL)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )

        return payload

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


async def get_current_user_id(
    payload: dict = Depends(get_current_user),
) -> UUID:
    return UUID(payload["sub"])
