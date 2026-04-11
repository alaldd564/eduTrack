from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Student, Assignment, Submission, LearningActivity

SUBJECTS = [
    {
        "id": "subject-1",
        "name": "수학",
        "chapters": [
            {"id": "math-1", "name": "지수와 로그", "progress": 100, "understanding": 85},
            {"id": "math-2", "name": "삼각함수", "progress": 80, "understanding": 62},
            {"id": "math-3", "name": "수열", "progress": 60, "understanding": 55},
            {"id": "math-4", "name": "미분", "progress": 40, "understanding": 48},
            {"id": "math-5", "name": "적분", "progress": 20, "understanding": 35},
        ],
    },
    {
        "id": "subject-2",
        "name": "영어",
        "chapters": [
            {"id": "eng-1", "name": "문법 기초", "progress": 100, "understanding": 90},
            {"id": "eng-2", "name": "독해 전략", "progress": 90, "understanding": 78},
            {"id": "eng-3", "name": "작문", "progress": 70, "understanding": 65},
            {"id": "eng-4", "name": "듣기", "progress": 85, "understanding": 82},
        ],
    },
    {
        "id": "subject-3",
        "name": "과학",
        "chapters": [
            {"id": "sci-1", "name": "역학", "progress": 95, "understanding": 88},
            {"id": "sci-2", "name": "열역학", "progress": 75, "understanding": 68},
            {"id": "sci-3", "name": "전자기학", "progress": 50, "understanding": 45},
            {"id": "sci-4", "name": "파동", "progress": 30, "understanding": 40},
        ],
    },
    {
        "id": "subject-4",
        "name": "국어",
        "chapters": [
            {"id": "kor-1", "name": "현대 문학", "progress": 100, "understanding": 92},
            {"id": "kor-2", "name": "고전 문학", "progress": 85, "understanding": 75},
            {"id": "kor-3", "name": "비문학 독해", "progress": 90, "understanding": 80},
            {"id": "kor-4", "name": "작문", "progress": 65, "understanding": 70},
        ],
    },
]

CURRICULUM_POOL = [
    {
        "id": "rec-1",
        "title": "미분의 기초 개념 정리",
        "description": "미분의 정의와 기본 공식을 차근차근 학습합니다.",
        "targetChapterId": "math-4",
        "targetChapterName": "미분",
        "subjectName": "수학",
        "difficulty": "basic",
        "estimatedTime": 30,
        "resourceType": "video",
    },
    {
        "id": "rec-2",
        "title": "미분 공식 연습문제 모음",
        "description": "다양한 미분 공식을 적용하는 연습문제입니다.",
        "targetChapterId": "math-4",
        "targetChapterName": "미분",
        "subjectName": "수학",
        "difficulty": "intermediate",
        "estimatedTime": 45,
        "resourceType": "practice",
    },
    {
        "id": "rec-3",
        "title": "적분의 기초 이해하기",
        "description": "적분의 개념과 미분과의 관계를 학습합니다.",
        "targetChapterId": "math-5",
        "targetChapterName": "적분",
        "subjectName": "수학",
        "difficulty": "basic",
        "estimatedTime": 40,
        "resourceType": "video",
    },
]

UNDERSTANDING_HISTORY = {
    "student-1": [
        {"date": "2024-11", "understanding": 55},
        {"date": "2024-12", "understanding": 60},
        {"date": "2025-01", "understanding": 63},
        {"date": "2025-02", "understanding": 68},
        {"date": "2025-03", "understanding": 70},
        {"date": "2025-04", "understanding": 72},
    ],
    "student-2": [
        {"date": "2024-11", "understanding": 70},
        {"date": "2024-12", "understanding": 75},
        {"date": "2025-01", "understanding": 80},
        {"date": "2025-02", "understanding": 84},
        {"date": "2025-03", "understanding": 86},
        {"date": "2025-04", "understanding": 88},
    ],
}


def seed_if_needed(db: Session) -> None:
    has_student = db.scalar(select(Student.id).limit(1))
    if has_student:
        return

    db.add_all(
        [
            Student(
                id="student-1",
                name="김민준",
                email="minjun.kim@school.edu",
                grade="고등학교 2학년",
                enrolled_date="2024-03-01",
                overall_progress=78,
                overall_understanding=72,
                last_activity="2025-04-10",
            ),
            Student(
                id="student-2",
                name="이서연",
                email="seoyeon.lee@school.edu",
                grade="고등학교 2학년",
                enrolled_date="2024-03-01",
                overall_progress=92,
                overall_understanding=88,
                last_activity="2025-04-11",
            ),
            Student(
                id="student-3",
                name="박지호",
                email="jiho.park@school.edu",
                grade="고등학교 2학년",
                enrolled_date="2024-03-01",
                overall_progress=65,
                overall_understanding=58,
                last_activity="2025-04-09",
            ),
        ]
    )

    db.add_all(
        [
            Assignment(
                id="assign-1",
                title="미분 연습문제 1-20번",
                subject_id="subject-1",
                subject_name="수학",
                due_date="2025-04-15",
                max_score=100,
                description="미분의 기본 개념을 활용한 연습문제입니다.",
            ),
            Assignment(
                id="assign-2",
                title="영어 에세이 작성",
                subject_id="subject-2",
                subject_name="영어",
                due_date="2025-04-18",
                max_score=100,
                description="주어진 주제에 대해 500단어 이상의 에세이를 작성하세요.",
            ),
        ]
    )

    db.add_all(
        [
            Submission(
                id="sub-1",
                student_id="student-1",
                assignment_id="assign-1",
                score=78,
                submitted_at="2025-04-14",
                feedback="기본 개념은 잘 이해했으나, 복잡한 문제에서 실수가 있습니다.",
            ),
            Submission(
                id="sub-2",
                student_id="student-2",
                assignment_id="assign-1",
                score=95,
                submitted_at="2025-04-13",
                feedback="매우 우수합니다. 심화 문제도 도전해보세요.",
            ),
        ]
    )

    db.add_all(
        [
            LearningActivity(
                id="act-1",
                student_id="student-1",
                type="study",
                description="미분 개념 영상 학습",
                date="2025-04-10",
                duration=45,
            ),
            LearningActivity(
                id="act-2",
                student_id="student-1",
                type="assignment",
                description="미분 연습문제 제출",
                date="2025-04-14",
                duration=60,
            ),
        ]
    )

    db.commit()
