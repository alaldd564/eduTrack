'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEduData } from '@/lib/edu-data-context'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import type { Student } from '@/lib/types'

interface StudentListProps {
  onViewDetail: () => void
}

export function StudentList({ onViewDetail }: StudentListProps) {
  const { setSelectedStudentId } = useRole()
  const {
    filteredStudents,
    searchQuery,
    setSearchQuery,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useEduData()
  const [isSaving, setIsSaving] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [form, setForm] = useState<Student>({
    id: '',
    name: '',
    email: '',
    grade: '고등학교 2학년',
    enrolledDate: new Date().toISOString().slice(0, 10),
    overallProgress: 0,
    overallUnderstanding: 0,
    lastActivity: new Date().toISOString().slice(0, 10),
  })

  const handleViewDetail = (studentId: string) => {
    setSelectedStudentId(studentId)
    onViewDetail()
  }

  const resetForm = () => {
    setEditingStudentId(null)
    setForm({
      id: '',
      name: '',
      email: '',
      grade: '고등학교 2학년',
      enrolledDate: new Date().toISOString().slice(0, 10),
      overallProgress: 0,
      overallUnderstanding: 0,
      lastActivity: new Date().toISOString().slice(0, 10),
    })
  }

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.email) {
      return
    }

    setIsSaving(true)
    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, form)
      } else {
        await createStudent(form)
      }
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudentId(student.id)
    setForm(student)
  }

  const handleDelete = async (studentId: string) => {
    if (!window.confirm('정말 이 학생을 삭제하시겠습니까?')) {
      return
    }
    await deleteStudent(studentId)
    if (editingStudentId === studentId) {
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">학생 관리</h2>
        <p className="text-muted-foreground">
          학생별 학습 현황을 확인하고 관리하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>학생 목록</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="학생 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <Input
                placeholder="학생 ID"
                value={form.id}
                onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
                disabled={Boolean(editingStudentId)}
              />
              <Input
                placeholder="이름"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="이메일"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <select
                value={form.grade}
                onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">학년 선택</option>
                <option value="유치원">유치원</option>
                <option value="초등학교 1학년">초등학교 1학년</option>
                <option value="초등학교 2학년">초등학교 2학년</option>
                <option value="초등학교 3학년">초등학교 3학년</option>
                <option value="초등학교 4학년">초등학교 4학년</option>
                <option value="초등학교 5학년">초등학교 5학년</option>
                <option value="초등학교 6학년">초등학교 6학년</option>
                <option value="중학교 1학년">중학교 1학년</option>
                <option value="중학교 2학년">중학교 2학년</option>
                <option value="중학교 3학년">중학교 3학년</option>
                <option value="고등학교 1학년">고등학교 1학년</option>
                <option value="고등학교 2학년">고등학교 2학년</option>
                <option value="고등학교 3학년">고등학교 3학년</option>
                <option value="대학교 1학년">대학교 1학년</option>
                <option value="대학교 2학년">대학교 2학년</option>
                <option value="대학교 3학년">대학교 3학년</option>
                <option value="대학교 4학년">대학교 4학년</option>
              </select>
              <Input
                placeholder="등록일"
                value={form.enrolledDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, enrolledDate: e.target.value }))
                }
              />
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="진도율"
                value={form.overallProgress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    overallProgress: Number(e.target.value || 0),
                  }))
                }
              />
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="이해도"
                value={form.overallUnderstanding}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    overallUnderstanding: Number(e.target.value || 0),
                  }))
                }
              />
              <Input
                placeholder="최근 활동일"
                value={form.lastActivity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastActivity: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSaving}>
                {editingStudentId ? '학생 수정' : '학생 등록'}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                초기화
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    학년
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    진도율
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    이해도
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    최근 활동
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={cn(
                      'transition-colors hover:bg-muted/30',
                      index !== filteredStudents.length - 1 &&
                        'border-b border-border'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {student.grade}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-chart-1"
                            style={{ width: `${student.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-foreground">
                          {student.overallProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-sm font-medium',
                            student.overallUnderstanding >= 70
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : student.overallUnderstanding >= 50
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-rose-500/20 text-rose-500'
                          )}
                        >
                          {student.overallUnderstanding}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {student.lastActivity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(student.id)}
                        >
                          자세히 보기
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
