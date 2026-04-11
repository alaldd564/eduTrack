'use client'

import type { Chapter } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChapterChartProps {
  chapters: Chapter[]
  subjectName: string
}

export function ChapterChart({ chapters, subjectName }: ChapterChartProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">{subjectName}</h4>
      <div className="space-y-3">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{chapter.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  진도 {chapter.progress}%
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    chapter.understanding >= 70
                      ? 'text-emerald-500'
                      : chapter.understanding >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  )}
                >
                  이해도 {chapter.understanding}%
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1 transition-all"
                  style={{ width: `${chapter.progress}%` }}
                />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    chapter.understanding >= 70
                      ? 'bg-emerald-500'
                      : chapter.understanding >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  )}
                  style={{ width: `${chapter.understanding}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
