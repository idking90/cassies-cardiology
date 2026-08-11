import type { Env } from './types'

export type QuizSession = {
  choiceCount: number
  correctAnswerIndex: number
  id: string
  status: 'open' | 'revealed' | 'closed'
  topicId: string
}

type ResponseCountRow = { choiceIndex: number; count: number }

export async function getActiveSession(env: Env, topicId: string): Promise<QuizSession | null> {
  return env.DB.prepare(`SELECT id, topic_id AS topicId, correct_answer_index AS correctAnswerIndex, choice_count AS choiceCount, status FROM quiz_sessions WHERE topic_id = ? AND status IN ('open', 'revealed') ORDER BY created_at DESC LIMIT 1`).bind(topicId).first<QuizSession>()
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
    totalResponses: responseCounts.reduce((total, count) => total + count, 0),
  }
}
