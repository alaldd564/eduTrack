'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRole } from '@/lib/role-context'
import { fetchProfile, updateProfile, type ProfileResponse } from '@/lib/api-client'
import { Loader2, User2 } from 'lucide-react'

export function ProfileSettings() {
  const { user } = useRole()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const data = await fetchProfile()
        if (!mounted) {
          return
        }
        setProfile(data)
        setError(null)
      } catch (loadError) {
        if (!mounted) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : '프로필을 불러오지 못했습니다.')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    if (!profile) {
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateProfile({
        displayName: profile.displayName,
        bio: profile.bio,
        phone: profile.phone,
        name: profile.name,
        email: profile.email,
        grade: profile.grade,
      })
      setProfile(updated)
      setError(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '프로필 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        프로필을 불러오는 중...
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">개인 정보 관리</h2>
        <p className="text-muted-foreground">계정 정보와 프로필을 수정할 수 있습니다.</p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User2 className="h-4 w-4 text-primary" />
            프로필 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="표시 이름"
              value={profile.displayName || ''}
              onChange={(e) => setProfile((prev) => (prev ? { ...prev, displayName: e.target.value } : prev))}
            />
            <Input
              placeholder="전화번호"
              value={profile.phone || ''}
              onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : prev))}
            />
            {profile.role === 'student' && (
              <>
                <Input
                  placeholder="이름"
                  value={profile.name || ''}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                />
                <Input
                  placeholder="이메일"
                  value={profile.email || ''}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                />
                <Input
                  placeholder="학년"
                  value={profile.grade || ''}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, grade: e.target.value } : prev))}
                />
              </>
            )}
          </div>

          <div>
            <Input
              placeholder="소개"
              value={profile.bio || ''}
              onChange={(e) => setProfile((prev) => (prev ? { ...prev, bio: e.target.value } : prev))}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '저장 중...' : '프로필 저장'}
            </Button>
            <p className="text-xs text-muted-foreground">
              로그인 계정: {user?.username}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
