"""merge multiple heads

Revision ID: ac79d764fa15
Revises: 8b9d2f4e1a10, 9d3e2a4b7c61, e71b2d3c4e5f
Create Date: 2026-11-27 19:50:48.424900

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ac79d764fa15'
down_revision: Union[str, Sequence[str], None] = ('8b9d2f4e1a10', '9d3e2a4b7c61', 'e71b2d3c4e5f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
