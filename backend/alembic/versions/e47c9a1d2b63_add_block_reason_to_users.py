"""add block reason to users

Revision ID: e47c9a1d2b63
Revises: 25789025f077
Create Date: 2026-11-04

"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "e47c9a1d2b63"
down_revision: str | Sequence[str] | None = "25789025f077"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "block_reason",
            sa.String(length=500),
            nullable=True,
            comment="Lý do khóa tài khoản",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "block_reason")
