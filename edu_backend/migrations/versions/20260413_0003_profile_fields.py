"""add profile fields to users

Revision ID: 20260413_0003
Revises: 20260411_0002
Create Date: 2026-04-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260413_0003"
down_revision: Union[str, None] = "20260411_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("display_name", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("bio", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(length=30), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone")
    op.drop_column("users", "bio")
    op.drop_column("users", "display_name")
