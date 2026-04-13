'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Assignment,
  CurriculumRecommendation,
  DiscussionPost,
  DiscussionReply,
  LearningActivity,
  ProgramMaterial,
  Student,
  Subject,
  Submission,
  UnderstandingHistory,
} from './types'
import { useRole } from './role-context'
import {
  createAssignment as createAssignmentRequest,
  createStudent as createStudentRequest,
  deleteAssignment as deleteAssignmentRequest,
  deleteStudent as deleteStudentRequest,
  fetchAssignments,
  fetchBootstrapData,
  fetchDiscussionPosts,
  fetchMaterials,
  fetchStudents,
  updateAssignment as updateAssignmentRequest,
  updateStudent as updateStudentRequest,
} from './api-client'

interface EduDataContextType {
  students: Student[]
  subjects: Subject[]
  assignments: Assignment[]
  materials: ProgramMaterial[]
  filteredStudents: Student[]
  filteredAssignments: Assignment[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  submissions: Submission[]
  discussionPosts: DiscussionPost[]
  learningActivities: LearningActivity[]
  curriculumPool: CurriculumRecommendation[]
  isLoading: boolean
  error: string | null
  getSubmissionsByStudent: (studentId: string) => Submission[]
  getSubmissionsByAssignment: (assignmentId: string) => Submission[]
  getActivitiesByStudent: (studentId: string) => LearningActivity[]
  getAssignmentById: (assignmentId: string) => Assignment | undefined
  getUnderstandingHistoryByStudent: (studentId: string) => UnderstandingHistory[]
  createStudent: (payload: Student) => Promise<void>
  updateStudent: (id: string, payload: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  createAssignment: (payload: Assignment) => Promise<void>
  updateAssignment: (id: string, payload: Partial<Assignment>) => Promise<void>
  deleteAssignment: (id: string) => Promise<void>
  refreshDiscussionPosts: () => Promise<void>
  refreshMaterials: () => Promise<void>
}

const EduDataContext = createContext<EduDataContextType | undefined>(undefined)

export function EduDataProvider({ children }: { children: ReactNode }) {
  const { authLoading, authError, isAuthenticated } = useRole()
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [materials, setMaterials] = useState<ProgramMaterial[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [learningActivities, setLearningActivities] = useState<LearningActivity[]>([])
  const [understandingHistory, setUnderstandingHistory] = useState<
    Record<string, UnderstandingHistory[]>
  >({})
  const [curriculumPool, setCurriculumPool] = useState<CurriculumRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      setIsLoading(false)
      setError(null)
      return
    }

    let mounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchBootstrapData()
        if (!mounted) {
          return
        }

        setStudents(data.students)
        setSubjects(data.subjects)
        setAssignments(data.assignments)
        setMaterials(data.materials || [])
        setFilteredStudents(data.students)
        setFilteredAssignments(data.assignments)
        setSubmissions(data.submissions)
        setLearningActivities(data.learningActivities)
        setUnderstandingHistory(data.understandingHistory)
        setCurriculumPool(data.curriculumPool)
        setError(null)
      } catch (err) {
        if (!mounted) {
          return
        }
        const message =
          err instanceof Error ? err.message : 'Failed to load education data'
        setError(message)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [authLoading, authError, isAuthenticated])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (authLoading || !isAuthenticated) {
      return
    }

    if (trimmed.length === 0) {
      setFilteredStudents(students)
      setFilteredAssignments(assignments)
      return
    }

    let mounted = true
    const timeout = setTimeout(async () => {
      try {
        const [searchedStudents, searchedAssignments] = await Promise.all([
          fetchStudents(trimmed),
          fetchAssignments(trimmed),
        ])

        if (!mounted) {
          return
        }

        setFilteredStudents(searchedStudents)
        setFilteredAssignments(searchedAssignments)
      } catch {
        if (!mounted) {
          return
        }
        setFilteredStudents([])
        setFilteredAssignments([])
      }
    }, 300)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [searchQuery, students, assignments, authLoading, authError, isAuthenticated])

