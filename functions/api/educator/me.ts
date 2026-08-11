import { error, json } from '../../lib/http'
import { AuthError, authenticateEducator } from '../../lib/auth'
import type { FunctionContext } from '../../lib/types'

export async function onRequestGet(context: FunctionContext) {
  try {
    await authenticateEducator(context)
    return json({ authenticated: true })
  } catch (caughtError) {
    if (caughtError instanceof AuthError) return error(caughtError.message, caughtError.status)
    return error('Unable to validate educator authentication.', 500)
  }
}