"""initial schema

Revision ID: 20260411_0001
Revises: 
Create Date: 2026-04-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260411_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "students",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=200), nullable=False),
        sa.Column("grade", sa.String(length=80), nullable=False),
        sa.Column("enrolled_date", sa.String(length=20), nullable=False),
        sa.Column("overall_progress", sa.Integer(), nullable=False),
        sa.Column("overall_understanding", sa.Integer(), nullable=False),
        sa.Column("last_activity", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "assignments",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("subject_id", sa.String(length=64), nullable=False),
        sa.Column("subject_name", sa.String(length=80), nullable=False),
        sa.Column("due_date", sa.String(length=20), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "submissions",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("student_id", sa.String(length=64), nullable=False),
        sa.Column("assignment_id", sa.String(length=64), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("submitted_at", sa.String(length=20), nullable=False),
        sa.Column("feedback", sa.String(length=1000), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "learning_activities",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("student_id", sa.String(length=64), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("description", sa.String(length=300), nullable=False),
        sa.Column("date", sa.String(length=20), nullable=False),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("learning_activities")
    op.drop_table("submissions")
    op.drop_table("assignments")
    op.drop_table("students")
