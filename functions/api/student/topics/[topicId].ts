import { error, json } from '../../../lib/http'
import { getQuestionKey } from '../../../lib/questionKeys'
import { getSingleActiveStudentSession, getStudentSession } from '../../../lib/quizSessions'
import type { FunctionContext } from '../../../lib/types'

export async function onRequestGet(context: FunctionContext) {
  const topicId = context.params.topicId
  if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

  const sessionId = new URL(context.request.url).searchParams.get('session')
  const session = sessionId
    ? await getStudentSession(context.env, topicId, sessionId)
    : await getSingleActiveStudentSession(context.env, topicId)
  if (!session) return json({ active: false, revealed: false })

  return json({
    active: true,
    revealed: session.status === 'revealed',
    ...(session.status === 'revealed' ? { correctAnswerIndex: session.correctAnswerIndex } : {}),
  })
}
