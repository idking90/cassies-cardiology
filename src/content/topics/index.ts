import rhythmReview from './rhythm-review.json'
import murmurBasics from './murmur-basics.json'
import chestPain from './chest-pain.json'
import heartFailure from './heart-failure.json'
import type { Topic } from './types'
import { validateTopics } from './validate'

const rawTopics = [rhythmReview, murmurBasics, chestPain, heartFailure]

export const topics: Topic[] = validateTopics(rawTopics)

export function getTopic(topicId: string) {
  return topics.find((topic) => topic.id === topicId)
}

export function getTopics() {
  return topics
}
