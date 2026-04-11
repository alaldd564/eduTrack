'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEduData } from '@/lib/edu-data-context'
import {
  generateRecommendations,
  getDifficultyColor,
  getDifficultyLabel,
  getResourceTypeLabel,
} from '@/lib/recommendation-engine'
import {
  Lightbulb,
  Clock,
  Play,
  FileText,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CurriculumRecommendation } from '@/lib/types'

function getResourceIcon(type: CurriculumRecommendation['resourceType']) {
  switch (type) {
    case 'video':
      return Play
    case 'article':
      return FileText
    case 'practice':
      return BookOpen
    case 'quiz':
      return HelpCircle
  }
}

export function CurriculumRecommendations() {
  const { subjects, curriculumPool } = useEduData()
  const recommendations = generateRecommendations(subjects, curriculumPool, 10)

  const basicRecs = recommendations.filter((r) => r.difficulty === 'basic')
  const intermediateRecs = recommendations.filter(
    (r) => r.difficulty === 'intermediate'
  )
  const advancedRecs = recommendations.filter((r) => r.difficulty === 'advanced')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
              AI Recommendations
            </h2>
            <div className="flex items-center gap-1 rounded-lg bg-chart-2/10 px-2 py-1">
              <Cpu className="h-3 w-3 text-chart-2" />
              <span className="font-mono text-xs text-chart-2">Powered by AI</span>
            </div>
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Personalized learning resources based on your performance
          </p>
        </div>
      </div>

      {/* Main Recommendations */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-4 w-4 text-chart-2" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            Based on your learning patterns, we recommend the following resources to strengthen weak areas.
          </p>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec) => {
                const Icon = getResourceIcon(rec.resourceType)
                return (
                  <div
                    key={rec.id}
                    className="group rounded-xl border border-border/50 bg-background/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-background"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2 transition-all group-hover:bg-chart-2/20 group-hover:glow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h4 className="font-sans font-semibold text-foreground">
                              {rec.title}
                            </h4>
                            <p className="font-mono text-xs text-muted-foreground">
                              {rec.subjectName} / {rec.targetChapterName}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider',
                              getDifficultyColor(rec.difficulty)
                            )}
                          >
                            {getDifficultyLabel(rec.difficulty)}
                          </span>
                        </div>
                        <p className="mb-4 font-sans text-sm text-muted-foreground">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {rec.estimatedTime} min
                            </span>
                            <span className="rounded-lg bg-secondary px-2 py-0.5">
                              {getResourceTypeLabel(rec.resourceType)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="gap-2 rounded-lg bg-primary font-mono text-xs text-primary-foreground glow-sm hover:bg-primary/90"
                          >
                            Start
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                <Lightbulb className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                Excellent Progress!
              </h3>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                No additional recommendations at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Categories */}
      {recommendations.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-success/30 bg-success/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-success">
                <div className="h-2 w-2 rounded-full bg-success" />
                Basic Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              {basicRecs.length > 0 ? (
                <div className="space-y-3">
                  {basicRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-xl border border-success/20 bg-background/50 p-4 backdrop-blur-sm transition-all hover:border-success/40"
                    >
                      <p className="font-sans text-sm font-medium text-foreground">
                        {rec.title}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {rec.subjectName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center font-mono text-xs text-muted-foreground">
                  No recommendations
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-warning">
                <div className="h-2 w-2 rounded-full bg-warning" />
                Intermediate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {intermediateRecs.length > 0 ? (
                <div className="space-y-3">
                  {intermediateRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-xl border border-warning/20 bg-background/50 p-4 backdrop-blur-sm transition-all hover:border-warning/40"
                    >
                      <p className="font-sans text-sm font-medium text-foreground">
                        {rec.title}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {rec.subjectName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center font-mono text-xs text-muted-foreground">
                  No recommendations
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-destructive">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                Advanced
              </CardTitle>
            </CardHeader>
            <CardContent>
              {advancedRecs.length > 0 ? (
                <div className="space-y-3">
                  {advancedRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-xl border border-destructive/20 bg-background/50 p-4 backdrop-blur-sm transition-all hover:border-destructive/40"
                    >
                      <p className="font-sans text-sm font-medium text-foreground">
                        {rec.title}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {rec.subjectName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center font-mono text-xs text-muted-foreground">
                  No recommendations
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
