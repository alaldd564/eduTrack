from pathlib import Path
from uuid import uuid4
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Response, UploadFile
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
from app.models import Assignment, CourseMaterial, DiscussionPost, DiscussionReply, LearningActivity, Student, Submission, User
from app.schemas import (
    AssignmentCreate,
    AssignmentOut,
    AssignmentUpdate,
    AuthLoginRequest,
    AuthMeResponse,
    AuthSignupRequest,
    AuthTokenResponse,
    DiscussionPostCreate,
    DiscussionPostOut,
    DiscussionReplyCreate,
    DiscussionReplyOut,
    MaterialOut,
    AIRecommendationRequest,
    AIRecommendationOut,
    ProfileResponse,
    ProfileUpdate,
    LinkInstructorRequest,
    StudentCreate,
    StudentOut,
    StudentUpdate,
    SubmissionCreate,
    SubmissionOut,
    SubmissionUpdate,
)
from app.seed_data import CURRICULUM_POOL, SUBJECTS, UNDERSTANDING_HISTORY, seed_if_needed
from app.security import generate_instructor_code, hash_password, verify_password
from app.ai_recommendation import get_ai_recommendation

app = FastAPI(title="edu-backend", version="1.0.0")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

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
        "answerText": submission.answer_text,
        "attachmentName": submission.attachment_name,
        "attachmentPath": submission.attachment_path,
        "feedback": submission.feedback,
    }


def material_to_dict(material: CourseMaterial) -> dict:
    return {
        "id": material.id,
        "subjectId": material.subject_id,
        "title": material.title,
        "originalFilename": material.original_filename,
        "storedFilename": material.stored_filename,
        "uploadedByUserId": material.uploaded_by_user_id,
        "createdAt": material.created_at,
    }


def post_to_dict(post: DiscussionPost) -> dict:
    return {
        "id": post.id,
        "subjectId": post.subject_id,
        "assignmentId": post.assignment_id,
        "authorUserId": post.author_user_id,
        "authorName": post.author_name,
        "title": post.title,
        "content": post.content,
        "createdAt": post.created_at,
    }


def reply_to_dict(reply: DiscussionReply) -> dict:
    return {
        "id": reply.id,
        "postId": reply.post_id,
        "authorUserId": reply.author_user_id,
        "authorName": reply.author_name,
        "content": reply.content,
        "createdAt": reply.created_at,
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
        display_name=user.display_name,
        student_id=user.student_id,
        instructor_code=user.instructor_code,
        linked_instructor_code=user.linked_instructor_code,
    )
    return AuthTokenResponse(
        accessToken=token,
        username=user.username,
        role=user.role,
        displayName=user.display_name,
        studentId=user.student_id,
        instructorCode=user.instructor_code,
        linkedInstructorCode=user.linked_instructor_code,
    )

def ensure_student_linked(user: dict, db: Session) -> None:
    if user["role"] != "student":
        return

    me_user = db.get(User, user["id"])
    if not me_user or not me_user.linked_instructor_code:
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
            display_name=display_name,
            bio=None,
            phone=None,
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
            display_name=(payload.name or username).strip() or username,
            bio=None,
            phone=None,
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
        displayName=user.get("displayName"),
        studentId=user.get("studentId"),
        instructorCode=user.get("instructorCode"),
        linkedInstructorCode=user.get("linkedInstructorCode"),
    )


