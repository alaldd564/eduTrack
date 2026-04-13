'use client'

import { cn } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Terminal,
} from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { role } = useRole()

  const instructorMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'programs', label: '프로그램', icon: BookOpen },
    { id: 'students', label: '학생 관리', icon: Users },
    { id: 'assignments', label: '과제 관리', icon: ClipboardList },
    { id: 'submissions', label: '제출/피드백', icon: ClipboardList },
    { id: 'community', label: '커뮤니티', icon: Lightbulb },
    { id: 'profile', label: '개인 정보', icon: GraduationCap },
  ]

  const studentMenuItems = [
    { id: 'dashboard', label: '학습 현황', icon: LayoutDashboard },
    { id: 'programs', label: '프로그램', icon: BookOpen },
    { id: 'subjects', label: '과목별 학습', icon: BookOpen },
    { id: 'progress', label: '진도 분석', icon: TrendingUp },
    { id: 'recommendations', label: '추천 학습', icon: Lightbulb },
    { id: 'submissions', label: '과제 제출', icon: ClipboardList },
    { id: 'community', label: '커뮤니티', icon: Lightbulb },
    { id: 'profile', label: '개인 정보', icon: GraduationCap },
  ]

  const menuItems =
    role === 'instructor' ? instructorMenuItems : studentMenuItems

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-sm">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground">
            EduTrack
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {role === 'instructor' ? 'Instructor' : 'Student'} Mode
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground glow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110'
                    )}
                  />
                  <span className="font-sans">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Status */}
      <div className="border-t border-border p-4">
        <div className="rounded-xl border border-border bg-secondary p-4">
          <div className="mb-2 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              System Status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="font-mono text-xs text-foreground">Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
