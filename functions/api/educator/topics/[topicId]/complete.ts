import { error, json } from '../../../../lib/http'
import { assertSameOrigin, AuthError, authenticateEducator } from '../../../../lib/auth'
import { getQuestionKey } from '../../../../lib/questionKeys'
import { getActiveSession } from '../../../../lib/quizSessions'
import type { FunctionContext } from '../../../../lib/types'

export async function onRequestPost(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    assertSameOrigin(context)
    const topicId = context.params.topicId
    if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

    const session = await getActiveSession(context.env, educator.id, topicId)
    if (session) {
      await context.env.DB.prepare("UPDATE quiz_sessions SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE id = ? AND educator_id = ? AND status IN ('open', 'revealed')").bind(session.id, educator.id).run()
    }

    return json({ completed: true })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to close the quiz session.', 500)
  }
}