@app.get("/api/profile", response_model=ProfileResponse)
def get_profile(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    me_user = db.get(User, user["id"])
    if not me_user:
        raise HTTPException(status_code=404, detail="User not found")

    student = db.get(Student, me_user.student_id) if me_user.student_id else None
    return ProfileResponse(
        username=me_user.username,
        role=me_user.role,
        displayName=me_user.display_name,
        bio=me_user.bio,
        phone=me_user.phone,
        studentId=me_user.student_id,
        instructorCode=me_user.instructor_code,
        linkedInstructorCode=me_user.linked_instructor_code,
        name=student.name if student else None,
        email=student.email if student else None,
        grade=student.grade if student else None,
    )


@app.put("/api/profile", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    me_user = db.get(User, user["id"])
    if not me_user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    if "displayName" in data:
        me_user.display_name = data["displayName"].strip() if data["displayName"] else None
    if "bio" in data:
        me_user.bio = data["bio"].strip() if data["bio"] else None
    if "phone" in data:
        me_user.phone = data["phone"].strip() if data["phone"] else None

    student = db.get(Student, me_user.student_id) if me_user.student_id else None
    if student:
        if "name" in data:
            student.name = data["name"].strip()
        if "email" in data:
            student.email = data["email"].strip()
        if "grade" in data:
            student.grade = data["grade"].strip()

    db.commit()
    db.refresh(me_user)
    if student:
        db.refresh(student)

    return get_profile(user=user, db=db)


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
        ensure_student_linked(user, db)
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
    materials = db.scalars(select(CourseMaterial)).all()

    history = (
        {user["studentId"]: UNDERSTANDING_HISTORY.get(user["studentId"], [])}
        if user["role"] == "student"
        else UNDERSTANDING_HISTORY
    )

    return {
        "students": [student_to_dict(s) for s in students],
        "subjects": SUBJECTS,
        "assignments": [assignment_to_dict(a) for a in assignments],
        "materials": [material_to_dict(m) for m in materials],
        "submissions": [submission_to_dict(s) for s in submissions],
        "learningActivities": [activity_to_dict(a) for a in activities],
        "understandingHistory": history,
        "curriculumPool": CURRICULUM_POOL,
    }


@app.get("/api/materials", response_model=list[MaterialOut])
def get_materials(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(CourseMaterial)).all()
    return [MaterialOut(**material_to_dict(row)) for row in rows]


@app.post("/api/materials", response_model=MaterialOut, status_code=201)
def upload_material(
    subjectId: str = Form(min_length=1, max_length=64),
    title: str = Form(min_length=1, max_length=200),
    file: UploadFile = File(...),
    user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    me_user = db.get(User, user["id"])
    if not me_user:
        raise HTTPException(status_code=404, detail="User not found")

    stored_name = f"{uuid4().hex}_{file.filename or 'material'}"
    stored_path = UPLOAD_DIR / stored_name
    with stored_path.open("wb") as handle:
        handle.write(file.file.read())

    material = CourseMaterial(
        id=f"mat-{uuid4().hex[:8]}",
        subject_id=subjectId,
        title=title,
        original_filename=file.filename or "material",
        stored_filename=stored_name,
        uploaded_by_user_id=me_user.id,
        created_at="2026-04-13",
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return MaterialOut(**material_to_dict(material))


@app.get("/api/community/posts", response_model=list[DiscussionPostOut])
def list_posts(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(DiscussionPost).order_by(DiscussionPost.created_at.desc())).all()
    return [DiscussionPostOut(**post_to_dict(row)) for row in rows]


@app.post("/api/community/posts", response_model=DiscussionPostOut, status_code=201)
def create_post(
    payload: DiscussionPostCreate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    me_user = db.get(User, user["id"])
    if not me_user:
        raise HTTPException(status_code=404, detail="User not found")

    post = DiscussionPost(
        id=f"post-{uuid4().hex[:8]}",
        subject_id=payload.subjectId,
        assignment_id=payload.assignmentId,
        author_user_id=me_user.id,
        author_name=me_user.display_name or me_user.username,
        title=payload.title,
        content=payload.content,
        created_at="2026-04-13",
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return DiscussionPostOut(**post_to_dict(post))


@app.get("/api/community/posts/{post_id}/replies", response_model=list[DiscussionReplyOut])
def list_replies(post_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(DiscussionReply).where(DiscussionReply.post_id == post_id).order_by(DiscussionReply.created_at.asc())).all()
    return [DiscussionReplyOut(**reply_to_dict(row)) for row in rows]


@app.post("/api/community/posts/{post_id}/replies", response_model=DiscussionReplyOut, status_code=201)
def create_reply(
    post_id: str,
    payload: DiscussionReplyCreate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(DiscussionPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    me_user = db.get(User, user["id"])
    if not me_user:
        raise HTTPException(status_code=404, detail="User not found")

    reply = DiscussionReply(
        id=f"reply-{uuid4().hex[:8]}",
        post_id=post_id,
        author_user_id=me_user.id,
        author_name=me_user.display_name or me_user.username,
        content=payload.content,
        created_at="2026-04-13",
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return DiscussionReplyOut(**reply_to_dict(reply))


@app.get("/api/submissions", response_model=list[SubmissionOut])
def list_submissions(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if user["role"] == "student":
        ensure_student_linked(user, db)
        rows = db.scalars(select(Submission).where(Submission.student_id == user.get("studentId"))).all()
    else:
        rows = db.scalars(select(Submission)).all()
    return [SubmissionOut(**submission_to_dict(row)) for row in rows]


@app.post("/api/submissions", response_model=SubmissionOut, status_code=201)
def create_submission(
    payload: SubmissionCreate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user["role"] == "student" and user.get("studentId") != payload.studentId:
        raise HTTPException(status_code=403, detail="Cannot submit for another student")

    existing = db.get(Submission, payload.id)
    if existing:
        raise HTTPException(status_code=409, detail="Submission already exists")

    submission = Submission(
        id=payload.id,
        student_id=payload.studentId,
        assignment_id=payload.assignmentId,
        score=payload.score,
        submitted_at=payload.submittedAt,
        answer_text=payload.answerText,
        attachment_name=payload.attachmentName,
        attachment_path=payload.attachmentPath,
        feedback=payload.feedback,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return SubmissionOut(**submission_to_dict(submission))


@app.put("/api/submissions/{submission_id}", response_model=SubmissionOut)
def update_submission(
    submission_id: str,
    payload: SubmissionUpdate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    submission = db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if user["role"] == "student" and user.get("studentId") != submission.student_id:
        raise HTTPException(status_code=403, detail="Cannot update another student's submission")

    data = payload.model_dump(exclude_unset=True)
    if "score" in data:
        submission.score = data["score"]
    if "submittedAt" in data:
        submission.submitted_at = data["submittedAt"]
    if "answerText" in data:
        submission.answer_text = data["answerText"]
    if "attachmentName" in data:
        submission.attachment_name = data["attachmentName"]
    if "attachmentPath" in data:
        submission.attachment_path = data["attachmentPath"]
    if "feedback" in data:
        submission.feedback = data["feedback"]

    db.commit()
    db.refresh(submission)
    return SubmissionOut(**submission_to_dict(submission))


@app.get("/api/students", response_model=list[StudentOut])
def get_students(
    search: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user["role"] == "student":
        ensure_student_linked(user, db)
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
            | func.lower(Student.email).like(search_lower)
            | Student.email.like(search_raw)
            | func.lower(Student.grade).like(search_lower)
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
    today = datetime.now().strftime("%Y-%m-%d")
    
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
        student.last_progress_update = today
    if "overallUnderstanding" in data:
        student.overall_understanding = data["overallUnderstanding"]
        student.last_understanding_update = today
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
        ensure_student_linked(user, db)

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
        ensure_student_linked(user, db)
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


@app.post("/api/ai-recommendation", response_model=AIRecommendationOut)
def get_ai_recommendation_for_student(
    payload: AIRecommendationRequest,
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    """교강사용: 학생의 맞춤형 AI 학습 추천 생성"""
    student = db.get(Student, payload.studentId)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 약점 단원 조회 (이해도 70% 미만)
    weak_chapters = []
    for subject in SUBJECTS:
        for chapter in subject.get("chapters", []):
            if chapter.get("understanding", 0) < 70:
                weak_chapters.append({
                    "name": chapter.get("name", ""),
                    "understanding": chapter.get("understanding", 0),
                })

    # 최근 과제 제출 조회
    recent_submissions = db.scalars(
        select(Submission)
        .where(Submission.student_id == student.id)
        .order_by(Submission.submitted_at.desc())
        .limit(5)
    ).all()

    submissions_for_ai = [
        {
            "title": (lambda aid: next((a.title for a in SUBJECTS[0].get("assignments", []) if a.get("id") == aid), "과제"))
            (sub.assignment_id),
            "score": sub.score,
        }
        for sub in recent_submissions
    ]

    # Ollama를 통한 AI 추천 생성
    recommendation = get_ai_recommendation(
        student_name=student.name,
        overall_progress=student.overall_progress,
        overall_understanding=student.overall_understanding,
        weak_chapters=weak_chapters,
        recent_submissions=submissions_for_ai,
    )

    return AIRecommendationOut(
        studentName=student.name,
        recommendation=recommendation or "현재 Ollama 서버를 사용할 수 없습니다. Ollama를 설치하고 실행해주세요.",
        overallProgress=student.overall_progress,
        overallUnderstanding=student.overall_understanding,
    )


@app.get("/api/students/attention-required", response_model=list[StudentOut])
def get_attention_required_students(
    _user: dict = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    """일주일 동안 진도율과 학습도가 변하지 않은 학생 조회"""
    today = datetime.now()
    week_ago = today - timedelta(days=7)
    week_ago_str = week_ago.strftime("%Y-%m-%d")

    # 진도율과 학습도가 모두 일주일 이상 변하지 않은 학생을 조회
    rows = db.scalars(
        select(Student).where(
            (
                (Student.last_progress_update.is_(None) | (Student.last_progress_update <= week_ago_str))
                & (Student.last_understanding_update.is_(None) | (Student.last_understanding_update <= week_ago_str))
            )
        )
    ).all()

    return [StudentOut(**student_to_dict(row)) for row in rows]
