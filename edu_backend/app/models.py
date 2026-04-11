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
    feedback: Mapped[str | None] = mapped_column(String(1000), nullable=True)


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(String(300), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    student_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    instructor_code: Mapped[str | None] = mapped_column(String(20), nullable=True, unique=True)
    linked_instructor_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
