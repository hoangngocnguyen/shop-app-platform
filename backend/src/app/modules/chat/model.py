from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class ProductEmbedding(Base):
    """Lưu trữ vector embedding của từng sản phẩm phục vụ tìm kiếm ngữ nghĩa (RAG)."""

    __tablename__ = "product_embeddings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        comment="ID sản phẩm liên kết",
    )
    content_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Văn bản mô tả sản phẩm đã chuẩn hóa dùng để tạo vector",
    )
    embedding: Mapped[list[float]] = mapped_column(
        JSON,
        nullable=False,
        comment="Vector embedding dạng mảng số thực từ Gemini Embedding API",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
        comment="Thời điểm đồng bộ vector gần nhất",
    )

    product = relationship("Product")
