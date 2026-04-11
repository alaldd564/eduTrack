from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.auth import (
    create_access_token,
    get_current_user,
    require_instructor,
    require_student,
)
from app.config import get_cors_origins, should_auto_create_tables, should_seed_on_startup
from app.models import Assignment, LearningActivity, Student, Submission, User
from app.schemas import (
    AssignmentCreate,
    AssignmentOut,
    AssignmentUpdate,
    AuthLoginRequest,
    AuthMeResponse,
    AuthSignupRequest,
    AuthTokenResponse,
    LinkInstructorRequest,
    StudentCreate,
    StudentOut,
    StudentUpdate,
)
from app.seed_data import CURRICULUM_POOL, SUBJECTS, UNDERSTANDING_HISTORY, seed_if_needed
from app.security import generate_instructor_code, hash_password, verify_password

app = FastAPI(title="edu-backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    if should_auto_create_tables():
        Base.metadata.create_all(bind=engine)
    if should_seed_on_startup():
        with Session(engine) as db:
            seed_if_needed(db)


def student_to_dict(student: Student) -> dict:
    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "grade": student.grade,
        "enrolledDate": student.enrolled_date,
        "overallProgress": student.overall_progress,
        "overallUnderstanding": student.overall_understanding,
        "lastActivity": student.last_activity,
    }


def assignment_to_dict(assignment: Assignment) -> dict:
    return {
        "id": assignment.id,
        "title": assignment.title,
        "subjectId": assignment.subject_id,
        "subjectName": assignment.subject_name,
        "dueDate": assignment.due_date,
        "maxScore": assignment.max_score,
        "description": assignment.description,
    }


def submission_to_dict(submission: Submission) -> dict:
    return {
        "id": submission.id,
        "studentId": submission.student_id,
        "assignmentId": submission.assignment_id,
        "score": submission.score,
        "submittedAt": submission.submitted_at,
        "feedback": submission.feedback,
    }


def activity_to_dict(activity: LearningActivity) -> dict:
    return {
        "id": activity.id,
        "studentId": activity.student_id,
        "type": activity.type,
        "description": activity.description,
        "date": activity.date,
        "duration": activity.duration,
    }


def auth_response_from_user(user: User) -> AuthTokenResponse:
    token = create_access_token(
        user_id=user.id,
        username=user.username,
        role=user.role,  # type: ignore[arg-type]
        student_id=user.student_id,
        instructor_code=user.instructor_code,
        linked_instructor_code=user.linked_instructor_code,
    )
    return AuthTokenResponse(
        accessToken=token,
        username=user.username,
        role=user.role,
        studentId=user.student_id,
        instructorCode=user.instructor_code,
        linkedInstructorCode=user.linked_instructor_code,
    )


def ensure_student_linked(user: dict) -> None:
    if user["role"] == "student" and not user.get("linkedInstructorCode"):
        raise HTTPException(status_code=403, detail="Instructor link required")


def ensure_student_scope(user: dict, student_id: str) -> None:
    if user["role"] == "student" and user.get("studentId") != student_id:
        raise HTTPException(status_code=403, detail="Access denied for this student")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/auth/signup", response_model=AuthTokenResponse)
def signup(payload: AuthSignupRequest, db: Session = Depends(get_db)):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = db.scalar(select(User).where(User.username == username))
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    role = payload.role
    if role == "student":
        email = (payload.email or f"{username}@student.local").strip()
        email_exists = db.scalar(select(Student).where(Student.email == email))
        if email_exists:
            raise HTTPException(status_code=409, detail="Email already exists")

        display_name = (payload.name or username).strip()
        if not display_name:
            raise HTTPException(status_code=400, detail="Name is required for student signup")

        grade = (payload.grade or "고등학교 2학년").strip() or "고등학교 2학년"

        student = Student(
            id=f"student-{uuid4().hex[:8]}",
            name=display_name,
            email=email,
            grade=grade,
            enrolled_date="2026-04-11",
            overall_progress=0,
            overall_understanding=0,
            last_activity="2026-04-11",
        )
        db.add(student)
        db.flush()

        user = User(
            username=username,
            password_hash=hash_password(payload.password),
            role="student",
            student_id=student.id,
            linked_instructor_code=None,
            instructor_code=None,
        )
    else:
        instructor_code = None
        for _ in range(20):
            candidate = generate_instructor_code(8)
            duplicate = db.scalar(select(User).where(User.instructor_code == candidate))
            if not duplicate:
                instructor_code = candidate
                break

        if not instructor_code:
            raise HTTPException(status_code=500, detail="Failed to generate instructor code")

        user = User(
            username=username,
            password_hash=hash_password(payload.password),
            role="instructor",
            student_id=None,
            instructor_code=instructor_code,
            linked_instructor_code=None,
        )

    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_response_from_user(user)


