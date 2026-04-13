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
  materials?: ProgramMaterial[]
  chapters: Chapter[]
}

export interface ProgramMaterial {
  id: string
  title: string
  subjectId?: string
  type?: 'pdf' | 'word' | 'link'
  updatedAt?: string
  originalFilename?: string
  storedFilename?: string
  uploadedByUserId?: number
  createdAt?: string
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
  answerText?: string | null
  attachmentName?: string | null
  attachmentPath?: string | null
  feedback?: string
}

export interface DiscussionPost {
  id: string
  subjectId?: string | null
  assignmentId?: string | null
  authorUserId: number
  authorName: string
  title: string
  content: string
  createdAt: string
}

export interface DiscussionReply {
  id: string
  postId: string
  authorUserId: number
  authorName: string
  content: string
  createdAt: string
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
