"""Support topic tags and restore archived posts.

Revision ID: 9d41c2e7a613
Revises: ec8b1a7d2f41
Create Date: 2026-11-20
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "9d41c2e7a613"
down_revision: str | Sequence[str] | None = "ec8b1a7d2f41"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("ck_topics_type", "topics", type_="check")
    op.create_check_constraint(
        "ck_topics_type", "topics", "type IN ('CATEGORY', 'TAG')"
    )
    op.add_column("posts", sa.Column("archived_from_status", sa.String(20), nullable=True))
    op.drop_index("ix_posts_user_id", table_name="posts")
    op.alter_column("posts", "user_id", new_column_name="author_id")
    op.create_index("ix_posts_author_id", "posts", ["author_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_posts_author_id", table_name="posts")
    op.alter_column("posts", "author_id", new_column_name="user_id")
    op.create_index("ix_posts_user_id", "posts", ["user_id"], unique=False)
    op.drop_column("posts", "archived_from_status")
    op.drop_constraint("ck_topics_type", "topics", type_="check")
    op.create_check_constraint("ck_topics_type", "topics", "type IN ('CATEGORY')")
