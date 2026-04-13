'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRole } from '@/lib/role-context'
import { useEduData } from '@/lib/edu-data-context'
import { generateRecommendations } from '@/lib/recommendation-engine'
import { fetchAIRecommendation } from '@/lib/api-client'
import { ProgressChart } from '@/components/charts/progress-chart'
import { UnderstandingChart } from '@/components/charts/understanding-chart'
import { SubjectChart } from '@/components/charts/subject-chart'
import { ArrowLeft, Mail, Calendar, BookOpen, Sparkles, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface StudentDetailProps {
  onBack: () => void
}

export function StudentDetail({ onBack }: StudentDetailProps) {
  const { selectedStudentId } = useRole()
  const {
    students,
    subjects,
    curriculumPool,
    getSubmissionsByStudent,
    getAssignmentById,
    getUnderstandingHistoryByStudent,
  } = useEduData()
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const student = students.find((s) => s.id === selectedStudentId)

  useEffect(() => {
    if (!student) return

    const loadAIRecommendation = async () => {
      setIsLoadingAI(true)
      try {
        const result = await fetchAIRecommendation(student.id)
        setAiRecommendation(result.recommendation)
      } catch (error) {
        console.error('Failed to fetch AI recommendation:', error)
        setAiRecommendation(null)
      } finally {
        setIsLoadingAI(false)
      }
    }

    loadAIRecommendation()
  }, [student])

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">학생을 찾을 수 없습니다.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const submissions = getSubmissionsByStudent(student.id)
  const recommendations = generateRecommendations(subjects, curriculumPool, 3)
  const understandingHistory = getUnderstandingHistoryByStudent(student.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
          <p className="text-muted-foreground">학생 상세 정보</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                {student.name.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {student.name}
              </h3>
              <p className="text-muted-foreground">{student.grade}</p>

              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    등록일: {student.enrolledDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    최근 활동: {student.lastActivity}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>학습 현황 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <ProgressChart
                progress={student.overallProgress}
                size="md"
                label="전체 진도"
              />
              <ProgressChart
                progress={student.overallUnderstanding}
                size="md"
                label="전체 이해도"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>이해도 변화 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <UnderstandingChart data={understandingHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>과목별 학습 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectChart subjects={subjects} />
          </CardContent>
        </Card>
      </div>

      {aiRecommendation && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 기반 맞춤형 학습 추천
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAI ? (
              <div className="flex items-center gap-2 py-8">
                <Loader className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">AI 추천을 생성 중입니다...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {aiRecommendation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>과제 제출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const assignment = getAssignmentById(submission.assignmentId)
                  return (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {assignment?.title || '과제'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          제출일: {submission.submittedAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-sm font-medium',
                            submission.score >= 80
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : submission.score >= 60
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-rose-500/20 text-rose-500'
                          )}
                        >
                          {submission.score}점
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                제출된 과제가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>추천 학습 커리큘럼</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{rec.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {rec.subjectName} - {rec.targetChapterName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        rec.difficulty === 'basic'
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                          : rec.difficulty === 'intermediate'
                            ? 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                            : 'border-rose-500/30 bg-rose-500/20 text-rose-400'
                      )}
                    >
                      {rec.difficulty === 'basic'
                        ? '기초'
                        : rec.difficulty === 'intermediate'
                          ? '중급'
                          : '심화'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
