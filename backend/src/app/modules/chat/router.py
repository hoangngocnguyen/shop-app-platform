from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.database import get_db
from src.app.core.deps import require_role
from src.app.core.response import ApiResponse, success_response
from src.app.modules.chat.rate_limit import enforce_chat_rate_limit
from src.app.modules.chat.schema import (
    ChatRequest,
    ChatResponse,
    SyncProductsResponse,
)
from src.app.modules.chat.service import ChatService

chat_router = APIRouter(
    prefix="/chat",
    tags=["AI Chat Assistant"],
)


def get_chat_service() -> ChatService:
    """Dependency khởi tạo ChatService."""
    return ChatService()


@chat_router.post(
    "",
    response_model=ApiResponse[ChatResponse],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(enforce_chat_rate_limit)],
    summary="Gửi tin nhắn cho AI Chat Assistant",
    description=(
        "Nhận câu hỏi và lịch sử hội thoại gần nhất từ người dùng, "
        "tìm kiếm chính sách + sản phẩm liên quan bằng RAG và gọi Gemini trả về Markdown."
    ),
)
async def chat_with_assistant(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[ChatResponse]:
    """Endpoint chính cho chức năng AI Chatbot (có rate limit theo IP)."""
    result = await service.ask(payload, db=db)
    return success_response(
        data=result,
        message="Phản hồi từ trợ lý AI thành công",
    )


@chat_router.post(
    "/sync-products",
    response_model=ApiResponse[SyncProductsResponse],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("ADMIN"))],
    summary="Đồng bộ Vector Embedding sản phẩm (Admin)",
    description=(
        "Đọc toàn bộ sản phẩm trong PostgreSQL, tạo vector ngữ nghĩa bằng Gemini Embedding "
        "và lưu vào bảng product_embeddings (bỏ qua các sản phẩm không đổi nội dung)."
    ),
)
async def sync_chat_products(
    db: Session = Depends(get_db),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[SyncProductsResponse]:
    """Endpoint quản trị để đồng bộ tri thức sản phẩm cho RAG."""
    result = await service.sync_products(db=db)
    return success_response(
        data=result,
        message="Đồng bộ vector sản phẩm thành công",
    )
