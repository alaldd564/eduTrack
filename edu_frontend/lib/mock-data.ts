import type {
  Student,
  Subject,
  Assignment,
  Submission,
  LearningActivity,
  UnderstandingHistory,
  CurriculumRecommendation,
} from './types'

// 학생 목록
export const students: Student[] = [
  {
    id: 'student-1',
    name: '김민준',
    email: 'minjun.kim@school.edu',
    grade: '고등학교 2학년',
    enrolledDate: '2024-03-01',
    overallProgress: 78,
    overallUnderstanding: 72,
    lastActivity: '2025-04-10',
  },
  {
    id: 'student-2',
    name: '이서연',
    email: 'seoyeon.lee@school.edu',
    grade: '고등학교 2학년',
    enrolledDate: '2024-03-01',
    overallProgress: 92,
    overallUnderstanding: 88,
    lastActivity: '2025-04-11',
  },
  {
    id: 'student-3',
    name: '박지호',
    email: 'jiho.park@school.edu',
    grade: '고등학교 2학년',
    enrolledDate: '2024-03-01',
    overallProgress: 65,
    overallUnderstanding: 58,
    lastActivity: '2025-04-09',
  },
  {
    id: 'student-4',
    name: '최수아',
    email: 'sua.choi@school.edu',
    grade: '고등학교 2학년',
    enrolledDate: '2024-03-01',
    overallProgress: 85,
    overallUnderstanding: 80,
    lastActivity: '2025-04-11',
  },
  {
    id: 'student-5',
    name: '정윤서',
    email: 'yunseo.jung@school.edu',
    grade: '고등학교 2학년',
    enrolledDate: '2024-03-01',
    overallProgress: 55,
    overallUnderstanding: 45,
    lastActivity: '2025-04-08',
  },
]

// 과목 및 단원
export const subjects: Subject[] = [
  {
    id: 'subject-1',
    name: '수학',
    chapters: [
      { id: 'math-1', name: '지수와 로그', progress: 100, understanding: 85 },
      { id: 'math-2', name: '삼각함수', progress: 80, understanding: 62 },
      { id: 'math-3', name: '수열', progress: 60, understanding: 55 },
      { id: 'math-4', name: '미분', progress: 40, understanding: 48 },
      { id: 'math-5', name: '적분', progress: 20, understanding: 35 },
    ],
  },
  {
    id: 'subject-2',
    name: '영어',
    chapters: [
      { id: 'eng-1', name: '문법 기초', progress: 100, understanding: 90 },
      { id: 'eng-2', name: '독해 전략', progress: 90, understanding: 78 },
      { id: 'eng-3', name: '작문', progress: 70, understanding: 65 },
      { id: 'eng-4', name: '듣기', progress: 85, understanding: 82 },
    ],
  },
  {
    id: 'subject-3',
    name: '과학',
    chapters: [
      { id: 'sci-1', name: '역학', progress: 95, understanding: 88 },
      { id: 'sci-2', name: '열역학', progress: 75, understanding: 68 },
      { id: 'sci-3', name: '전자기학', progress: 50, understanding: 45 },
      { id: 'sci-4', name: '파동', progress: 30, understanding: 40 },
    ],
  },
  {
    id: 'subject-4',
    name: '국어',
    chapters: [
      { id: 'kor-1', name: '현대 문학', progress: 100, understanding: 92 },
      { id: 'kor-2', name: '고전 문학', progress: 85, understanding: 75 },
      { id: 'kor-3', name: '비문학 독해', progress: 90, understanding: 80 },
      { id: 'kor-4', name: '작문', progress: 65, understanding: 70 },
    ],
  },
]

// 과제 목록
export const assignments: Assignment[] = [
  {
    id: 'assign-1',
    title: '미분 연습문제 1-20번',
    subjectId: 'subject-1',
    subjectName: '수학',
    dueDate: '2025-04-15',
    maxScore: 100,
    description: '미분의 기본 개념을 활용한 연습문제입니다.',
  },
  {
    id: 'assign-2',
    title: '영어 에세이 작성',
    subjectId: 'subject-2',
    subjectName: '영어',
    dueDate: '2025-04-18',
    maxScore: 100,
    description: '주어진 주제에 대해 500단어 이상의 에세이를 작성하세요.',
  },
  {
    id: 'assign-3',
    title: '역학 실험 보고서',
    subjectId: 'subject-3',
    subjectName: '과학',
    dueDate: '2025-04-20',
    maxScore: 100,
    description: '자유낙하 실험 결과를 분석하고 보고서를 작성하세요.',
  },
  {
    id: 'assign-4',
    title: '현대시 분석 과제',
    subjectId: 'subject-4',
    subjectName: '국어',
    dueDate: '2025-04-22',
    maxScore: 100,
    description: '지정된 현대시 3편을 분석하세요.',
  },
  {
    id: 'assign-5',
    title: '삼각함수 응용문제',
    subjectId: 'subject-1',
    subjectName: '수학',
    dueDate: '2025-04-25',
    maxScore: 100,
    description: '삼각함수의 실생활 응용 문제를 풀어보세요.',
  },
]

