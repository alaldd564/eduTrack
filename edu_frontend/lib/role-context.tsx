'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Role } from './types'
import {
  fetchMe,
  linkInstructor,
  login,
  setAuthToken,
  signup,
  type AuthMeResponse,
  type AuthSignupRequest,
} from './api-client'

interface RoleContextType {
  role: Role
  user: AuthMeResponse | null
  isAuthenticated: boolean
  loginWithRole: (username: string, password: string) => Promise<void>
  signupWithRole: (payload: AuthSignupRequest) => Promise<void>
  logout: () => void
  linkToInstructor: (instructorCode: string) => Promise<void>
  selectedStudentId: string | null
  setSelectedStudentId: (id: string | null) => void
  authLoading: boolean
  authError: string | null
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthMeResponse | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        const me = await fetchMe()
        if (!mounted) {
          return
        }
        setUser(me)
        if (me.role === 'student') {
          setSelectedStudentId(me.studentId || null)
        }
        setAuthError(null)
      } catch {
        if (!mounted) {
          return
        }
        setUser(null)
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [])

  const role: Role = user?.role === 'instructor' ? 'instructor' : 'student'

  const value = useMemo<RoleContextType>(
    () => ({
      role,
      user,
      isAuthenticated: Boolean(user),
      loginWithRole: async (username: string, password: string) => {
        setAuthLoading(true)
        setAuthError(null)
        try {
          const session = await login(username, password)
          setAuthToken(session.accessToken)
          const me = await fetchMe()
          setUser(me)
          if (me.role === 'student') {
            setSelectedStudentId(me.studentId || null)
          }
        } catch (error) {
          setAuthToken(null)
          setUser(null)
          setAuthError(error instanceof Error ? error.message : 'Login failed')
          throw error
        } finally {
          setAuthLoading(false)
        }
      },
      signupWithRole: async (payload: AuthSignupRequest) => {
        setAuthLoading(true)
        setAuthError(null)
        try {
          const session = await signup(payload)
          setAuthToken(session.accessToken)
          const me = await fetchMe()
          setUser(me)
          if (me.role === 'student') {
            setSelectedStudentId(me.studentId || null)
          }
        } catch (error) {
          setAuthToken(null)
          setUser(null)
          setAuthError(error instanceof Error ? error.message : 'Signup failed')
          throw error
        } finally {
          setAuthLoading(false)
        }
      },
      logout: () => {
        setAuthToken(null)
        setUser(null)
        setSelectedStudentId(null)
        setAuthError(null)
      },
      linkToInstructor: async (instructorCode: string) => {
        setAuthLoading(true)
        setAuthError(null)
        try {
          const session = await linkInstructor(instructorCode)
          setAuthToken(session.accessToken)
          const me = await fetchMe()
          setUser(me)
          if (me.role === 'student') {
            setSelectedStudentId(me.studentId || null)
          }
        } catch (error) {
          setAuthError(
            error instanceof Error ? error.message : 'Failed to link instructor'
          )
          throw error
        } finally {
          setAuthLoading(false)
        }
      },
      selectedStudentId,
      setSelectedStudentId,
      authLoading,
      authError,
    }),
    [user, role, selectedStudentId, authLoading, authError]
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
