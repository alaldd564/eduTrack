'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEduData } from '@/lib/edu-data-context'
import { ChapterChart } from '@/components/charts/chapter-chart'
import { cn } from '@/lib/utils'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

export function SubjectLearning() {
  const { subjects } = useEduData()
  const [expandedSubject, setExpandedSubject] = useState<string | null>(
    subjects[0]?.id || null
  )

  const toggleSubject = (subjectId: string) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">과목별 학습</h2>
        <p className="text-muted-foreground">
          과목별 학습 현황과 단원별 진도를 확인하세요.
        </p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const avgProgress =
            subject.chapters.reduce((sum, ch) => sum + ch.progress, 0) /
            subject.chapters.length
          const avgUnderstanding =
            subject.chapters.reduce((sum, ch) => sum + ch.understanding, 0) /
            subject.chapters.length
          const isExpanded = expandedSubject === subject.id

          return (
            <Card key={subject.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/20 text-chart-1">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{subject.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {subject.chapters.length}개 단원
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">진도율</p>
                      <p className="text-lg font-semibold text-foreground">
                        {Math.round(avgProgress)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">이해도</p>
                      <p
                        className={cn(
                          'text-lg font-semibold',
                          avgUnderstanding >= 70
                            ? 'text-emerald-500'
                            : avgUnderstanding >= 50
                              ? 'text-amber-500'
                              : 'text-rose-500'
                        )}
                      >
                        {Math.round(avgUnderstanding)}%
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t border-border pt-6">
                  <ChapterChart
                    chapters={subject.chapters}
                    subjectName={subject.name}
                  />
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
