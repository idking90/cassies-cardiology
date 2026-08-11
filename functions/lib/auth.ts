import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { FunctionContext } from './types'

export type EducatorIdentity = {
  email?: string
  id: string
}

export class AuthError extends Error {
  status: 401 | 403

  constructor(message: string, status: 401 | 403 = 401) {
    super(message)
    this.status = status
  }
}

export function assertSameOrigin(context: FunctionContext) {
  const origin = context.request.headers.get('origin')
  if (origin && origin !== new URL(context.request.url).origin) throw new AuthError('The request origin is not allowed.', 403)
}

export async function authenticateEducator(context: FunctionContext): Promise<EducatorIdentity> {
  const token = context.request.headers.get('cf-access-jwt-assertion')
  if (!token) throw new AuthError('Educator authentication is required.')

  const teamDomain = context.env.ACCESS_TEAM_DOMAIN?.replace(/\/$/, '')
  const audience = context.env.ACCESS_AUDIENCE
  if (!teamDomain || !audience) throw new Error('Cloudflare Access configuration is missing.')

  const jwks = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`))
  let payload
  try {
    ({ payload } = await jwtVerify(token, jwks, { audience, issuer: teamDomain }))
  } catch {
    throw new AuthError('Educator authentication is invalid.')
  }

  if (!payload.sub) throw new AuthError('The educator identity is missing.', 403)

  const identity = { email: typeof payload.email === 'string' ? payload.email : undefined, id: payload.sub }
  await context.env.DB.prepare(`INSERT INTO educators (id, email) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET email = excluded.email, last_seen_at = CURRENT_TIMESTAMP`).bind(identity.id, identity.email ?? null).run()
  return identity
}