// 과제 제출 현황
export const submissions: Submission[] = [
  {
    id: 'sub-1',
    studentId: 'student-1',
    assignmentId: 'assign-1',
    score: 78,
    submittedAt: '2025-04-14',
    feedback: '기본 개념은 잘 이해했으나, 복잡한 문제에서 실수가 있습니다.',
  },
  {
    id: 'sub-2',
    studentId: 'student-2',
    assignmentId: 'assign-1',
    score: 95,
    submittedAt: '2025-04-13',
    feedback: '매우 우수합니다. 심화 문제도 도전해보세요.',
  },
  {
    id: 'sub-3',
    studentId: 'student-3',
    assignmentId: 'assign-1',
    score: 62,
    submittedAt: '2025-04-15',
    feedback: '미분의 기본 공식 복습이 필요합니다.',
  },
  {
    id: 'sub-4',
    studentId: 'student-1',
    assignmentId: 'assign-2',
    score: 85,
    submittedAt: '2025-04-17',
    feedback: '문법과 구조가 좋습니다. 어휘 다양성을 높여보세요.',
  },
  {
    id: 'sub-5',
    studentId: 'student-2',
    assignmentId: 'assign-2',
    score: 92,
    submittedAt: '2025-04-16',
  },
  {
    id: 'sub-6',
    studentId: 'student-4',
    assignmentId: 'assign-1',
    score: 88,
    submittedAt: '2025-04-14',
  },
  {
    id: 'sub-7',
    studentId: 'student-4',
    assignmentId: 'assign-2',
    score: 90,
    submittedAt: '2025-04-17',
  },
]

// 학습 활동 기록
export const learningActivities: LearningActivity[] = [
  {
    id: 'act-1',
    studentId: 'student-1',
    type: 'study',
    description: '미분 개념 영상 학습',
    date: '2025-04-10',
    duration: 45,
  },
  {
    id: 'act-2',
    studentId: 'student-1',
    type: 'assignment',
    description: '미분 연습문제 제출',
    date: '2025-04-14',
    duration: 60,
  },
  {
    id: 'act-3',
    studentId: 'student-1',
    type: 'quiz',
    description: '삼각함수 퀴즈 완료',
    date: '2025-04-09',
    duration: 20,
  },
  {
    id: 'act-4',
    studentId: 'student-1',
    type: 'study',
    description: '영어 문법 복습',
    date: '2025-04-08',
    duration: 30,
  },
  {
    id: 'act-5',
    studentId: 'student-1',
    type: 'assignment',
    description: '영어 에세이 제출',
    date: '2025-04-17',
    duration: 90,
  },
]

// 이해도 히스토리 (최근 6개월)
export const understandingHistory: UnderstandingHistory[] = [
  { date: '2024-11', understanding: 55 },
  { date: '2024-12', understanding: 60 },
  { date: '2025-01', understanding: 63 },
  { date: '2025-02', understanding: 68 },
  { date: '2025-03', understanding: 70 },
  { date: '2025-04', understanding: 72 },
]

