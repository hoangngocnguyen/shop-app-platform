from uuid import UUID

from fastapi import APIRouter, Depends

# Import dependency xác thực từ core
from src.app.core.auth import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
async def get_me(
    user_id: UUID = Depends(get_current_user_id),
):
    return {
        "user_id": user_id,
    }
