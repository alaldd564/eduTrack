from typing import Literal

from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=200)
    grade: str = Field(min_length=1, max_length=80)
    enrolledDate: str
    overallProgress: int = Field(ge=0, le=100)
    overallUnderstanding: int = Field(ge=0, le=100)
    lastActivity: str


class StudentCreate(StudentBase):
    id: str = Field(min_length=1, max_length=64)


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, min_length=3, max_length=200)
    grade: str | None = Field(default=None, min_length=1, max_length=80)
    enrolledDate: str | None = None
    overallProgress: int | None = Field(default=None, ge=0, le=100)
    overallUnderstanding: int | None = Field(default=None, ge=0, le=100)
    lastActivity: str | None = None


class StudentOut(StudentCreate):
    pass


class AssignmentBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subjectId: str = Field(min_length=1, max_length=64)
    subjectName: str = Field(min_length=1, max_length=80)
    dueDate: str
    maxScore: int = Field(ge=0, le=1000)
    description: str = Field(min_length=1, max_length=1000)


class AssignmentCreate(AssignmentBase):
    id: str = Field(min_length=1, max_length=64)


class AssignmentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    subjectId: str | None = Field(default=None, min_length=1, max_length=64)
    subjectName: str | None = Field(default=None, min_length=1, max_length=80)
    dueDate: str | None = None
    maxScore: int | None = Field(default=None, ge=0, le=1000)
    description: str | None = Field(default=None, min_length=1, max_length=1000)


class AssignmentOut(AssignmentCreate):
    pass


class AuthSignupRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=200)
    role: Literal["student", "instructor"]
    name: str | None = Field(default=None, min_length=0, max_length=100)
    email: str | None = Field(default=None, min_length=3, max_length=200)
    grade: str | None = Field(default=None, min_length=0, max_length=80)


class AuthLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=200)


class AuthTokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "Bearer"
    username: str
    role: str
    studentId: str | None = None
    instructorCode: str | None = None
    linkedInstructorCode: str | None = None


class AuthMeResponse(BaseModel):
    username: str
    role: str
    studentId: str | None = None
    instructorCode: str | None = None
    linkedInstructorCode: str | None = None


class LinkInstructorRequest(BaseModel):
    instructorCode: str = Field(min_length=4, max_length=20)
