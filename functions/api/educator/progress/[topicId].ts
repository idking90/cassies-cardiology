import { assertSameOrigin, AuthError, authenticateEducator } from '../../../lib/auth'
import { error, json } from '../../../lib/http'
import { markTopicComplete } from '../../../lib/progress'
import { getQuestionKey } from '../../../lib/questionKeys'
import type { FunctionContext } from '../../../lib/types'

export async function onRequestPost(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    assertSameOrigin(context)
    const topicId = context.params.topicId
    if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

    await markTopicComplete(context.env, educator.id, topicId)
    return json({ completed: true })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to save educator progress.', 500)
  }
}
