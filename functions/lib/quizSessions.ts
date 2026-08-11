import type { Env } from './types'

export type QuizSession = {
  choiceCount: number
  correctAnswerIndex: number
  educatorId: string
  id: string
  status: 'open' | 'revealed' | 'closed'
  topicId: string
}

type ResponseCountRow = { choiceIndex: number; count: number }

export async function getActiveSession(env: Env, educatorId: string, topicId: string): Promise<QuizSession | null> {
  return env.DB.prepare(`SELECT id, educator_id AS educatorId, topic_id AS topicId, correct_answer_index AS correctAnswerIndex, choice_count AS choiceCount, status FROM quiz_sessions WHERE educator_id = ? AND topic_id = ? AND status IN ('open', 'revealed') ORDER BY created_at DESC LIMIT 1`).bind(educatorId, topicId).first<QuizSession>()
}

export async function getStudentSession(env: Env, topicId: string, sessionId: string): Promise<QuizSession | null> {
  return env.DB.prepare(`SELECT id, educator_id AS educatorId, topic_id AS topicId, correct_answer_index AS correctAnswerIndex, choice_count AS choiceCount, status FROM quiz_sessions WHERE id = ? AND topic_id = ? AND status IN ('open', 'revealed') LIMIT 1`).bind(sessionId, topicId).first<QuizSession>()
}

export async function getSingleActiveStudentSession(env: Env, topicId: string): Promise<QuizSession | null> {
  const result = await env.DB.prepare(`SELECT id, educator_id AS educatorId, topic_id AS topicId, correct_answer_index AS correctAnswerIndex, choice_count AS choiceCount, status FROM quiz_sessions WHERE topic_id = ? AND status IN ('open', 'revealed') LIMIT 2`).bind(topicId).all<QuizSession>()
  return result.results.length === 1 ? result.results[0] : null
}

export async function getResponseCounts(env: Env, session: QuizSession) {
  const result = await env.DB.prepare('SELECT choice_index AS choiceIndex, COUNT(*) AS count FROM quiz_responses WHERE session_id = ? GROUP BY choice_index').bind(session.id).all<ResponseCountRow>()
  const counts = Array.from({ length: session.choiceCount }, () => 0)

  for (const row of result.results) counts[row.choiceIndex] = Number(row.count)
  return counts
}

export async function getEducatorSummary(env: Env, session: QuizSession) {
  const responseCounts = await getResponseCounts(env, session)
  return {
    correctAnswerIndex: session.correctAnswerIndex,
    responseCounts,
    revealed: session.status === 'revealed',
    sessionId: session.id,
    totalResponses: responseCounts.reduce((total, count) => total + count, 0),
  }
}
