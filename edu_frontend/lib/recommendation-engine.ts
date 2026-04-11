import type { Subject, CurriculumRecommendation } from './types'

interface WeakChapter {
  chapterId: string
  chapterName: string
  subjectName: string
  understanding: number
  progress: number
}

// 약점 단원 식별 (이해도 70% 미만)
export function identifyWeakChapters(subjects: Subject[]): WeakChapter[] {
  const weakChapters: WeakChapter[] = []

  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      if (chapter.understanding < 70) {
        weakChapters.push({
          chapterId: chapter.id,
          chapterName: chapter.name,
          subjectName: subject.name,
          understanding: chapter.understanding,
          progress: chapter.progress,
        })
      }
    }
  }

  // 이해도가 낮은 순으로 정렬
  return weakChapters.sort((a, b) => a.understanding - b.understanding)
}

// 난이도 결정
function determineDifficulty(
  understanding: number
): 'basic' | 'intermediate' | 'advanced' {
  if (understanding < 50) return 'basic'
  if (understanding < 70) return 'intermediate'
  return 'advanced'
}

// 추천 커리큘럼 생성
export function generateRecommendations(
  subjects: Subject[],
  curriculumPool: CurriculumRecommendation[],
  limit: number = 5
): CurriculumRecommendation[] {
  const weakChapters = identifyWeakChapters(subjects)
  const recommendations: CurriculumRecommendation[] = []

  for (const weak of weakChapters) {
    const targetDifficulty = determineDifficulty(weak.understanding)

    // 해당 단원에 맞는 추천 찾기
    const matching = curriculumPool.filter(
      (rec) =>
        rec.targetChapterId === weak.chapterId &&
        rec.difficulty === targetDifficulty
    )

    // 매칭되는 추천이 없으면 같은 단원의 다른 난이도 추천
    if (matching.length === 0) {
      const fallback = curriculumPool.filter(
        (rec) => rec.targetChapterId === weak.chapterId
      )
      if (fallback.length > 0) {
        recommendations.push(fallback[0])
      }
    } else {
      recommendations.push(...matching)
    }

    if (recommendations.length >= limit) break
  }

  return recommendations.slice(0, limit)
}

// 특정 과목의 추천만 필터링
export function getRecommendationsBySubject(
  subjects: Subject[],
  curriculumPool: CurriculumRecommendation[],
  subjectName: string
): CurriculumRecommendation[] {
  return generateRecommendations(subjects, curriculumPool, 10).filter(
    (rec) => rec.subjectName === subjectName
  )
}

// 난이도별 색상 반환
export function getDifficultyColor(
  difficulty: 'basic' | 'intermediate' | 'advanced'
): string {
  switch (difficulty) {
    case 'basic':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'intermediate':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'advanced':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  }
}

// 난이도 한글 변환
export function getDifficultyLabel(
  difficulty: 'basic' | 'intermediate' | 'advanced'
): string {
  switch (difficulty) {
    case 'basic':
      return '기초'
    case 'intermediate':
      return '중급'
    case 'advanced':
      return '심화'
  }
}

// 리소스 타입 아이콘/라벨
export function getResourceTypeLabel(
  type: 'video' | 'article' | 'practice' | 'quiz'
): string {
  switch (type) {
    case 'video':
      return '동영상'
    case 'article':
      return '읽기 자료'
    case 'practice':
      return '연습문제'
    case 'quiz':
      return '퀴즈'
  }
}
