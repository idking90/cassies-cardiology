import { error, json } from '../../../lib/http'
import { assertSameOrigin, AuthError, authenticateEducator } from '../../../lib/auth'
import { getQuestionKey } from '../../../lib/questionKeys'
import { getActiveSession, getEducatorSummary } from '../../../lib/quizSessions'
import type { FunctionContext } from '../../../lib/types'

export async function onRequestGet(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    const topicId = context.params.topicId
    if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

    const session = await getActiveSession(context.env, educator.id, topicId)
    if (!session) return json({ active: false, responseCounts: [], revealed: false, totalResponses: 0 })

    return json({ active: true, ...(await getEducatorSummary(context.env, session)) })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to load the educator session.', 500)
  }
}

export async function onRequestPost(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    assertSameOrigin(context)
    const topicId = context.params.topicId
    const questionKey = topicId ? getQuestionKey(topicId) : undefined
    if (!topicId || !questionKey) return error('Unknown topic.', 404)

    let session = await getActiveSession(context.env, educator.id, topicId)
    if (!session) {
      await context.env.DB.prepare('INSERT OR IGNORE INTO quiz_sessions (id, educator_id, topic_id, correct_answer_index, choice_count) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), educator.id, topicId, questionKey.correctAnswerIndex, questionKey.choiceCount).run()
      session = await getActiveSession(context.env, educator.id, topicId)
    }

    if (!session) return error('Unable to start a quiz session.', 500)
    return json({ active: true, ...(await getEducatorSummary(context.env, session)) }, { status: 201 })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to start the educator session.', 500)
  }
}
