'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEduData } from '@/lib/edu-data-context'
import { useRole } from '@/lib/role-context'
import { uploadMaterial } from '@/lib/api-client'
import { BookOpen, CalendarDays, FileText, Layers3, List, Sparkles, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProgramLibrary() {
  const { subjects, assignments, materials, refreshMaterials } = useEduData()
  const { role } = useRole()
  const [selectedProgramId, setSelectedProgramId] = useState(subjects[0]?.id || '')
  const [uploadSubjectId, setUploadSubjectId] = useState(subjects[0]?.id || '')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const programs = useMemo(
    () =>
      [...subjects].map((subject) => ({
        ...subject,
        materials: [...(subject.materials || [])].sort((a, b) =>
          (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '')
        ),
      })),
    [subjects]
  )

  const selectedProgram =
    programs.find((subject) => subject.id === selectedProgramId) || programs[0]

  const linkedAssignments = assignments.filter(
    (assignment) => assignment.subjectId === (selectedProgram?.id || '')
  )

  const programMaterials = useMemo(
    () =>
      materials
        .filter((material) => material.subjectId === (selectedProgram?.id || ''))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [materials, selectedProgram?.id]
  )

  useEffect(() => {
    if (!uploadSubjectId && subjects[0]) {
      setUploadSubjectId(subjects[0].id)
    }
  }, [subjects, uploadSubjectId])

  if (!selectedProgram) {
    return null
  }

  const handleUpload = async () => {
    if (!uploadSubjectId || !uploadTitle.trim() || !uploadFile) {
      alert('제목, 주제, 파일을 모두 선택해주세요.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('subjectId', uploadSubjectId)
      formData.append('title', uploadTitle.trim())
      formData.append('file', uploadFile)
      await uploadMaterial(formData)
      await refreshMaterials()
      setUploadTitle('')
      setUploadFile(null)
      alert('파일이 성공적으로 업로드되었습니다.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 업로드에 실패했습니다.'
      console.error('Upload error:', error)
      alert(`업로드 실패: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">프로그램 목록</h2>
          <p className="text-muted-foreground">
            교강사 커리큘럼, 강의 자료, 관련 과제를 한 화면에서 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-chart-2" />
          최신 자료 우선 정렬
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers3 className="h-4 w-4 text-primary" />
              프로그램 리스트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {programs.map((program) => {
              const active = selectedProgram.id === program.id
              return (
                <button
                  key={program.id}
                  onClick={() => setSelectedProgramId(program.id)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/8'
                      : 'border-border bg-background hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{program.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {program.chapters.length}개 단원 · {program.materials?.length || 0}개 자료
                      </p>
                    </div>
                    <BookOpen className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                {selectedProgram.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">단원 수</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{selectedProgram.chapters.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">강의 자료</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{selectedProgram.materials?.length || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">관련 과제</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{linkedAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {role === 'instructor' && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4 text-primary" />
                  강의 자료 업로드
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="자료 제목"
                />
                <select
                  value={uploadSubjectId}
                  onChange={(e) => setUploadSubjectId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                  {isUploading ? '업로드 중...' : '자료 업로드'}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <List className="h-4 w-4 text-primary" />
                  최신 강의 자료
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {programMaterials.length > 0 ? (
                  programMaterials.map((material) => (
                    <div key={material.id} className="rounded-xl border border-border bg-secondary p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{material.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {(material.type || 'link').toUpperCase()} · {material.updatedAt || material.createdAt || '방금'}
                          </p>
                        </div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    등록된 강의 자료가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  커리큘럼 단원
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedProgram.chapters.map((chapter) => (
                  <div key={chapter.id} className="rounded-xl border border-border bg-secondary p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{chapter.name}</p>
                        <p className="text-xs text-muted-foreground">진도 {chapter.progress}% · 이해도 {chapter.understanding}%</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        {chapter.understanding >= 70 ? '양호' : '보완'}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                연결 과제
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedAssignments.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {linkedAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-xl border border-border bg-secondary p-4">
                      <p className="font-medium text-foreground">{assignment.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">마감일 {assignment.dueDate} · 만점 {assignment.maxScore}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  이 프로그램에 연결된 과제가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
