// 학생 정보
export interface Student {
  id: string
  name: string
  email: string
  grade: string
  enrolledDate: string
  overallProgress: number
  overallUnderstanding: number
  lastActivity: string
}

// 과목 정보
export interface Subject {
  id: string
  name: string
  chapters: Chapter[]
}

// 단원 정보
export interface Chapter {
  id: string
  name: string
  progress: number
  understanding: number
}

// 과제 정보
export interface Assignment {
  id: string
  title: string
  subjectId: string
  subjectName: string
  dueDate: string
  maxScore: number
  description: string
}

// 과제 제출
export interface Submission {
  id: string
  studentId: string
  assignmentId: string
  score: number
  submittedAt: string
  feedback?: string
}

// 추천 커리큘럼
export interface CurriculumRecommendation {
  id: string
  title: string
  description: string
  targetChapterId: string
  targetChapterName: string
  subjectName: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  estimatedTime: number
  resourceType: 'video' | 'article' | 'practice' | 'quiz'
}

// 학습 활동 기록
export interface LearningActivity {
  id: string
  studentId: string
  type: 'assignment' | 'study' | 'quiz'
  description: string
  date: string
  duration: number
}

// 이해도 히스토리
export interface UnderstandingHistory {
  date: string
  understanding: number
}

// 역할 타입
export type Role = 'instructor' | 'student'
