'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRole } from '@/lib/role-context'
import { useEduData } from '@/lib/edu-data-context'
import { generateRecommendations } from '@/lib/recommendation-engine'
import { ProgressChart } from '@/components/charts/progress-chart'
import { UnderstandingChart } from '@/components/charts/understanding-chart'
import { SubjectChart } from '@/components/charts/subject-chart'
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Lightbulb,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function StudentDashboard() {
  const { selectedStudentId } = useRole()
  const {
    students,
    subjects,
    curriculumPool,
    getActivitiesByStudent,
    getUnderstandingHistoryByStudent,
  } = useEduData()
  const student = students.find((s) => s.id === selectedStudentId) || students[0]
  const recommendations = generateRecommendations(subjects, curriculumPool, 3)

  if (!student) {
    return null
  }

  const recentActivities = getActivitiesByStudent(student.id).slice(0, 4)
  const understandingHistory = getUnderstandingHistoryByStudent(student.id)

  const stats = [
    {
      label: 'Active Subjects',
      value: subjects.length,
      icon: BookOpen,
      color: 'primary',
    },
    {
      label: 'Recommendations',
      value: recommendations.length,
      icon: Lightbulb,
      color: 'chart-2',
    },
    {
      label: 'Study Time',
      value: '12h',
      icon: Clock,
      color: 'success',
    },
    {
      label: 'Goals Completed',
      value: '8',
      icon: Target,
      color: 'warning',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {student.name}
            </h2>
            <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-mono text-xs text-primary">Lv.{Math.floor(student.overallProgress / 10)}</span>
            </div>
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Ready to continue your learning journey?
          </p>
        </div>
        <Button className="gap-2 rounded-xl bg-primary font-mono text-xs text-primary-foreground glow-sm hover:bg-primary/90">
          Start Learning
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="group relative overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      stat.color === 'primary' && 'bg-primary/10 text-primary',
                      stat.color === 'chart-2' && 'bg-chart-2/10 text-chart-2',
                      stat.color === 'success' && 'bg-success/10 text-success',
                      stat.color === 'warning' && 'bg-warning/10 text-warning'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <ProgressChart
              progress={student.overallProgress}
              size="lg"
              label="Total Progress"
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              Understanding Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnderstandingChart data={understandingHistory} />
          </CardContent>
        </Card>
      </div>

      {/* Subjects and Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-chart-3" />
              Subject Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectChart subjects={subjects} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-secondary p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        activity.type === 'study'
                          ? 'bg-primary/10 text-primary'
                          : activity.type === 'assignment'
                            ? 'bg-chart-2/10 text-chart-2'
                            : 'bg-warning/10 text-warning'
                      )}
                    >
                      {activity.type === 'study' ? (
                        <BookOpen className="h-5 w-5" />
                      ) : activity.type === 'assignment' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <Target className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-sans text-sm font-medium text-foreground">
                        {activity.description}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {activity.date} - {activity.duration}min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 font-mono text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
