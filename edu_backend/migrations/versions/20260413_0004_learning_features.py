"""add learning feature tables

Revision ID: 20260413_0004
Revises: 20260413_0003
Create Date: 2026-04-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260413_0004"
down_revision: Union[str, None] = "20260413_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("submissions", sa.Column("answer_text", sa.String(length=2000), nullable=True))
    op.add_column("submissions", sa.Column("attachment_name", sa.String(length=200), nullable=True))
    op.add_column("submissions", sa.Column("attachment_path", sa.String(length=500), nullable=True))

    op.create_table(
        "course_materials",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("subject_id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("uploaded_by_user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.String(length=20), nullable=False),
    )

    op.create_table(
        "discussion_posts",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("subject_id", sa.String(length=64), nullable=True),
        sa.Column("assignment_id", sa.String(length=64), nullable=True),
        sa.Column("author_user_id", sa.Integer(), nullable=False),
        sa.Column("author_name", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.String(length=2000), nullable=False),
        sa.Column("created_at", sa.String(length=20), nullable=False),
    )

    op.create_table(
        "discussion_replies",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("post_id", sa.String(length=64), nullable=False),
        sa.Column("author_user_id", sa.Integer(), nullable=False),
        sa.Column("author_name", sa.String(length=100), nullable=False),
        sa.Column("content", sa.String(length=2000), nullable=False),
        sa.Column("created_at", sa.String(length=20), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("discussion_replies")
    op.drop_table("discussion_posts")
    op.drop_table("course_materials")
    op.drop_column("submissions", "attachment_path")
    op.drop_column("submissions", "attachment_name")
    op.drop_column("submissions", "answer_text")
