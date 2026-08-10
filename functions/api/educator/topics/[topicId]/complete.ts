import { error, json } from '../../../../lib/http'
import { getQuestionKey } from '../../../../lib/questionKeys'
import { getActiveSession } from '../../../../lib/quizSessions'
import type { FunctionContext } from '../../../../lib/types'

export async function onRequestPost(context: FunctionContext) {
  const topicId = context.params.topicId
  if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

  const session = await getActiveSession(context.env, topicId)
  if (session) {
    await context.env.DB.prepare("UPDATE quiz_sessions SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('open', 'revealed')").bind(session.id).run()
  }

  return json({ completed: true })
}
