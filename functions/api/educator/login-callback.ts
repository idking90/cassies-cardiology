import { authenticateEducator } from '../../lib/auth'
import type { FunctionContext } from '../../lib/types'

function safeReturnPath(returnParam: string | null): string {
  if (!returnParam) return '/'
  if (!returnParam.startsWith('/')) return '/'
  try {
    const url = new URL(returnParam, 'https://example.com')
    return url.pathname + url.search
  } catch {
    return '/'
  }
}

export async function onRequestGet(context: FunctionContext) {
  await authenticateEducator(context)

  const requestedReturn = new URL(context.request.url).searchParams.get('return')
  const safeReturn = safeReturnPath(requestedReturn)
  const origin = new URL(context.request.url).origin
  const redirectURL = new URL(safeReturn, origin)

  return new Response(null, {
    status: 302,
    headers: { Location: redirectURL.toString() },
  })
}
