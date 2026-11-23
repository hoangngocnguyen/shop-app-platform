import re
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# Loại bỏ ký tự điều khiển ẩn (giữ lại \n, \r, \t)
_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean_user_text(value: str, error_message: str) -> str:
    cleaned = _CONTROL_CHARS_RE.sub("", value).strip()
    if not cleaned:
        raise ValueError(error_message)
    return cleaned


class ChatHistoryItem(BaseModel):
    """Một lượt hội thoại trước đó giữa người dùng và trợ lý AI."""

    role: Literal["user", "assistant"] = Field(
        ...,
        description="Vai trò người gửi ('user' hoặc 'assistant')",
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Nội dung tin nhắn",
    )

    @field_validator("content")
    @classmethod
    def strip_content(cls, value: str) -> str:
        return _clean_user_text(
            value, "Nội dung tin nhắn trong lịch sử không được để trống"
        )


class ChatRequest(BaseModel):
    """Payload gửi tin nhắn tới AI Chat Assistant."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Câu hỏi hoặc yêu cầu hiện tại của người dùng",
        examples=["Shop có chính sách đổi trả như thế nào?"],
    )
    history: list[ChatHistoryItem] = Field(
        default_factory=list,
        max_length=20,
        description="Lịch sử các tin nhắn gần nhất để AI hiểu ngữ cảnh (tối đa 20 lượt)",
    )

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        return _clean_user_text(
            value, "Tin nhắn không được chỉ chứa khoảng trắng"
        )


class SuggestedProductItem(BaseModel):
    """Thông tin tóm tắt sản phẩm gợi ý đi kèm câu trả lời của AI (dùng cho thẻ UI)."""

    product_id: int
    product_name: str
    price: Decimal
    sale_price: Decimal | None = None
    in_stock: bool = True
    image_src: str | None = None
    brand: str | None = None


class ChatResponse(BaseModel):
    """Kết quả phản hồi từ AI Chat Assistant."""

    reply: str = Field(..., description="Câu trả lời của trợ lý AI (định dạng Markdown)")
    model: str | None = Field(
        default=None,
        description="Tên model AI đã xử lý (chỉ hiển thị trong môi trường DEBUG)",
    )
    sources: list[str] = Field(
        default_factory=list,
        description="Danh sách tiêu đề tài liệu nội bộ đã được RAG trích xuất để trả lời",
    )
    suggested_products: list[SuggestedProductItem] = Field(
        default_factory=list,
        description="Danh sách sản phẩm liên quan tìm được từ database",
    )


class SyncProductsResponse(BaseModel):
    """Kết quả đồng bộ vector embedding cho danh sách sản phẩm."""

    total_products: int = Field(..., description="Tổng số sản phẩm hiện có trong database")
    synced: int = Field(..., description="Số sản phẩm đã được tạo/cập nhật vector mới")
    skipped: int = Field(..., description="Số sản phẩm giữ nguyên vector do không đổi nội dung")