// 추천 커리큘럼 풀
export const curriculumPool: CurriculumRecommendation[] = [
  // 수학 - 미분
  {
    id: 'rec-1',
    title: '미분의 기초 개념 정리',
    description: '미분의 정의와 기본 공식을 차근차근 학습합니다.',
    targetChapterId: 'math-4',
    targetChapterName: '미분',
    subjectName: '수학',
    difficulty: 'basic',
    estimatedTime: 30,
    resourceType: 'video',
  },
  {
    id: 'rec-2',
    title: '미분 공식 연습문제 모음',
    description: '다양한 미분 공식을 적용하는 연습문제입니다.',
    targetChapterId: 'math-4',
    targetChapterName: '미분',
    subjectName: '수학',
    difficulty: 'intermediate',
    estimatedTime: 45,
    resourceType: 'practice',
  },
  // 수학 - 적분
  {
    id: 'rec-3',
    title: '적분의 기초 이해하기',
    description: '적분의 개념과 미분과의 관계를 학습합니다.',
    targetChapterId: 'math-5',
    targetChapterName: '적분',
    subjectName: '수학',
    difficulty: 'basic',
    estimatedTime: 40,
    resourceType: 'video',
  },
  {
    id: 'rec-4',
    title: '정적분 계산 연습',
    description: '정적분의 계산 방법을 연습합니다.',
    targetChapterId: 'math-5',
    targetChapterName: '적분',
    subjectName: '수학',
    difficulty: 'intermediate',
    estimatedTime: 50,
    resourceType: 'practice',
  },
  // 수학 - 수열
  {
    id: 'rec-5',
    title: '수열의 기본 개념',
    description: '등차수열과 등비수열의 기초를 학습합니다.',
    targetChapterId: 'math-3',
    targetChapterName: '수열',
    subjectName: '수학',
    difficulty: 'basic',
    estimatedTime: 35,
    resourceType: 'article',
  },
  // 수학 - 삼각함수
  {
    id: 'rec-6',
    title: '삼각함수 그래프 이해하기',
    description: '삼각함수의 그래프와 특성을 시각적으로 학습합니다.',
    targetChapterId: 'math-2',
    targetChapterName: '삼각함수',
    subjectName: '수학',
    difficulty: 'intermediate',
    estimatedTime: 40,
    resourceType: 'video',
  },
  // 과학 - 전자기학
  {
    id: 'rec-7',
    title: '전기장과 자기장 기초',
    description: '전자기학의 기본 개념을 쉽게 설명합니다.',
    targetChapterId: 'sci-3',
    targetChapterName: '전자기학',
    subjectName: '과학',
    difficulty: 'basic',
    estimatedTime: 45,
    resourceType: 'video',
  },
  {
    id: 'rec-8',
    title: '전자기 유도 법칙 이해',
    description: '패러데이 법칙과 렌츠 법칙을 학습합니다.',
    targetChapterId: 'sci-3',
    targetChapterName: '전자기학',
    subjectName: '과학',
    difficulty: 'intermediate',
    estimatedTime: 50,
    resourceType: 'article',
  },
  // 과학 - 파동
  {
    id: 'rec-9',
    title: '파동의 기본 성질',
    description: '파동의 종류와 특성을 학습합니다.',
    targetChapterId: 'sci-4',
    targetChapterName: '파동',
    subjectName: '과학',
    difficulty: 'basic',
    estimatedTime: 30,
    resourceType: 'video',
  },
  {
    id: 'rec-10',
    title: '파동 방정식 연습',
    description: '파동 방정식을 활용한 문제 풀이 연습입니다.',
    targetChapterId: 'sci-4',
    targetChapterName: '파동',
    subjectName: '과학',
    difficulty: 'intermediate',
    estimatedTime: 40,
    resourceType: 'practice',
  },
  // 영어 - 작문
  {
    id: 'rec-11',
    title: '영어 에세이 구조 잡기',
    description: '효과적인 영어 에세이 작성 방법을 배웁니다.',
    targetChapterId: 'eng-3',
    targetChapterName: '작문',
    subjectName: '영어',
    difficulty: 'basic',
    estimatedTime: 35,
    resourceType: 'article',
  },
  {
    id: 'rec-12',
    title: '고급 영작문 표현 익히기',
    description: '다양한 고급 표현과 연결어를 학습합니다.',
    targetChapterId: 'eng-3',
    targetChapterName: '작문',
    subjectName: '영어',
    difficulty: 'advanced',
    estimatedTime: 45,
    resourceType: 'article',
  },
]

// 헬퍼 함수들
export function getStudentById(id: string): Student | undefined {
  return students.find((s) => s.id === id)
}

export function getSubmissionsByStudent(studentId: string): Submission[] {
  return submissions.filter((s) => s.studentId === studentId)
}

export function getSubmissionsByAssignment(assignmentId: string): Submission[] {
  return submissions.filter((s) => s.assignmentId === assignmentId)
}

export function getActivitiesByStudent(studentId: string): LearningActivity[] {
  return learningActivities.filter((a) => a.studentId === studentId)
}

export function getAssignmentById(id: string): Assignment | undefined {
  return assignments.find((a) => a.id === id)
}
