"""Make post topic_id nullable for optional category

Revision ID: e71b2d3c4e5f
Revises: 9d41c2e7a613
Create Date: 2026-11-23
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "e71b2d3c4e5f"
down_revision: str | Sequence[str] | None = "9d41c2e7a613"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("posts", "topic_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column("posts", "topic_id", existing_type=sa.Integer(), nullable=False)
