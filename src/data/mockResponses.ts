import { topics } from './topics'

export type MockResponseState = Record<string, number[]>
export type MockQuizSession = {
  responseCountsByTopic: MockResponseState
  revealedTopicIds: string[]
}

const mockSessionStorageKey = 'cassies-cardiology:mock-quiz-session:v2'

const mockCorrectAnswerIndexes: Record<string, number> = {
  'rhythm-review': 0,
  'murmur-basics': 0,
  'chest-pain': 2,
  'heart-failure': 1,
}

export function getMockCorrectAnswerIndex(topicId: string): number {
  return mockCorrectAnswerIndexes[topicId] ?? 0
}

export function createMockResponseState(): MockResponseState {
  return Object.fromEntries(topics.map((topic) => [topic.id, [...topic.responseCounts]]))
}

export function createMockQuizSession(): MockQuizSession {
  return { responseCountsByTopic: createMockResponseState(), revealedTopicIds: [] }
}

export function loadMockQuizSession(): MockQuizSession {
  try {
    const storedSession = window.localStorage.getItem(mockSessionStorageKey)
    if (!storedSession) return createMockQuizSession()

    const session = JSON.parse(storedSession) as MockQuizSession
    if (!session.responseCountsByTopic || !Array.isArray(session.revealedTopicIds)) return createMockQuizSession()
    return session
  } catch {
    return createMockQuizSession()
  }
}

export function saveMockQuizSession(session: MockQuizSession) {
  window.localStorage.setItem(mockSessionStorageKey, JSON.stringify(session))
}

export function isMockQuizSessionStorageEvent(event: StorageEvent) {
  return event.key === mockSessionStorageKey
}

export function recordMockResponse(
  responses: MockResponseState,
  topicId: string,
  choiceIndex: number,
): MockResponseState {
  const counts = responses[topicId]
  if (!counts || choiceIndex < 0 || choiceIndex >= counts.length) return responses

  const nextCounts = [...counts]
  nextCounts[choiceIndex] += 1
  return { ...responses, [topicId]: nextCounts }
}
