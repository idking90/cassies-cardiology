import { assertSameOrigin, AuthError, authenticateEducator } from '../../../lib/auth'
import { error, json } from '../../../lib/http'
import { resetEducatorRotation } from '../../../lib/progress'
import type { FunctionContext } from '../../../lib/types'

export async function onRequestPost(context: FunctionContext) {
  try {
    const educator = await authenticateEducator(context)
    assertSameOrigin(context)
    await resetEducatorRotation(context.env, educator.id)
    return json({ reset: true })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to reset educator progress.', 500)
  }
}
