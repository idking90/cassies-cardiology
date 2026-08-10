import { error, json } from '../../../../lib/http'
import { getQuestionKey } from '../../../../lib/questionKeys'
import { getActiveSession, getEducatorSummary } from '../../../../lib/quizSessions'
import type { FunctionContext } from '../../../../lib/types'

export async function onRequestPost(context: FunctionContext) {
  const topicId = context.params.topicId
  if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

  const session = await getActiveSession(context.env, topicId)
  if (!session) return error('There is no active quiz session for this topic.', 404)

  if (session.status === 'open') {
    await context.env.DB.prepare("UPDATE quiz_sessions SET status = 'revealed', revealed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'open'").bind(session.id).run()
  }

  const revealedSession = await getActiveSession(context.env, topicId)
  if (!revealedSession) return error('Unable to reveal the answer.', 500)
  return json(await getEducatorSummary(context.env, revealedSession))
}
