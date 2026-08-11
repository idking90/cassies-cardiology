import { error, json } from '../../../../lib/http'
import { assertSameOrigin, AuthError, authenticateEducator } from '../../../../lib/auth'
import { getQuestionKey } from '../../../../lib/questionKeys'
import { getActiveSession, getEducatorSummary } from '../../../../lib/quizSessions'
import type { FunctionContext } from '../../../../lib/types'

export async function onRequestPost(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    assertSameOrigin(context)
    const topicId = context.params.topicId
    if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

    const session = await getActiveSession(context.env, educator.id, topicId)
    if (!session) return error('There is no active quiz session for this topic.', 404)

    if (session.status === 'open') {
      await context.env.DB.prepare("UPDATE quiz_sessions SET status = 'revealed', revealed_at = CURRENT_TIMESTAMP WHERE id = ? AND educator_id = ? AND status = 'open'").bind(session.id, educator.id).run()
    }

    const revealedSession = await getActiveSession(context.env, educator.id, topicId)
    if (!revealedSession) return error('Unable to reveal the answer.', 500)
    return json(await getEducatorSummary(context.env, revealedSession))
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to reveal the answer.', 500)
  }
}
