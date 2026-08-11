import { error, json } from '../../../lib/http'
import { getQuestionKey } from '../../../lib/questionKeys'
import { getActiveSession, getEducatorSummary } from '../../../lib/quizSessions'
import type { FunctionContext } from '../../../lib/types'

export async function onRequestGet(context: FunctionContext) {
  const topicId = context.params.topicId
  if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

  const session = await getActiveSession(context.env, topicId)
  if (!session) return json({ active: false, responseCounts: [], revealed: false, totalResponses: 0 })

  return json({ active: true, ...(await getEducatorSummary(context.env, session)) })
}

export async function onRequestPost(context: FunctionContext) {
  const topicId = context.params.topicId
  const questionKey = topicId ? getQuestionKey(topicId) : undefined
  if (!topicId || !questionKey) return error('Unknown topic.', 404)

  let session = await getActiveSession(context.env, topicId)
  if (!session) {
    await context.env.DB.prepare('INSERT OR IGNORE INTO quiz_sessions (id, topic_id, correct_answer_index, choice_count) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), topicId, questionKey.correctAnswerIndex, questionKey.choiceCount).run()
    session = await getActiveSession(context.env, topicId)
  }

  if (!session) return error('Unable to start a quiz session.', 500)
  return json({ active: true, ...(await getEducatorSummary(context.env, session)) }, { status: 201 })
}
