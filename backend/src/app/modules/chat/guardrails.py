import logging
import re

logger = logging.getLogger(__name__)

SAFE_FALLBACK_REPLY = (
    "Xin lỗi, tôi không thể cung cấp thông tin này. "
    "Vui lòng liên hệ bộ phận hỗ trợ khách hàng của HoangShop để được giải đáp chi tiết."
)

# Các mẫu nhận diện rò rỉ Prompt nội bộ hoặc thông tin cấu hình nhạy cảm
_LEAKAGE_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\[TÀI LIỆU THAM KHẢO CỦA HOANGSHOP\]", re.IGNORECASE),
    re.compile(r"\[SẢN PHẨM HIỆN CÓ TRONG KHO CỦA HOANGSHOP\]", re.IGNORECASE),
    re.compile(r"BASE_SYSTEM_PROMPT", re.IGNORECASE),
    re.compile(r"\b(GEMINI_API_KEY|SECRET_KEY|DATABASE_URL)\b"),
    re.compile(r"AIza[0-9A-Za-z_-]{20,}"),
)

# Chặn khối script/style/iframe hoàn chỉnh (xóa luôn cả nội dung bên trong)
_DANGEROUS_BLOCK_RE = re.compile(
    r"<\s*(script|iframe|object|embed|style)[^>]*>.*?<\s*/\s*\1\s*>",
    re.IGNORECASE | re.DOTALL,
)
# Chặn toàn bộ thẻ HTML thô còn lại (<img ...>, <svg ...>, <a ...>) nhưng vẫn giữ nguyên Markdown
_RAW_HTML_TAG_RE = re.compile(
    r"<\s*/?\s*[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^>]*)?>",
    re.IGNORECASE,
)
_DANGEROUS_URI_RE = re.compile(
    r"(?:javascript|vbscript|data\s*:\s*text/html)\s*:",
    re.IGNORECASE,
)
_INLINE_EVENT_RE = re.compile(r"\bon[a-z]+\s*=", re.IGNORECASE)
_EXCESSIVE_NEWLINES_RE = re.compile(r"\n{3,}")

MAX_REPLY_LENGTH = 4000


def sanitize_chat_output(raw_reply: str) -> str:
    """
    Lọc và làm sạch phản hồi từ AI trước khi trả về Client:
    1. Chặn rò rỉ System Prompt nội bộ hoặc API key/biến môi trường.
    2. Loại bỏ toàn bộ thẻ HTML thô, inline event (onerror=...) và URI độc hại (chống XSS)
       nhưng giữ nguyên định dạng Markdown hợp lệ (**bold**, * list, [link](/products/1)).
    3. Chuẩn hóa dòng trống thừa và giới hạn độ dài an toàn.
    """
    if not raw_reply:
        return SAFE_FALLBACK_REPLY

    for pattern in _LEAKAGE_PATTERNS:
        if pattern.search(raw_reply):
            logger.warning("Blocked potential prompt/secret leakage in AI chat output")
            return SAFE_FALLBACK_REPLY

    cleaned = _DANGEROUS_BLOCK_RE.sub("", raw_reply)
    cleaned = _RAW_HTML_TAG_RE.sub("", cleaned)
    cleaned = _DANGEROUS_URI_RE.sub("", cleaned)
    cleaned = _INLINE_EVENT_RE.sub("", cleaned)
    cleaned = _EXCESSIVE_NEWLINES_RE.sub("\n\n", cleaned).strip()

    if not cleaned:
        return SAFE_FALLBACK_REPLY

    if len(cleaned) > MAX_REPLY_LENGTH:
        cleaned = f"{cleaned[:MAX_REPLY_LENGTH].rstrip()}..."

    return cleaned
