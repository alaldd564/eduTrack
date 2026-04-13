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


class SubmissionBase(BaseModel):
    studentId: str = Field(min_length=1, max_length=64)
    assignmentId: str = Field(min_length=1, max_length=64)
    score: int = Field(ge=0, le=100)
    submittedAt: str
    answerText: str | None = Field(default=None, max_length=2000)
    attachmentName: str | None = Field(default=None, max_length=200)
    attachmentPath: str | None = Field(default=None, max_length=500)
    feedback: str | None = Field(default=None, max_length=1000)


class SubmissionCreate(SubmissionBase):
    id: str = Field(min_length=1, max_length=64)


class SubmissionUpdate(BaseModel):
    score: int | None = Field(default=None, ge=0, le=100)
    submittedAt: str | None = None
    answerText: str | None = Field(default=None, max_length=2000)
    attachmentName: str | None = Field(default=None, max_length=200)
    attachmentPath: str | None = Field(default=None, max_length=500)
    feedback: str | None = Field(default=None, max_length=1000)


class SubmissionOut(SubmissionCreate):
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
    displayName: str | None = None
    studentId: str | None = None
    instructorCode: str | None = None
    linkedInstructorCode: str | None = None


class AuthMeResponse(BaseModel):
    username: str
    role: str
    displayName: str | None = None
    studentId: str | None = None
    instructorCode: str | None = None
    linkedInstructorCode: str | None = None


class ProfileResponse(BaseModel):
    username: str
    role: str
    displayName: str | None = None
    bio: str | None = None
    phone: str | None = None
    studentId: str | None = None
    instructorCode: str | None = None
    linkedInstructorCode: str | None = None
    name: str | None = None
    email: str | None = None
    grade: str | None = None


class ProfileUpdate(BaseModel):
    displayName: str | None = Field(default=None, max_length=100)
    bio: str | None = Field(default=None, max_length=500)
    phone: str | None = Field(default=None, max_length=30)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, min_length=3, max_length=200)
    grade: str | None = Field(default=None, min_length=1, max_length=80)


class MaterialCreate(BaseModel):
    subjectId: str = Field(min_length=1, max_length=64)
    title: str = Field(min_length=1, max_length=200)


class MaterialOut(BaseModel):
    id: str
    subjectId: str
    title: str
    originalFilename: str
    storedFilename: str
    uploadedByUserId: int
    createdAt: str


class DiscussionPostCreate(BaseModel):
    subjectId: str | None = Field(default=None, max_length=64)
    assignmentId: str | None = Field(default=None, max_length=64)
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=2000)


class DiscussionPostOut(BaseModel):
    id: str
    subjectId: str | None = None
    assignmentId: str | None = None
    authorUserId: int
    authorName: str
    title: str
    content: str
    createdAt: str


class DiscussionReplyCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class DiscussionReplyOut(BaseModel):
    id: str
    postId: str
    authorUserId: int
    authorName: str
    content: str
    createdAt: str


class LinkInstructorRequest(BaseModel):
    instructorCode: str = Field(min_length=4, max_length=20)
