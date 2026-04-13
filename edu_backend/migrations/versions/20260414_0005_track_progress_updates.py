"""track_progress_updates

Revision ID: 20260414_0005
Revises: 20260413_0004
Create Date: 2026-04-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260414_0005'
down_revision = '20260413_0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('students', sa.Column('last_progress_update', sa.String(length=20), nullable=True))
    op.add_column('students', sa.Column('last_understanding_update', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('students', 'last_understanding_update')
    op.drop_column('students', 'last_progress_update')
