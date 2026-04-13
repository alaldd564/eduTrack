'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRole } from '@/lib/role-context'
import { useEduData } from '@/lib/edu-data-context'
import {
  createSubmission,
  fetchSubmissions,
  updateSubmission,
} from '@/lib/api-client'
import type { Submission } from '@/lib/types'
import { ClipboardCheck, Send } from 'lucide-react'

export function SubmissionCenter() {
  const { role, selectedStudentId, user } = useRole()
  const { assignments } = useEduData()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.id || '')
  const [answerText, setAnswerText] = useState('')
  const [score, setScore] = useState('100')
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadSubmissions = async () => {
    const data = await fetchSubmissions()
    setSubmissions(data)
  }

  useEffect(() => {
    void loadSubmissions()
  }, [])

  useEffect(() => {
    if (!assignmentId && assignments[0]) {
      setAssignmentId(assignments[0].id)
    }
  }, [assignments, assignmentId])

  const visibleSubmissions = useMemo(
    () =>
      role === 'student'
        ? submissions.filter((submission) => submission.studentId === selectedStudentId)
        : submissions,
    [role, submissions, selectedStudentId]
  )

  const handleSubmit = async () => {
    if (!assignmentId) {
      return
    }

    setIsSaving(true)
    try {
      if (role === 'student') {
        await createSubmission({
          id: `sub-${Date.now()}`,
          studentId: selectedStudentId || '',
          assignmentId,
          score: 0,
          submittedAt: new Date().toISOString().slice(0, 10),
          answerText: answerText.trim(),
          feedback: null,
        })
      } else if (visibleSubmissions[0]) {
        await updateSubmission(visibleSubmissions[0].id, {
          score: Number(score || 0),
          feedback: feedback.trim(),
        })
      }
      setAnswerText('')
      setFeedback('')
      await loadSubmissions()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">과제 제출 / 피드백</h2>
        <p className="text-muted-foreground">학생은 제출하고, 교강사는 점수와 피드백을 남깁니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-primary" />
            {role === 'student' ? '과제 제출' : '피드백 작성'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {role === 'student' ? (
            <Input
              placeholder="답안 내용"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="점수" value={score} onChange={(e) => setScore(e.target.value)} />
              <Input placeholder="피드백" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>
          )}
          <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            {isSaving ? '저장 중...' : role === 'student' ? '제출하기' : '피드백 저장'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">제출 내역</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleSubmissions.length > 0 ? (
            visibleSubmissions.map((submission) => {
              const assignment = assignments.find((item) => item.id === submission.assignmentId)
              return (
                <div key={submission.id} className="rounded-xl border border-border bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{assignment?.title || submission.assignmentId}</p>
                      <p className="text-xs text-muted-foreground">{submission.submittedAt}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                      {submission.score}점
                    </span>
                  </div>
                  {submission.answerText && (
                    <p className="mt-3 text-sm text-foreground">{submission.answerText}</p>
                  )}
                  {submission.feedback && (
                    <p className="mt-3 text-sm text-muted-foreground">피드백: {submission.feedback}</p>
                  )}
                </div>
              )
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">제출 내역이 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
