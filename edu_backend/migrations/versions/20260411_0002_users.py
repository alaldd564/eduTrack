"""add users table

Revision ID: 20260411_0002
Revises: 20260411_0001
Create Date: 2026-04-11 00:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260411_0002"
down_revision: Union[str, None] = "20260411_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("student_id", sa.String(length=64), nullable=True),
        sa.Column("instructor_code", sa.String(length=20), nullable=True),
        sa.Column("linked_instructor_code", sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("instructor_code"),
    )


def downgrade() -> None:
    op.drop_table("users")
