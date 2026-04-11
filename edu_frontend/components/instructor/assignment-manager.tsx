'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEduData } from '@/lib/edu-data-context'
import { cn } from '@/lib/utils'
import { Calendar, FileText, Users } from 'lucide-react'
import type { Assignment } from '@/lib/types'

export function AssignmentManager() {
  const {
    filteredAssignments,
    students,
    getSubmissionsByAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useEduData()
  const [isSaving, setIsSaving] = useState(false)
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null
  )
  const [form, setForm] = useState<Assignment>({
    id: '',
    title: '',
    subjectId: 'subject-1',
    subjectName: '수학',
    dueDate: new Date().toISOString().slice(0, 10),
    maxScore: 100,
    description: '',
  })

  if (students.length === 0) {
    return null
  }

  const resetForm = () => {
    setEditingAssignmentId(null)
    setForm({
      id: '',
      title: '',
      subjectId: 'subject-1',
      subjectName: '수학',
      dueDate: new Date().toISOString().slice(0, 10),
      maxScore: 100,
      description: '',
    })
  }

  const handleSubmit = async () => {
    if (!form.id || !form.title || !form.description) {
      return
    }

    setIsSaving(true)
    try {
      if (editingAssignmentId) {
        await updateAssignment(editingAssignmentId, form)
      } else {
        await createAssignment(form)
      }
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id)
    setForm(assignment)
  }

  const handleDelete = async (assignmentId: string) => {
    if (!window.confirm('정말 이 과제를 삭제하시겠습니까?')) {
      return
    }
    await deleteAssignment(assignmentId)
    if (editingAssignmentId === assignmentId) {
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">과제 관리</h2>
        <p className="text-muted-foreground">
          등록된 과제와 제출 현황을 확인하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingAssignmentId ? '과제 수정' : '과제 등록'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-4">
            <Input
              placeholder="과제 ID"
              value={form.id}
              onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
              disabled={Boolean(editingAssignmentId)}
            />
            <Input
              placeholder="과제명"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="과목 ID"
              value={form.subjectId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subjectId: e.target.value }))
              }
            />
            <Input
              placeholder="과목명"
              value={form.subjectName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subjectName: e.target.value }))
              }
            />
            <Input
              placeholder="마감일"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
            <Input
              type="number"
              min={0}
              max={1000}
              placeholder="만점"
              value={form.maxScore}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxScore: Number(e.target.value || 0) }))
              }
            />
            <Input
              className="md:col-span-2"
              placeholder="설명"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingAssignmentId ? '과제 수정' : '과제 등록'}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isSaving}>
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment) => {
          const submissions = getSubmissionsByAssignment(assignment.id)
          const submissionRate = Math.round(
            (submissions.length / students.length) * 100
          )
          const avgScore =
            submissions.length > 0
              ? Math.round(
                  submissions.reduce((sum, s) => sum + s.score, 0) /
                    submissions.length
                )
              : 0

          const dueDate = new Date(assignment.dueDate)
          const today = new Date()
          const isPastDue = dueDate < today

          return (
            <Card key={assignment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/20">
                    <FileText className="h-5 w-5 text-chart-1" />
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      isPastDue
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-emerald-500/20 text-emerald-500'
                    )}
                  >
                    {isPastDue ? '마감됨' : '진행중'}
                  </span>
                </div>
                <CardTitle className="mt-3 text-base">
                  {assignment.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {assignment.subjectName}
                </p>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {assignment.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>마감일</span>
                    </div>
                    <span
                      className={cn(
                        'font-medium',
                        isPastDue ? 'text-muted-foreground' : 'text-foreground'
                      )}
                    >
                      {assignment.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>제출률</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            submissionRate >= 80
                              ? 'bg-emerald-500'
                              : submissionRate >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          )}
                          style={{ width: `${submissionRate}%` }}
                        />
                      </div>
                      <span className="font-medium text-foreground">
                        {submissionRate}%
                      </span>
                    </div>
                  </div>

                  {submissions.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">평균 점수</span>
                      <span
                        className={cn(
                          'font-medium',
                          avgScore >= 80
                            ? 'text-emerald-500'
                            : avgScore >= 60
                              ? 'text-amber-500'
                              : 'text-rose-500'
                        )}
                      >
                        {avgScore}점
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(assignment)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
