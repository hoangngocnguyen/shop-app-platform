import logging
import math
from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from src.app.modules.chat.llm_client import GeminiClient
from src.app.modules.chat.model import ProductEmbedding
from src.app.modules.products.model import Product

logger = logging.getLogger(__name__)


def _format_vnd(amount: Decimal | None) -> str:
    if amount is None:
        return "0đ"
    return f"{int(amount):,}đ".replace(",", ".")


def build_product_document(product: Product) -> str:
    """
    Chuyển bản ghi Product từ database thành đoạn văn bản chuẩn hóa
    để mô hình Gemini Embedding hiểu được ngữ nghĩa sản phẩm.
    """
    category_name = product.category.category_name if product.category else "Chưa phân loại"
    effective_price = product.sale_price if product.sale_price is not None else product.price
    parts = [
        f"Tên sản phẩm: {product.product_name}",
        f"Danh mục: {category_name}",
    ]
    if product.brand:
        parts.append(f"Thương hiệu: {product.brand}")
    if product.origin:
        parts.append(f"Xuất xứ: {product.origin}")
    parts.append(f"Giá bán: {_format_vnd(effective_price)}")
    if product.description:
        # Giới hạn mô tả ở mức vừa phải để vector tập trung vào thông tin chính
        parts.append(f"Mô tả: {product.description.strip()[:600]}")
    return " | ".join(parts)


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Tính độ tương đồng Cosine giữa 2 vector (giá trị càng gần 1.0 càng giống nhau)."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)


async def sync_product_embeddings(
    db: Session,
    llm_client: GeminiClient,
    *,
    product_ids: Sequence[int] | None = None,
) -> dict[str, int]:
    """
    Đồng bộ dữ liệu từ bảng products sang bảng product_embeddings.
    Chỉ gọi Gemini Embedding API cho sản phẩm mới hoặc sản phẩm có nội dung thay đổi.
    Khi truyền `product_ids`, chỉ kiểm tra và đồng bộ đúng các sản phẩm đó.
    """
    if product_ids is not None:
        target_ids = list(dict.fromkeys(product_ids))
        if not target_ids:
            return {"total_products": 0, "synced": 0, "skipped": 0}
        products = list(
            db.scalars(
                select(Product)
                .where(Product.product_id.in_(target_ids))
                .options(joinedload(Product.category))
            ).all()
        )
        existing_rows = {
            row.product_id: row
            for row in db.scalars(
                select(ProductEmbedding).where(
                    ProductEmbedding.product_id.in_(target_ids)
                )
            ).all()
        }
    else:
        products = list(
            db.scalars(select(Product).options(joinedload(Product.category))).all()
        )
        existing_rows = {
            row.product_id: row
            for row in db.scalars(select(ProductEmbedding)).all()
        }
        active_ids = {p.product_id for p in products}
        orphan_ids = [pid for pid in existing_rows if pid not in active_ids]
        if orphan_ids:
            db.execute(
                delete(ProductEmbedding).where(
                    ProductEmbedding.product_id.in_(orphan_ids)
                )
            )
            for pid in orphan_ids:
                existing_rows.pop(pid, None)

    synced = 0
    skipped = 0

    for product in products:
        doc_text = build_product_document(product)
        existing = existing_rows.get(product.product_id)

        if existing is not None and existing.content_text == doc_text:
            skipped += 1
            continue

        vector = await llm_client.embed_text(
            doc_text,
            task_type="RETRIEVAL_DOCUMENT",
        )
        if existing is not None:
            existing.content_text = doc_text
            existing.embedding = vector
        else:
            db.add(
                ProductEmbedding(
                    product_id=product.product_id,
                    content_text=doc_text,
                    embedding=vector,
                )
            )
        synced += 1
        # Commit theo từng lô 5 sản phẩm để tránh mất toàn bộ tiến trình nếu gặp lỗi giữa chừng
        if synced % 5 == 0:
            db.commit()

    db.commit()
    return {
        "total_products": len(products),
        "synced": synced,
        "skipped": skipped,
    }


