'use client'

import { RoleSwitcher } from './role-switcher'
import { useRole } from '@/lib/role-context'
import { useEduData } from '@/lib/edu-data-context'
import { Bell, Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { role, selectedStudentId, user } = useRole()
  const { students, searchQuery, setSearchQuery } = useEduData()

  const currentStudent = students.find((s) => s.id === selectedStudentId)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 transition-all hover:border-primary/50 hover:shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
            <Command className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <RoleSwitcher />

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-secondary"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2 transition-all hover:border-primary/50 hover:shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground glow-sm">
            {role === 'instructor'
              ? 'IN'
              : currentStudent?.name.charAt(0) || 'ST'}
          </div>
          <div className="hidden sm:block">
            <p className="font-sans text-sm font-medium text-foreground">
              {role === 'instructor'
                ? user?.username || '교강사'
                : currentStudent?.name || user?.username || '학생'}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {role === 'instructor'
                ? `CODE ${user?.instructorCode || '-'}`
                : currentStudent?.grade}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
