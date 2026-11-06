"""add address to users

Revision ID: 91d8a4c2e6f0
Revises: e47c9a1d2b63
Create Date: 2026-11-06

"""
from typing import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "91d8a4c2e6f0"
down_revision: str | Sequence[str] | None = "e47c9a1d2b63"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "address",
            sa.String(length=255),
            nullable=True,
            comment="Địa chỉ liên hệ chính",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "address")
