'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRole } from '@/lib/role-context'
import { useEduData } from '@/lib/edu-data-context'
import { identifyWeakChapters } from '@/lib/recommendation-engine'
import { UnderstandingChart } from '@/components/charts/understanding-chart'
import { ProgressChart } from '@/components/charts/progress-chart'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProgressAnalysis() {
  const { selectedStudentId } = useRole()
  const { students, subjects, getUnderstandingHistoryByStudent } = useEduData()
  const student = students.find((s) => s.id === selectedStudentId) || students[0]
  const weakChapters = identifyWeakChapters(subjects)

  if (!student) {
    return null
  }

  const understandingHistory = getUnderstandingHistoryByStudent(student.id)

  // 강점 단원 찾기 (이해도 80% 이상)
  const strongChapters = subjects.flatMap((subject) =>
    subject.chapters
      .filter((ch) => ch.understanding >= 80)
      .map((ch) => ({
        ...ch,
        subjectName: subject.name,
      }))
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">진도 분석</h2>
        <p className="text-muted-foreground">
          나의 학습 진도와 이해도를 분석해보세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>전체 학습 진도</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <ProgressChart
              progress={student.overallProgress}
              size="lg"
              label="전체 진도"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전체 이해도</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <ProgressChart
              progress={student.overallUnderstanding}
              size="lg"
              label="전체 이해도"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>학습 현황 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-foreground">강점 단원</p>
                <p className="text-lg font-bold text-emerald-500">
                  {strongChapters.length}개
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">보완 필요</p>
                <p className="text-lg font-bold text-amber-500">
                  {weakChapters.length}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            이해도 변화 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UnderstandingChart data={understandingHistory} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              강점 단원
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongChapters.length > 0 ? (
              <div className="space-y-3">
                {strongChapters.slice(0, 5).map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {chapter.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {chapter.subjectName}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-sm font-medium text-emerald-500">
                      {chapter.understanding}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                아직 강점 단원이 없습니다. 꾸준히 학습해보세요!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              보완이 필요한 단원
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakChapters.length > 0 ? (
              <div className="space-y-3">
                {weakChapters.slice(0, 5).map((chapter) => (
                  <div
                    key={chapter.chapterId}
                    className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {chapter.chapterName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {chapter.subjectName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-sm font-medium',
                        chapter.understanding < 50
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-amber-500/20 text-amber-500'
                      )}
                    >
                      {chapter.understanding}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                모든 단원의 이해도가 양호합니다!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
