import type {
  Assignment,
  CurriculumRecommendation,
  LearningActivity,
  Student,
  Subject,
  Submission,
  UnderstandingHistory,
} from './types'

export interface BootstrapData {
  students: Student[]
  subjects: Subject[]
  assignments: Assignment[]
  submissions: Submission[]
  learningActivities: LearningActivity[]
  understandingHistory: Record<string, UnderstandingHistory[]>
  curriculumPool: CurriculumRecommendation[]
}

export interface AuthLoginResponse {
  accessToken: string
  tokenType: string
  username: string
  role: string
  studentId?: string | null
  instructorCode?: string | null
  linkedInstructorCode?: string | null
}

export interface AuthSignupRequest {
  username: string
  password: string
  role: 'student' | 'instructor'
  name?: string
  email?: string
  grade?: string
}

export interface AuthMeResponse {
  username: string
  role: 'student' | 'instructor'
  studentId?: string | null
  instructorCode?: string | null
  linkedInstructorCode?: string | null
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown }
    const detail = body.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: unknown; loc?: unknown }
      if (typeof first?.msg === 'string') {
        return first.msg
      }
    }
  } catch {
    // Fall back to a generic message when the body is not JSON.
  }

  return fallback
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem('edu-auth-token')
}

function withAuthHeaders(headers?: HeadersInit): HeadersInit {
  const token = getAuthToken()
  if (!token) {
    return headers || {}
  }

  return {
    ...(headers || {}),
    Authorization: `Bearer ${token}`,
  }
}

function withSearchParam(path: string, search?: string): string {
  if (!search || search.trim().length === 0) {
    return apiUrl(path)
  }

  const query = new URLSearchParams({ search: search.trim() }).toString()
  return `${apiUrl(path)}?${query}`
}

export async function fetchBootstrapData(): Promise<BootstrapData> {
  const response = await fetch(apiUrl('/api/bootstrap'), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load bootstrap data: ${response.status}`)
  }

  return response.json() as Promise<BootstrapData>
}

export async function fetchStudents(search?: string): Promise<Student[]> {
  const response = await fetch(withSearchParam('/api/students', search), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load students: ${response.status}`)
  }

  return response.json() as Promise<Student[]>
}

export async function fetchAssignments(search?: string): Promise<Assignment[]> {
  const response = await fetch(withSearchParam('/api/assignments', search), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load assignments: ${response.status}`)
  }

  return response.json() as Promise<Assignment[]>
}

export async function createStudent(payload: Student): Promise<Student> {
  const response = await fetch(apiUrl('/api/students'), {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to create student: ${response.status}`)
  }

  return response.json() as Promise<Student>
}

export async function updateStudent(
  id: string,
  payload: Partial<Student>
): Promise<Student> {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to update student: ${response.status}`)
  }

  return response.json() as Promise<Student>
}

export async function deleteStudent(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete student: ${response.status}`)
  }
}

export async function createAssignment(payload: Assignment): Promise<Assignment> {
  const response = await fetch(apiUrl('/api/assignments'), {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to create assignment: ${response.status}`)
  }

  return response.json() as Promise<Assignment>
}

export async function updateAssignment(
  id: string,
  payload: Partial<Assignment>
): Promise<Assignment> {
  const response = await fetch(apiUrl(`/api/assignments/${id}`), {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to update assignment: ${response.status}`)
  }

  return response.json() as Promise<Assignment>
}

export async function deleteAssignment(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/assignments/${id}`), {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete assignment: ${response.status}`)
  }
}

export async function login(
  username: string,
  password: string
): Promise<AuthLoginResponse> {
  const response = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Login failed: ${response.status}`))
  }

  return response.json() as Promise<AuthLoginResponse>
}

export async function signup(
  payload: AuthSignupRequest
): Promise<AuthLoginResponse> {
  const response = await fetch(apiUrl('/api/auth/signup'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Signup failed: ${response.status}`))
  }

  return response.json() as Promise<AuthLoginResponse>
}

export async function fetchMe(): Promise<AuthMeResponse> {
  const response = await fetch(apiUrl('/api/auth/me'), {
    headers: withAuthHeaders(),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to load current user: ${response.status}`)
  }

  return response.json() as Promise<AuthMeResponse>
}

export async function linkInstructor(
  instructorCode: string
): Promise<AuthLoginResponse> {
  const response = await fetch(apiUrl('/api/auth/link-instructor'), {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ instructorCode }),
  })

  if (!response.ok) {
    throw new Error(`Failed to link instructor: ${response.status}`)
  }

  return response.json() as Promise<AuthLoginResponse>
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!token) {
    window.localStorage.removeItem('edu-auth-token')
    return
  }

  window.localStorage.setItem('edu-auth-token', token)
}
