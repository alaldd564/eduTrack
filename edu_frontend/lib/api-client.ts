import type {
  Assignment,
  CurriculumRecommendation,
  LearningActivity,
  DiscussionPost,
  DiscussionReply,
  Student,
  Subject,
  Submission,
  UnderstandingHistory,
  ProgramMaterial,
} from './types'

export interface BootstrapData {
  students: Student[]
  subjects: Subject[]
  assignments: Assignment[]
  materials?: ProgramMaterial[]
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
  displayName?: string | null
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
  displayName?: string | null
  studentId?: string | null
  instructorCode?: string | null
  linkedInstructorCode?: string | null
}

export interface ProfileResponse {
  username: string
  role: 'student' | 'instructor'
  displayName?: string | null
  bio?: string | null
  phone?: string | null
  studentId?: string | null
  instructorCode?: string | null
  linkedInstructorCode?: string | null
  name?: string | null
  email?: string | null
  grade?: string | null
}

export interface ProfileUpdateRequest {
  displayName?: string | null
  bio?: string | null
  phone?: string | null
  name?: string | null
  email?: string | null
  grade?: string | null
}

export interface SubmissionCreateRequest {
  id: string
  studentId: string
  assignmentId: string
  score: number
  submittedAt: string
  answerText?: string | null
  attachmentName?: string | null
  attachmentPath?: string | null
  feedback?: string | null
}

export interface SubmissionUpdateRequest {
  score?: number
  submittedAt?: string
  answerText?: string | null
  attachmentName?: string | null
  attachmentPath?: string | null
  feedback?: string | null
}

export interface DiscussionPostCreateRequest {
  subjectId?: string | null
  assignmentId?: string | null
  title: string
  content: string
}

export interface DiscussionReplyCreateRequest {
  content: string
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

export async function fetchMaterials(): Promise<ProgramMaterial[]> {
  const response = await fetch(apiUrl('/api/materials'), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load materials: ${response.status}`)
  }

  return response.json() as Promise<ProgramMaterial[]>
}

export async function uploadMaterial(formData: FormData): Promise<ProgramMaterial> {
  const response = await fetch(apiUrl('/api/materials'), {
    method: 'POST',
    headers: withAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to upload material: ${response.status}`))
  }

  return response.json() as Promise<ProgramMaterial>
}

export async function fetchDiscussionPosts(): Promise<DiscussionPost[]> {
  const response = await fetch(apiUrl('/api/community/posts'), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load community posts: ${response.status}`)
  }

  return response.json() as Promise<DiscussionPost[]>
}

export async function createDiscussionPost(payload: DiscussionPostCreateRequest): Promise<DiscussionPost> {
  const response = await fetch(apiUrl('/api/community/posts'), {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to create post: ${response.status}`))
  }

  return response.json() as Promise<DiscussionPost>
}

export async function fetchDiscussionReplies(postId: string): Promise<DiscussionReply[]> {
  const response = await fetch(apiUrl(`/api/community/posts/${postId}/replies`), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load replies: ${response.status}`)
  }

  return response.json() as Promise<DiscussionReply[]>
}

export async function createDiscussionReply(postId: string, payload: DiscussionReplyCreateRequest): Promise<DiscussionReply> {
  const response = await fetch(apiUrl(`/api/community/posts/${postId}/replies`), {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to create reply: ${response.status}`))
  }

  return response.json() as Promise<DiscussionReply>
}

export async function fetchSubmissions(): Promise<Submission[]> {
  const response = await fetch(apiUrl('/api/submissions'), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load submissions: ${response.status}`)
  }

  return response.json() as Promise<Submission[]>
}

export async function createSubmission(payload: SubmissionCreateRequest): Promise<Submission> {
  const response = await fetch(apiUrl('/api/submissions'), {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to create submission: ${response.status}`))
  }

  return response.json() as Promise<Submission>
}

export async function updateSubmission(id: string, payload: SubmissionUpdateRequest): Promise<Submission> {
  const response = await fetch(apiUrl(`/api/submissions/${id}`), {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to update submission: ${response.status}`))
  }

  return response.json() as Promise<Submission>
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch(apiUrl('/api/profile'), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load profile: ${response.status}`)
  }

  return response.json() as Promise<ProfileResponse>
}

export async function updateProfile(
  payload: ProfileUpdateRequest
): Promise<ProfileResponse> {
  const response = await fetch(apiUrl('/api/profile'), {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to update profile: ${response.status}`))
  }

  return response.json() as Promise<ProfileResponse>
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

export async function fetchAIRecommendation(
  studentId: string
): Promise<{
  studentName: string
  recommendation: string | null
  overallProgress: number
  overallUnderstanding: number
}> {
  const response = await fetch(apiUrl('/api/ai-recommendation'), {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ studentId }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Failed to fetch AI recommendation: ${response.status}`))
  }

  return response.json()
}

export async function fetchAttentionRequiredStudents(): Promise<Student[]> {
  const response = await fetch(apiUrl('/api/students/attention-required'), {
    cache: 'no-store',
    headers: withAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch attention required students: ${response.status}`)
  }

  return response.json() as Promise<Student[]>
}
