"""create product_embeddings table

Revision ID: 8b9d2f4e1a10
Revises: 25789025f077
Create Date: 2026-11-21 20:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8b9d2f4e1a10"
down_revision: Union[str, Sequence[str], None] = "25789025f077"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Tạo bảng product_embeddings lưu vector ngữ nghĩa của sản phẩm."""
    op.create_table(
        "product_embeddings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False, comment="ID sản phẩm liên kết"),
        sa.Column(
            "content_text",
            sa.Text(),
            nullable=False,
            comment="Văn bản mô tả sản phẩm đã chuẩn hóa dùng để tạo vector",
        ),
        sa.Column(
            "embedding",
            sa.JSON(),
            nullable=False,
            comment="Vector embedding dạng mảng số thực từ Gemini Embedding API",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            comment="Thời điểm đồng bộ vector gần nhất",
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.product_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id"),
    )
    op.create_index(
        op.f("ix_product_embeddings_product_id"),
        "product_embeddings",
        ["product_id"],
        unique=True,
    )


def downgrade() -> None:
    """Xóa bảng product_embeddings."""
    op.drop_index(op.f("ix_product_embeddings_product_id"), table_name="product_embeddings")
    op.drop_table("product_embeddings")
