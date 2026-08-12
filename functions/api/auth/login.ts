import { type FunctionContext } from '../../lib/types'
import { generateLoginURL } from '@cloudflare/pages-plugin-cloudflare-access/api'

const isSameOriginRedirect = (redirect: string, origin: string) => {
  try {
    const url = new URL(redirect, origin)
    return url.origin === origin
  } catch {
    return false
  }
}

export async function onRequestGet(context: FunctionContext) {
  const origin = new URL(context.request.url).origin
  const redirectParam = new URL(context.request.url).searchParams.get('redirect') ?? '/'
  const safeRedirect = isSameOriginRedirect(redirectParam, origin) ? redirectParam : '/'
  const redirectURL = new URL(safeRedirect, origin)

  const domain = context.env.ACCESS_TEAM_DOMAIN
  const aud = context.env.ACCESS_AUDIENCE
  if (!domain || !aud) {
    return new Response('Cloudflare Access configuration is missing.', { status: 500 })
  }

  const loginURL = generateLoginURL({
    redirectURL: redirectURL.toString(),
    domain,
    aud,
  })

  return new Response(null, {
    status: 302,
    headers: { Location: loginURL },
  })
}
