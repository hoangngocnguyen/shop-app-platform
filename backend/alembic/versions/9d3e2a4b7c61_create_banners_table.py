"""create banners table

Revision ID: 9d3e2a4b7c61
Revises: 25789025f077
Create Date: 2026-11-22

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op


revision: str = "9d3e2a4b7c61"
down_revision: str | Sequence[str] | None = "25789025f077"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "banners",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("image_public_id", sa.String(length=255), nullable=True),
        sa.Column("mobile_image_url", sa.Text(), nullable=True),
        sa.Column("mobile_image_public_id", sa.String(length=255), nullable=True),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("link_url", sa.Text(), nullable=True),
        sa.Column("position", sa.String(length=50), nullable=False),
        sa.Column("priority", sa.Integer(), server_default="0", nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "position IN ('home_hero', 'home_banner_grid', 'category_top', 'popup')",
            name="ck_banners_position",
        ),
        sa.CheckConstraint(
            "priority >= 0 AND priority <= 9999",
            name="ck_banners_priority",
        ),
        sa.CheckConstraint(
            "end_time IS NULL OR start_time IS NULL OR end_time > start_time",
            name="ck_banners_time_range",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_banners_public_query",
        "banners",
        ["position", "is_active", sa.text("priority DESC")],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_banners_public_query", table_name="banners")
    op.drop_table("banners")