  const refreshBootstrapData = useCallback(async () => {
    const data = await fetchBootstrapData()
    setStudents(data.students)
    setSubjects(data.subjects)
    setAssignments(data.assignments)
    setMaterials(data.materials || [])
    setSubmissions(data.submissions)
    setLearningActivities(data.learningActivities)
    setUnderstandingHistory(data.understandingHistory)
    setCurriculumPool(data.curriculumPool)

    if (searchQuery.trim().length === 0) {
      setFilteredStudents(data.students)
      setFilteredAssignments(data.assignments)
      return
    }

    const [searchedStudents, searchedAssignments] = await Promise.all([
      fetchStudents(searchQuery),
      fetchAssignments(searchQuery),
    ])
    setFilteredStudents(searchedStudents)
    setFilteredAssignments(searchedAssignments)
  }, [searchQuery])

  const refreshDiscussionPosts = useCallback(async () => {
    const posts = await fetchDiscussionPosts()
    setDiscussionPosts(posts)
  }, [])

  const refreshMaterials = useCallback(async () => {
    try {
      const fetchedMaterials = await fetchMaterials()
      setMaterials(fetchedMaterials)
    } catch {
      setMaterials([])
    }
  }, [])

  const value = useMemo<EduDataContextType>(
    () => ({
      students,
      subjects,
      assignments,
      materials,
      filteredStudents,
      filteredAssignments,
      searchQuery,
      setSearchQuery,
      submissions,
      discussionPosts,
      learningActivities,
      curriculumPool,
      isLoading,
      error,
      getSubmissionsByStudent: (studentId: string) =>
        submissions.filter(
          (submission: Submission) => submission.studentId === studentId
        ),
      getSubmissionsByAssignment: (assignmentId: string) =>
        submissions.filter(
          (submission: Submission) =>
            submission.assignmentId === assignmentId
        ),
      getActivitiesByStudent: (studentId: string) =>
        learningActivities.filter(
          (activity: LearningActivity) => activity.studentId === studentId
        ),
      getAssignmentById: (assignmentId: string) =>
        assignments.find(
          (assignment: Assignment) => assignment.id === assignmentId
        ),
      getUnderstandingHistoryByStudent: (studentId: string) =>
        understandingHistory[studentId] || understandingHistory['student-1'] || [],
      createStudent: async (payload: Student) => {
        await createStudentRequest(payload)
        await refreshBootstrapData()
      },
      updateStudent: async (id: string, payload: Partial<Student>) => {
        await updateStudentRequest(id, payload)
        await refreshBootstrapData()
      },
      deleteStudent: async (id: string) => {
        await deleteStudentRequest(id)
        await refreshBootstrapData()
      },
      createAssignment: async (payload: Assignment) => {
        await createAssignmentRequest(payload)
        await refreshBootstrapData()
      },
      updateAssignment: async (id: string, payload: Partial<Assignment>) => {
        await updateAssignmentRequest(id, payload)
        await refreshBootstrapData()
      },
      deleteAssignment: async (id: string) => {
        await deleteAssignmentRequest(id)
        await refreshBootstrapData()
      },
      refreshDiscussionPosts,
      refreshMaterials,
    }),
    [
      students,
      subjects,
      assignments,
      materials,
      filteredStudents,
      filteredAssignments,
      searchQuery,
      submissions,
      discussionPosts,
      learningActivities,
      curriculumPool,
      isLoading,
      error,
      understandingHistory,
      refreshBootstrapData,
      refreshDiscussionPosts,
      refreshMaterials,
    ]
  )

  return (
    <EduDataContext.Provider value={value}>{children}</EduDataContext.Provider>
  )
}

export function useEduData() {
  const context = useContext(EduDataContext)
  if (context === undefined) {
    throw new Error('useEduData must be used within EduDataProvider')
  }

  return context
}
