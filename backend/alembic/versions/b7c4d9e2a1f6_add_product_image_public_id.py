"""add product image public id

Revision ID: b7c4d9e2a1f6
Revises: 2d856f81d36f
Create Date: 2026-10-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b7c4d9e2a1f6"
down_revision: str | Sequence[str] | None = "2d856f81d36f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("image_public_id", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("products", "image_public_id")
