'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEduData } from '@/lib/edu-data-context'
import { fetchAttentionRequiredStudents } from '@/lib/api-client'
import {
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { ProgressChart } from '@/components/charts/progress-chart'
import { useEffect, useState } from 'react'

export function InstructorDashboard() {
  const { students, assignments, submissions } = useEduData()
  const [attentionStudents, setAttentionStudents] = useState<typeof students>([])
  const [isLoadingAttention, setIsLoadingAttention] = useState(false)

  useEffect(() => {
    const loadAttentionStudents = async () => {
      setIsLoadingAttention(true)
      try {
        const result = await fetchAttentionRequiredStudents()
        setAttentionStudents(result)
      } catch (error) {
        console.error('Failed to fetch attention students:', error)
        setAttentionStudents([])
      } finally {
        setIsLoadingAttention(false)
      }
    }

    loadAttentionStudents()
  }, [students])

  if (students.length === 0 || assignments.length === 0) {
    return null
  }

  const avgProgress =
    students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length
  const avgUnderstanding =
    students.reduce((sum, s) => sum + s.overallUnderstanding, 0) /
    students.length
  const submissionRate = Math.round(
    (submissions.length / (students.length * assignments.length)) * 100
  )

  const stats = [
    {
      label: '총 학생 수',
      value: students.length,
      icon: Users,
      change: '+2',
      trend: 'up',
    },
    {
      label: '등록 과제',
      value: assignments.length,
      icon: ClipboardList,
      change: '+5',
      trend: 'up',
    },
    {
      label: '과제 제출률',
      value: `${submissionRate}%`,
      icon: TrendingUp,
      change: '+8%',
      trend: 'up',
    },
    {
      label: '주의 필요 (주간 미변경)',
      value: attentionStudents.length,
      icon: AlertTriangle,
      change: attentionStudents.length === 0 ? '양호' : '주의',
      trend: attentionStudents.length === 0 ? 'down' : 'up',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Monitor your class performance in real-time
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-1.5">
          <Activity className="h-4 w-4 text-success" />
          <span className="font-mono text-xs text-success">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="group relative overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-[10px]',
                      stat.trend === 'up'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    )}
                  >
                    <ArrowUpRight
                      className={cn(
                        'h-3 w-3',
                        stat.trend === 'down' && 'rotate-90'
                      )}
                    />
                    {stat.change}
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-chart-1" />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <ProgressChart
              progress={Math.round(avgProgress)}
              size="lg"
              label="Class Average"
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              Average Understanding
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <ProgressChart
              progress={Math.round(avgUnderstanding)}
              size="lg"
              label="Class Average"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-warning/30 bg-warning/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-warning">
            <AlertTriangle className="h-4 w-4" />
            주의 필요 (일주일 미변경 학생)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAttention ? (
            <p className="py-4 text-center text-muted-foreground">로딩 중...</p>
          ) : attentionStudents.length > 0 ? (
            <div className="space-y-3">
              {attentionStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-xl border border-warning/20 bg-background/50 p-4 backdrop-blur-sm transition-all hover:border-warning/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20 font-mono text-sm font-semibold text-warning">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-sans font-medium text-foreground">
                        {student.name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {student.grade} · 진도 {student.overallProgress}% · 이해도 {student.overallUnderstanding}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-warning/20 px-2.5 py-1 font-mono text-xs font-semibold text-warning">
                      미변경
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <p className="mt-3 font-mono text-sm text-muted-foreground">
                All students are performing well
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