def delete_product_embeddings(db: Session, product_ids: Sequence[int]) -> int:
    """Xóa các bản ghi vector embedding tương ứng với danh sách product_id đã xóa."""
    target_ids = list(dict.fromkeys(product_ids))
    if not target_ids:
        return 0
    result = db.execute(
        delete(ProductEmbedding).where(ProductEmbedding.product_id.in_(target_ids))
    )
    return int(result.rowcount or 0)


async def safe_sync_product_embeddings(
    db: Session,
    product_ids: Sequence[int],
    llm_client: GeminiClient | None = None,
) -> dict[str, int] | None:
    """
    Đồng bộ embedding an toàn (không làm lỗi thao tác CRUD của Admin nếu Gemini
    chưa cấu hình API key hoặc đang gặp sự cố tạm thời).
    """
    target_ids = list(dict.fromkeys(product_ids))
    if not target_ids:
        return None

    client = llm_client or GeminiClient()
    if not client.api_key:
        logger.debug("Bỏ qua auto-sync embedding vì chưa cấu hình GEMINI_API_KEY.")
        return None

    try:
        return await sync_product_embeddings(
            db=db,
            llm_client=client,
            product_ids=target_ids,
        )
    except Exception as exc:
        db.rollback()
        logger.warning(
            "Tự động đồng bộ vector embedding thất bại cho product_ids=%s: %s",
            target_ids,
            exc,
        )
        return None


async def safe_sync_category_product_embeddings(
    db: Session,
    category_id: int,
    llm_client: GeminiClient | None = None,
) -> dict[str, int] | None:
    """Đồng bộ lại embedding cho các sản phẩm thuộc danh mục vừa thay đổi thông tin."""
    product_ids = list(
        db.scalars(
            select(Product.product_id).where(Product.category_id == category_id)
        ).all()
    )
    if not product_ids:
        return None
    return await safe_sync_product_embeddings(
        db=db,
        product_ids=product_ids,
        llm_client=llm_client,
    )


def format_products_context(products: list[Product]) -> str:
    """Định dạng danh sách sản phẩm tìm được thành ngữ cảnh cho Gemini tư vấn."""
    if not products:
        return ""

    lines: list[str] = []
    for p in products:
        category_name = p.category.category_name if p.category else "Khác"
        stock_status = "Còn hàng" if p.quantity > 0 else "Hết hàng"
        price_str = _format_vnd(p.price)
        sale_str = f" | Giá khuyến mãi: {_format_vnd(p.sale_price)}" if p.sale_price is not None else ""
        brand_str = f" | Thương hiệu: {p.brand}" if p.brand else ""
        lines.append(
            f"- [ID {p.product_id}] {p.product_name} (Danh mục: {category_name}{brand_str}) | "
            f"Giá gốc: {price_str}{sale_str} | {stock_status} | Link: /products/{p.product_id}"
        )
    return "\n".join(lines)


async def search_similar_products(
    db: Session,
    llm_client: GeminiClient,
    query: str,
    *,
    top_k: int = 5,
    min_similarity: float = 0.45,
) -> list[Product]:
    """
    Tìm Top K sản phẩm có ngữ nghĩa gần nhất với câu hỏi của khách hàng
    bằng cách so sánh Cosine Similarity giữa vector câu hỏi và vector sản phẩm.
    """
    rows = list(
        db.scalars(
            select(ProductEmbedding).options(
                joinedload(ProductEmbedding.product).joinedload(Product.category)
            )
        ).all()
    )
    if not rows:
        return []

    query_vector = await llm_client.embed_text(
        query,
        task_type="RETRIEVAL_QUERY",
    )

    scored: list[tuple[float, Product]] = []
    for row in rows:
        if row.product is None:
            continue
        score = cosine_similarity(query_vector, row.embedding)
        if score >= min_similarity:
            scored.append((score, row.product))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [product for _, product in scored[:top_k]]
