from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    grade: Mapped[str] = mapped_column(String(80), nullable=False)
    enrolled_date: Mapped[str] = mapped_column(String(20), nullable=False)
    overall_progress: Mapped[int] = mapped_column(Integer, nullable=False)
    overall_understanding: Mapped[int] = mapped_column(Integer, nullable=False)
    last_activity: Mapped[str] = mapped_column(String(20), nullable=False)


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(64), nullable=False)
    subject_name: Mapped[str] = mapped_column(String(80), nullable=False)
    due_date: Mapped[str] = mapped_column(String(20), nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assignment_id: Mapped[str] = mapped_column(String(64), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    submitted_at: Mapped[str] = mapped_column(String(20), nullable=False)
    answer_text: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    attachment_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    attachment_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    feedback: Mapped[str | None] = mapped_column(String(1000), nullable=True)


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(String(300), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)


class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    subject_id: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_by_user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[str] = mapped_column(String(20), nullable=False)


class DiscussionPost(Base):
    __tablename__ = "discussion_posts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    subject_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    assignment_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    author_user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(String(2000), nullable=False)
    created_at: Mapped[str] = mapped_column(String(20), nullable=False)


class DiscussionReply(Base):
    __tablename__ = "discussion_replies"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    post_id: Mapped[str] = mapped_column(String(64), nullable=False)
    author_user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(String(2000), nullable=False)
    created_at: Mapped[str] = mapped_column(String(20), nullable=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    student_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    instructor_code: Mapped[str | None] = mapped_column(String(20), nullable=True, unique=True)
    linked_instructor_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
