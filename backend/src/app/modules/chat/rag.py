import re
from dataclasses import dataclass


@dataclass(frozen=True)
class KnowledgeChunk:
    """Một đoạn kiến thức nhỏ (Chunk) trong kho dữ liệu của HoangShop."""

    chunk_id: str
    title: str
    content: str


# Các từ nối / từ quá chung chung dễ gây nhiễu điểm khi so khớp từ khóa
VIETNAMESE_STOPWORDS: frozenset[str] = frozenset(
    {
        "là", "và", "của", "cho", "với", "từ", "tại", "trong", "ngoài",
        "các", "những", "một", "này", "kia", "đó", "nếu", "thì", "khi",
        "như", "thế", "nào", "sao", "vậy", "nhé", "ạ", "ơi", "về",
        "có", "không", "được", "bị", "phải", "cần", "muốn", "tôi", "mình",
        "bạn", "em", "anh", "chị", "shop", "hoangshop", "sản", "phẩm",
        "tính", "gì", "bao", "nhiêu", "làm", "hãy", "giúp", "nhất",
    }
)


# Kho tri thức tĩnh trích từ các trang Chính sách & FAQ của HoangShop (/about/*)
SHOP_KNOWLEDGE_CHUNKS: list[KnowledgeChunk] = [
    KnowledgeChunk(
        chunk_id="shop_overview",
        title="Giới thiệu HoangShop & Kênh hỗ trợ",
        content=(
            "HoangShop là cửa hàng thương mại điện tử cung cấp đa dạng sản phẩm chính hãng. "
            "Đội ngũ chăm sóc khách hàng hỗ trợ 24/7 và cam kết xử lý yêu cầu trong vòng 24 giờ."
        ),
    ),
    KnowledgeChunk(
        chunk_id="order_confirmation",
        title="Quy trình đặt hàng & Xác nhận đơn",
        content=(
            "Sau khi nhấn nút Đặt hàng trên website, hệ thống tự động gửi Email xác nhận đơn hàng. "
            "Đồng thời, trong vòng 30 phút (giờ hành chính), nhân viên HoangShop sẽ gọi điện trực tiếp "
            "để xác nhận thông tin giao hàng trước khi xuất kho."
        ),
    ),
    KnowledgeChunk(
        chunk_id="shipping_policy",
        title="Chính sách vận chuyển nội bộ & Hẹn giờ giao",
        content=(
            "HoangShop sử dụng đội ngũ giao hàng nội bộ chuyên nghiệp giao tận nơi (giao hàng, phí ship). "
            "Nhân viên sẽ gọi điện báo trước khi giao từ 15 - 30 phút. "
            "Khách hàng hoàn toàn có thể yêu cầu hoặc thỏa thuận giờ giao hàng cụ thể với nhân viên xác nhận đơn."
        ),
    ),
    KnowledgeChunk(
        chunk_id="inspection_and_return",
        title="Kiểm hàng tại chỗ & Chính sách đổi trả 7 ngày",
        content=(
            "Đặc quyền đồng kiểm: Khi nhận hàng, khách hàng được quyền mở hộp kiểm tra ngoại quan và thử sản phẩm tại chỗ. "
            "HoangShop hỗ trợ đổi trả 1 đổi 1 trong vòng 7 ngày nếu phát sinh lỗi từ nhà sản xuất (NSX), "
            "và miễn phí 100% phí vận chuyển (miễn phí ship) khi đổi trả sản phẩm bị lỗi."
        ),
    ),
    KnowledgeChunk(
        chunk_id="warranty_policy",
        title="Chính sách bảo hành sản phẩm",
        content=(
            "Tất cả sản phẩm chính hãng tại HoangShop đều tuân thủ chính sách bảo hành của nhà sản xuất. "
            "Sau khi khách hàng ký xác nhận nhận hàng, nhân viên giao hàng sẽ kích hoạt bảo hành điện tử ngay tại chỗ."
        ),
    ),
    KnowledgeChunk(
        chunk_id="payment_methods",
        title="Phương thức thanh toán",
        content=(
            "HoangShop hỗ trợ các hình thức thanh toán linh hoạt: "
            "1) Thanh toán khi nhận hàng (COD) sau khi kiểm tra hàng; "
            "2) Thanh toán trực tuyến / chuyển khoản qua cổng VNPay."
        ),
    ),
]


def _tokenize(text: str) -> set[str]:
    """Chuẩn hóa câu thành tập các từ khóa có nghĩa (đã loại bỏ stopwords)."""
    normalized = text.lower()
    tokens = re.findall(r"[0-9a-zA-ZÀ-ỹ]+", normalized)
    return {
        token
        for token in tokens
        if len(token) >= 2 and token not in VIETNAMESE_STOPWORDS
    }


def retrieve_relevant_chunks(
    query: str,
    *,
    top_k: int = 3,
    min_score_ratio: float = 0.5,
) -> list[KnowledgeChunk]:
    """
    Bước R (Retrieve) trong RAG:
    Tìm Top K đoạn kiến thức thực sự liên quan (lọc bỏ từ nhiễu và áp dụng ngưỡng điểm tương đối).
    """
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    scored: list[tuple[int, KnowledgeChunk]] = []
    for chunk in SHOP_KNOWLEDGE_CHUNKS:
        title_tokens = _tokenize(chunk.title)
        content_tokens = _tokenize(chunk.content)

        # Từ khóa khớp ở tiêu đề được tính trọng số cao hơn (x2) so với nội dung (x1)
        title_overlap = len(query_tokens & title_tokens)
        content_overlap = len(query_tokens & content_tokens)
        score = title_overlap * 2 + content_overlap

        if score > 0:
            scored.append((score, chunk))

    if not scored:
        return []

    scored.sort(key=lambda item: item[0], reverse=True)
    max_score = scored[0][0]
    threshold = max(1.0, max_score * min_score_ratio)

    # Chỉ giữ lại các đoạn đạt ít nhất 50% điểm của đoạn liên quan nhất để tránh kéo nhầm tài liệu nhiễu
    filtered = [chunk for score, chunk in scored if score >= threshold]
    return filtered[:top_k]


def build_rag_context(chunks: list[KnowledgeChunk]) -> str:
    """
    Bước A (Augment) trong RAG:
    Đóng gói các đoạn tài liệu tìm được thành văn bản ngữ cảnh cho AI đọc.
    """
    if not chunks:
        return ""

    sections = [
        f"- [{chunk.title}]: {chunk.content}"
        for chunk in chunks
    ]
    return "\n".join(sections)
