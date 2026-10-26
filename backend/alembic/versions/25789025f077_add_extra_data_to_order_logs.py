"""add_extra_data_to_order_logs

Revision ID: 25789025f077
Revises: af66b5a8150e
Create Date: 2026-10-26 16:42:52.215870

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25789025f077'
down_revision: Union[str, Sequence[str], None] = 'af66b5a8150e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'order_logs',
        sa.Column(
            'extra_data',
            sa.JSON(),
            nullable=True,
            comment='Metadata kỹ thuật chi tiết của sự kiện (dạng JSON)',
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('order_logs', 'extra_data')
