export type EducatorSummary = {
  active: boolean
  correctAnswerIndex?: number
  responseCounts: number[]
  revealed: boolean
  sessionId?: string
  totalResponses: number
}

export type StudentStatus = {
  active: boolean
  correctAnswerIndex?: number
  revealed: boolean
}

export type EducatorProgress = { completedTopicIds: string[] }
export type EducatorIdentity = { authenticated: boolean }

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const body = await response.json().catch(() => null) as T | { error?: string } | null

  if (!response.ok || body === null) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'The request could not be completed.'
    throw new ApiError(message, response.status || 500)
  }

  return body as T
}

export async function getEducatorIdentity() {
  const response = await fetch('/api/educator/me', { redirect: 'manual' })

  if (response.status === 302 || response.status === 401 || response.status === 403) {
    throw new ApiError('Educator authentication is required.', 401)
  }

  if (!response.ok) {
    throw new ApiError('Unable to validate educator authentication.', response.status || 500)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    throw new ApiError('Educator authentication is required.', 401)
  }

  const body = await response.json().catch(() => null) as EducatorIdentity | null
  if (!body || typeof body.authenticated !== 'boolean') {
    throw new ApiError('Educator authentication is required.', 401)
  }

  return body
}

export function getEducatorProgress() {
  return request<EducatorProgress>('/api/educator/progress')
}

export function markEducatorTopicComplete(topicId: string) {
  return request<{ completed: boolean }>(`/api/educator/progress/${topicId}`, { method: 'POST' })
}

export function resetEducatorProgress() {
  return request<{ reset: boolean }>('/api/educator/progress/reset', { method: 'POST' })
}

export function getEducatorSummary(topicId: string) {
  return request<EducatorSummary>(`/api/educator/topics/${topicId}`)
}

export function startEducatorSession(topicId: string) {
  return request<EducatorSummary>(`/api/educator/topics/${topicId}`, { method: 'POST' })
}

export function revealAnswer(topicId: string) {
  return request<EducatorSummary>(`/api/educator/topics/${topicId}/reveal`, { method: 'POST' })
}

export function completeTopic(topicId: string) {
  return request<{ completed: boolean }>(`/api/educator/topics/${topicId}/complete`, { method: 'POST' })
}

function studentPath(topicId: string, sessionId?: string) {
  return `/api/student/topics/${topicId}${sessionId ? `?session=${encodeURIComponent(sessionId)}` : ''}`
}

function studentResponsePath(topicId: string, sessionId?: string) {
  return `/api/student/topics/${topicId}/responses${sessionId ? `?session=${encodeURIComponent(sessionId)}` : ''}`
}

export function getStudentStatus(topicId: string, sessionId?: string) {
  return request<StudentStatus>(studentPath(topicId, sessionId))
}

export function submitStudentResponse(topicId: string, sessionId: string | undefined, choiceIndex: number) {
  return request<{ recorded: boolean }>(studentResponsePath(topicId, sessionId), {
    body: JSON.stringify({ choiceIndex }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}