@app.post("/api/auth/login", response_model=AuthTokenResponse)
def login(payload: AuthLoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    user = db.scalar(select(User).where(User.username == username))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return auth_response_from_user(user)


@app.get("/api/auth/me", response_model=AuthMeResponse)
def me(user: dict = Depends(get_current_user)):
    return AuthMeResponse(
        username=user["username"],
        role=user["role"],
        studentId=user.get("studentId"),
        instructorCode=user.get("instructorCode"),
        linkedInstructorCode=user.get("linkedInstructorCode"),
    )


@app.post("/api/auth/link-instructor", response_model=AuthTokenResponse)
def link_instructor(
    payload: LinkInstructorRequest,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    me_user = db.get(User, current_user["id"])
    if not me_user:
        raise HTTPException(status_code=404, detail="User not found")

    instructor = db.scalar(
        select(User).where(
            User.role == "instructor", User.instructor_code == payload.instructorCode
        )
    )
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor code not found")

    me_user.linked_instructor_code = instructor.instructor_code
    db.commit()
    db.refresh(me_user)

    return auth_response_from_user(me_user)


@app.get("/api/bootstrap")
def bootstrap(user: dict = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if user["role"] == "student":
        ensure_student_linked(user)
        student_id = user.get("studentId")
        students = db.scalars(select(Student).where(Student.id == student_id)).all()
        submissions = db.scalars(
            select(Submission).where(Submission.student_id == student_id)
        ).all()
        activities = db.scalars(
            select(LearningActivity).where(LearningActivity.student_id == student_id)
        ).all()
    else:
        students = db.scalars(select(Student)).all()
        submissions = db.scalars(select(Submission)).all()
        activities = db.scalars(select(LearningActivity)).all()

    assignments = db.scalars(select(Assignment)).all()

    history = (
        {user["studentId"]: UNDERSTANDING_HISTORY.get(user["studentId"], [])}
        if user["role"] == "student"
        else UNDERSTANDING_HISTORY
    )

    return {
        "students": [student_to_dict(s) for s in students],
        "subjects": SUBJECTS,
        "assignments": [assignment_to_dict(a) for a in assignments],
        "submissions": [submission_to_dict(s) for s in submissions],
        "learningActivities": [activity_to_dict(a) for a in activities],
        "understandingHistory": history,
        "curriculumPool": CURRICULUM_POOL,
    }


@app.get("/api/students", response_model=list[StudentOut])
def get_students(
    search: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user["role"] == "student":
        ensure_student_linked(user)
        own = db.get(Student, user.get("studentId"))
        if not own:
            return []
        return [StudentOut(**student_to_dict(own))]

    statement = select(Student)
    if search:
        search_lower = f"%{search.lower()}%"
        search_raw = f"%{search}%"
        statement = statement.where(
            func.lower(Student.name).like(search_lower)
            | Student.name.like(search_raw)
        )
    rows = db.scalars(statement).all()
    return [StudentOut(**student_to_dict(row)) for row in rows]


@app.post("/api/students", response_model=StudentOut, status_code=201)
def create_student(
    payload: StudentCreate,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    exists = db.get(Student, payload.id)
    if exists:
        raise HTTPException(status_code=409, detail="Student id already exists")

    student = Student(
        id=payload.id,
        name=payload.name,
        email=payload.email,
        grade=payload.grade,
        enrolled_date=payload.enrolledDate,
        overall_progress=payload.overallProgress,
        overall_understanding=payload.overallUnderstanding,
        last_activity=payload.lastActivity,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return StudentOut(**student_to_dict(student))


@app.put("/api/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    payload: StudentUpdate,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        student.name = data["name"]
    if "email" in data:
        student.email = data["email"]
    if "grade" in data:
        student.grade = data["grade"]
    if "enrolledDate" in data:
        student.enrolled_date = data["enrolledDate"]
    if "overallProgress" in data:
        student.overall_progress = data["overallProgress"]
    if "overallUnderstanding" in data:
        student.overall_understanding = data["overallUnderstanding"]
    if "lastActivity" in data:
        student.last_activity = data["lastActivity"]

    db.commit()
    db.refresh(student)
    return StudentOut(**student_to_dict(student))


@app.delete("/api/students/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return Response(status_code=204)


@app.get("/api/assignments", response_model=list[AssignmentOut])
def get_assignments(
    search: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user["role"] == "student":
        ensure_student_linked(user)

    statement = select(Assignment)
    if search:
        search_lower = f"%{search.lower()}%"
        search_raw = f"%{search}%"
        statement = statement.where(
            func.lower(Assignment.title).like(search_lower)
            | func.lower(Assignment.subject_name).like(search_lower)
            | Assignment.title.like(search_raw)
            | Assignment.subject_name.like(search_raw)
        )

    rows = db.scalars(statement).all()
    return [AssignmentOut(**assignment_to_dict(row)) for row in rows]


@app.post("/api/assignments", response_model=AssignmentOut, status_code=201)
def create_assignment(
    payload: AssignmentCreate,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    exists = db.get(Assignment, payload.id)
    if exists:
        raise HTTPException(status_code=409, detail="Assignment id already exists")

    assignment = Assignment(
        id=payload.id,
        title=payload.title,
        subject_id=payload.subjectId,
        subject_name=payload.subjectName,
        due_date=payload.dueDate,
        max_score=payload.maxScore,
        description=payload.description,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return AssignmentOut(**assignment_to_dict(assignment))


@app.put("/api/assignments/{assignment_id}", response_model=AssignmentOut)
def update_assignment(
    assignment_id: str,
    payload: AssignmentUpdate,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data:
        assignment.title = data["title"]
    if "subjectId" in data:
        assignment.subject_id = data["subjectId"]
    if "subjectName" in data:
        assignment.subject_name = data["subjectName"]
    if "dueDate" in data:
        assignment.due_date = data["dueDate"]
    if "maxScore" in data:
        assignment.max_score = data["maxScore"]
    if "description" in data:
        assignment.description = data["description"]

    db.commit()
    db.refresh(assignment)
    return AssignmentOut(**assignment_to_dict(assignment))


@app.delete("/api/assignments/{assignment_id}", status_code=204)
def delete_assignment(
    assignment_id: str,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return Response(status_code=204)


@app.get("/api/students/{student_id}/submissions")
def get_student_submissions(
    student_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_student_scope(user, student_id)
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    rows = db.scalars(select(Submission).where(Submission.student_id == student_id)).all()
    return [submission_to_dict(row) for row in rows]


@app.get("/api/assignments/{assignment_id}/submissions")
def get_assignment_submissions(
    assignment_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if user["role"] == "student":
        ensure_student_linked(user)
        rows = db.scalars(
            select(Submission).where(
                Submission.assignment_id == assignment_id,
                Submission.student_id == user.get("studentId"),
            )
        ).all()
    else:
        rows = db.scalars(
            select(Submission).where(Submission.assignment_id == assignment_id)
        ).all()
    return [submission_to_dict(row) for row in rows]


@app.get("/api/students/{student_id}/activities")
def get_student_activities(
    student_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_student_scope(user, student_id)
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    rows = db.scalars(
        select(LearningActivity).where(LearningActivity.student_id == student_id)
    ).all()
    return [activity_to_dict(row) for row in rows]


@app.get("/api/students/{student_id}/understanding-history")
def get_student_understanding_history(
    student_id: str,
    user: dict = Depends(get_current_user),
):
    ensure_student_scope(user, student_id)
    return UNDERSTANDING_HISTORY.get(student_id, UNDERSTANDING_HISTORY.get("student-1", []))


@app.get("/api/curriculum-pool")
def get_curriculum_pool(_user: dict = Depends(get_current_user)):
    return CURRICULUM_POOL


@app.get("/api/subjects")
def get_subjects(_user: dict = Depends(get_current_user)):
    return SUBJECTS
