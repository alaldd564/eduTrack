'use client'

import { useRole } from '@/lib/role-context'
import { Button } from '@/components/ui/button'
import { UserCircle, GraduationCap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RoleSwitcher() {
  const { role, user, logout } = useRole()

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-secondary/30 p-1">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-medium',
          role === 'student' ? 'text-chart-2' : 'text-primary'
        )}
        disabled
      >
        {role === 'instructor' ? (
          <GraduationCap className="h-3.5 w-3.5" />
        ) : (
          <UserCircle className="h-3.5 w-3.5" />
        )}
        {role === 'instructor' ? 'Instructor' : 'Student'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className={cn(
          'gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <LogOut className="h-3.5 w-3.5" />
        {user?.username || 'Logout'}
      </Button>
    </div>
  )
}
