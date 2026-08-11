import type { Env } from './types'

export async function getCompletedTopicIds(env: Env, educatorId: string) {
  const result = await env.DB.prepare('SELECT topic_id AS topicId FROM educator_topic_progress WHERE educator_id = ? ORDER BY completed_at ASC').bind(educatorId).all<{ topicId: string }>()
  return result.results.map((row) => row.topicId)
}

export async function markTopicComplete(env: Env, educatorId: string, topicId: string) {
  await env.DB.prepare('INSERT INTO educator_topic_progress (educator_id, topic_id) VALUES (?, ?) ON CONFLICT(educator_id, topic_id) DO UPDATE SET completed_at = CURRENT_TIMESTAMP').bind(educatorId, topicId).run()
}

export async function resetEducatorRotation(env: Env, educatorId: string) {
  await env.DB.prepare("UPDATE quiz_sessions SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE educator_id = ? AND status IN ('open', 'revealed')").bind(educatorId).run()
  await env.DB.prepare('DELETE FROM educator_topic_progress WHERE educator_id = ?').bind(educatorId).run()
}
