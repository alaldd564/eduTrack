'use client'

import { useState } from 'react'
import { RoleProvider, useRole } from '@/lib/role-context'
import { EduDataProvider, useEduData } from '@/lib/edu-data-context'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Instructor components
import { InstructorDashboard } from '@/components/instructor/instructor-dashboard'
import { StudentList } from '@/components/instructor/student-list'
import { StudentDetail } from '@/components/instructor/student-detail'
import { AssignmentManager } from '@/components/instructor/assignment-manager'

// Student components
import { StudentDashboard } from '@/components/student/student-dashboard'
import { SubjectLearning } from '@/components/student/subject-learning'
import { ProgressAnalysis } from '@/components/student/progress-analysis'
import { CurriculumRecommendations } from '@/components/student/curriculum-recommendations'
import { ProgramLibrary } from '@/components/program-library'
import { ProfileSettings } from '@/components/profile-settings'
import { CommunityBoard } from '@/components/community-board'
import { SubmissionCenter } from '@/components/submission-center'

function AuthScreen() {
  const { loginWithRole, signupWithRole, authLoading, authError } = useRole()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [grade, setGrade] = useState('고등학교 2학년')

  const isSignup = mode === 'signup'
  const isStudentSignup = isSignup && role === 'student'
  const submitDisabled =
    authLoading ||
    !username.trim() ||
    password.trim().length < 8 ||
    (isStudentSignup && !name.trim())

  const handleSubmit = async () => {
    if (!username.trim() || password.trim().length < 8) {
      return
    }

    if (mode === 'login') {
      await loginWithRole(username, password)
      return
    }

    await signupWithRole({
      username,
      password,
      role,
      name: role === 'student' ? name || username : undefined,
      email: role === 'student' ? email || undefined : undefined,
      grade: role === 'student' ? grade : undefined,
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-36 h-[22rem] w-[22rem] rounded-full bg-[oklch(0.66_0.16_215_/_0.22)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[20rem] w-[20rem] rounded-full bg-[oklch(0.74_0.12_155_/_0.2)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.9_0.01_250)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0.01_250)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-45" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-8">
        <Card className="w-full overflow-hidden border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl">
          <div className="grid md:grid-cols-[1.05fr_1fr]">
            <div className="hidden border-r border-border/60 bg-[linear-gradient(145deg,oklch(0.18_0.03_240),oklch(0.13_0.03_215))] p-8 text-white md:flex md:flex-col md:justify-between">
              <div className="space-y-5">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs tracking-[0.2em] text-white/80">
                  EDU LEARNING PORTAL
                </p>
                <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                  나만의 학습 대시보드로
                  <br />
                  수업과 성장을 연결하세요
                </h1>
                <p className="max-w-sm text-sm leading-relaxed text-white/75">
                  실시간 과제 관리, 학습 분석, 추천 커리큘럼까지 하나의 화면에서 확인할 수 있습니다.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                  <p className="text-lg font-semibold">12+</p>
                  <p className="text-white/70">분석 지표</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                  <p className="text-lg font-semibold">24h</p>
                  <p className="text-white/70">진행 현황 반영</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              <CardHeader className="space-y-2 p-0">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {isSignup ? '새 계정 만들기' : '다시 오신 걸 환영해요'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isSignup
                    ? '역할을 선택하고 계정을 생성해 학습을 시작하세요.'
                    : '아이디와 비밀번호를 입력해 대시보드로 이동하세요.'}
                </p>
              </CardHeader>

              <CardContent className="mt-6 space-y-5 p-0">
                <div className="rounded-xl border border-border/70 bg-muted/45 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant={isSignup ? 'ghost' : 'default'}
                      onClick={() => setMode('login')}
                      className="h-10 rounded-lg"
                    >
                      로그인
                    </Button>
                    <Button
                      variant={isSignup ? 'default' : 'ghost'}
                      onClick={() => setMode('signup')}
                      className="h-10 rounded-lg"
                    >
                      회원가입
                    </Button>
                  </div>
                </div>

                {isSignup && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        role === 'student'
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <p className="text-sm font-medium">학생</p>
                      <p className="mt-1 text-xs">개인 학습 분석 및 추천</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('instructor')}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        role === 'instructor'
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <p className="text-sm font-medium">교강사</p>
                      <p className="mt-1 text-xs">학생 관리 및 과제 운영</p>
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <Input
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                  <Input
                    type="password"
                    placeholder="비밀번호 (8자 이상)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />

                  {isSignup && (
                    <p className="text-xs text-muted-foreground">
                      회원가입 비밀번호는 8자 이상이어야 합니다.
                    </p>
                  )}

                  {isStudentSignup && (
                    <>
                      <Input
                        placeholder="이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                      />
                      <Input
                        placeholder="이메일 (선택)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                      />
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                    </>
                  )}
                </div>

                {authError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2">
                    <p className="text-sm text-destructive">{authError}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                  className="h-11 w-full text-sm font-medium"
                >
                  {authLoading
                    ? '처리 중...'
                    : isSignup
                      ? '가입 후 시작하기'
                      : '로그인'}
                </Button>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StudentLinkScreen() {
  const { linkToInstructor, authLoading, authError, logout } = useRole()
  const [code, setCode] = useState('')

  const handleLink = async () => {
    if (!code.trim()) {
      return
    }
    await linkToInstructor(code.trim().toUpperCase())
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>교강사 연결</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            교강사가 알려준 연결 코드를 입력하면 학습 대시보드를 사용할 수 있습니다.
          </p>
          <Input
            placeholder="예: A1B2C3D4"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {authError && <p className="text-sm text-destructive">{authError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleLink} disabled={authLoading} className="flex-1">
              연결하기
            </Button>
            <Button onClick={logout} variant="outline" disabled={authLoading}>
              돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardContent() {
  const { role, authLoading, authError, isAuthenticated, user } = useRole()
  const { isLoading, error } = useEduData()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [viewingStudentDetail, setViewingStudentDetail] = useState(false)

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">
          Authenticating...
        </p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-mono text-sm text-destructive">{authError}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">
          Loading learning data...
        </p>
      </div>
    )
  }

  if (role === 'student' && !user?.linkedInstructorCode) {
    return <StudentLinkScreen />
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-mono text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  // Reset section when role changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setViewingStudentDetail(false)
  }

  const renderInstructorContent = () => {
    if (viewingStudentDetail) {
      return (
        <StudentDetail onBack={() => setViewingStudentDetail(false)} />
      )
    }

    switch (activeSection) {
      case 'dashboard':
        return <InstructorDashboard />
      case 'programs':
        return <ProgramLibrary />
      case 'students':
        return (
          <StudentList onViewDetail={() => setViewingStudentDetail(true)} />
        )
      case 'assignments':
        return <AssignmentManager />
      case 'community':
        return <CommunityBoard />
      case 'submissions':
        return <SubmissionCenter />
      case 'profile':
        return <ProfileSettings />
      default:
        return <InstructorDashboard />
    }
  }

  const renderStudentContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <StudentDashboard />
      case 'programs':
        return <ProgramLibrary />
      case 'subjects':
        return <SubjectLearning />
      case 'progress':
        return <ProgressAnalysis />
      case 'recommendations':
        return <CurriculumRecommendations />
      case 'community':
        return <CommunityBoard />
      case 'submissions':
        return <SubmissionCenter />
      case 'profile':
        return <ProfileSettings />
      default:
        return <StudentDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.55_0.2_250_/_0.08),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.92_0.01_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.01_260)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />
      
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {role === 'instructor'
            ? renderInstructorContent()
            : renderStudentContent()}
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <RoleProvider>
      <EduDataProvider>
        <DashboardContent />
      </EduDataProvider>
    </RoleProvider>
  )
}
