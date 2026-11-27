"""create topics and posts

Revision ID: ec8b1a7d2f41
Revises: 25789025f077
Create Date: 2026-11-13

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op


revision: str = "ec8b1a7d2f41"
down_revision: str | Sequence[str] | None = "25789025f077"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "topics",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("type", sa.String(length=50), server_default="CATEGORY", nullable=False),
        sa.CheckConstraint(
            "type IN ('CATEGORY')",
            name="ck_topics_type",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_topics_slug", "topics", ["slug"], unique=True)

    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("thumbnail_url", sa.String(length=500), nullable=True),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="DRAFT", nullable=False),
        sa.Column("views", sa.Integer(), server_default="0", nullable=False),
        sa.Column("likes_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("comments_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("shares_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED')",
            name="ck_posts_status",
        ),
        sa.CheckConstraint("views >= 0", name="ck_posts_views_nonnegative"),
        sa.CheckConstraint("likes_count >= 0", name="ck_posts_likes_count_nonnegative"),
        sa.CheckConstraint("comments_count >= 0", name="ck_posts_comments_count_nonnegative"),
        sa.CheckConstraint("shares_count >= 0", name="ck_posts_shares_count_nonnegative"),
        sa.ForeignKeyConstraint(
            ["topic_id"], ["topics.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.user_id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_posts_slug", "posts", ["slug"], unique=True)
    op.create_index("ix_posts_topic_id", "posts", ["topic_id"], unique=False)
    op.create_index("ix_posts_user_id", "posts", ["user_id"], unique=False)
    op.create_index("ix_posts_status", "posts", ["status"], unique=False)
    op.create_index("ix_posts_published_at", "posts", ["published_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_posts_published_at", table_name="posts")
    op.drop_index("ix_posts_status", table_name="posts")
    op.drop_index("ix_posts_user_id", table_name="posts")
    op.drop_index("ix_posts_topic_id", table_name="posts")
    op.drop_index("ix_posts_slug", table_name="posts")
    op.drop_table("posts")
    op.drop_index("ix_topics_slug", table_name="topics")
    op.drop_table("topics")
