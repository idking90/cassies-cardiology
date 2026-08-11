import { error, json } from '../../../../lib/http'
import { getQuestionKey } from '../../../../lib/questionKeys'
import { getSingleActiveStudentSession, getStudentSession } from '../../../../lib/quizSessions'
import type { FunctionContext } from '../../../../lib/types'

type Submission = { choiceIndex?: unknown }

export async function onRequestPost(context: FunctionContext) {
  const topicId = context.params.topicId
  if (!topicId || !getQuestionKey(topicId)) return error('Unknown topic.', 404)

  let submission: Submission
  try {
    submission = await context.request.json<Submission>()
  } catch {
    return error('A response choice is required.', 400)
  }

  if (!Number.isInteger(submission.choiceIndex)) return error('A valid response choice is required.', 400)

  const sessionId = new URL(context.request.url).searchParams.get('session')
  const session = sessionId
    ? await getStudentSession(context.env, topicId, sessionId)
    : await getSingleActiveStudentSession(context.env, topicId)
  if (!session) return error('A specific quiz session is required.', 409)
  if (!session) return error('This topic is not accepting responses right now.', 409)
  if (session.status !== 'open') return error('This question is no longer accepting responses.', 409)
  if (submission.choiceIndex < 0 || submission.choiceIndex >= session.choiceCount) return error('That response choice is not available.', 400)

  await context.env.DB.prepare('INSERT INTO quiz_responses (id, session_id, choice_index) VALUES (?, ?, ?)').bind(crypto.randomUUID(), session.id, submission.choiceIndex).run()
  return json({ recorded: true }, { status: 201 })
}
