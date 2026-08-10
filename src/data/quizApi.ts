export type EducatorSummary = {
  active: boolean
  correctAnswerIndex?: number
  responseCounts: number[]
  revealed: boolean
  totalResponses: number
}

export type StudentStatus = {
  active: boolean
  correctAnswerIndex?: number
  revealed: boolean
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const body = await response.json().catch(() => null) as T | { error?: string } | null

  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'The request could not be completed.'
    throw new Error(message)
  }

  return body as T
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

export function getStudentStatus(topicId: string) {
  return request<StudentStatus>(`/api/student/topics/${topicId}`)
}

export function submitStudentResponse(topicId: string, choiceIndex: number) {
  return request<{ recorded: boolean }>(`/api/student/topics/${topicId}/responses`, {
    body: JSON.stringify({ choiceIndex }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}
