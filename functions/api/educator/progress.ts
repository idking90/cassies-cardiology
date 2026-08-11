import { AuthError, authenticateEducator } from '../../lib/auth'
import { error, json } from '../../lib/http'
import { getCompletedTopicIds } from '../../lib/progress'
import type { FunctionContext } from '../../lib/types'

export async function onRequestGet(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    return json({ completedTopicIds: await getCompletedTopicIds(context.env, educator.id) })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to load educator progress.', 500)
  }
}
