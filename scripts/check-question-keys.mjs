import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const topicDirectory = join(process.cwd(), 'src', 'content', 'topics')
const topicFiles = (await readdir(topicDirectory)).filter((file) => file.endsWith('.json'))
const topics = await Promise.all(topicFiles.map(async (file) => JSON.parse(await readFile(join(topicDirectory, file), 'utf8'))))
const keySource = await readFile(join(process.cwd(), 'functions', 'lib', 'questionKeys.ts'), 'utf8')
const keyPattern = /'([^']+)':\s*\{\s*correctAnswerIndex:\s*(\d+),\s*choiceCount:\s*(\d+)\s*\}/g
const keys = new Map([...keySource.matchAll(keyPattern)].map((match) => [match[1], { correctAnswerIndex: Number(match[2]), choiceCount: Number(match[3]) }]))
const errors = []

for (const topic of topics) {
  const key = keys.get(topic.id)
  const correctAnswerIndex = topic.options.findIndex((option) => option.id === topic.correctOptionId)
  if (!key) errors.push(`Missing server question key for topic "${topic.id}".`)
  else if (key.choiceCount !== topic.options.length || key.correctAnswerIndex !== correctAnswerIndex) errors.push(`Question key mismatch for "${topic.id}": expected correctAnswerIndex ${correctAnswerIndex}, choiceCount ${topic.options.length}.`)
  keys.delete(topic.id)
}
for (const topicId of keys.keys()) errors.push(`Server question key "${topicId}" has no curriculum topic.`)
if (errors.length > 0) throw new Error(`Question-key consistency check failed:\n${errors.join('\n')}`)
console.log(`Question-key consistency check passed for ${topics.length} topics.`)
