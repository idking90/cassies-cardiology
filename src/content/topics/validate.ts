import { VALID_MEDIA_TYPES, type ContentBlock, type Media, type Topic, type TopicOption, type TopicReference } from './types'

const mediaTypes = new Set<string>(VALID_MEDIA_TYPES)

function expectString(value: unknown, label: string, topicId: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`Topic "${topicId}" has an invalid ${label}.`)
  return value.trim()
}

function optionalString(value: unknown, label: string, topicId: string) {
  return value === undefined ? undefined : expectString(value, label, topicId)
}

function normalizeMedia(value: unknown, label: string, topicId: string): Media {
  if (!value || typeof value !== 'object') throw new Error(`Topic "${topicId}" has an invalid ${label}.`)
  const raw = value as Record<string, unknown>
  const type = expectString(raw.type, `${label}.type`, topicId)
  if (!mediaTypes.has(type)) throw new Error(`Topic "${topicId}" has invalid ${label}.type "${type}".`)
  const src = expectString(raw.src, `${label}.src`, topicId)
  if (!src.startsWith('/') || src.includes('..')) throw new Error(`Topic "${topicId}" ${label}.src must be a safe project-relative path.`)
  const caption = optionalString(raw.caption, `${label}.caption`, topicId)
  const source = optionalString(raw.source, `${label}.source`, topicId)
  return { type: type as Media['type'], src, alt: expectString(raw.alt, `${label}.alt`, topicId), ...(caption ? { caption } : {}), ...(source ? { source } : {}) }
}

function normalizeBlocks(value: unknown, label: string, topicId: string): ContentBlock[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`Topic "${topicId}" must include ${label}.`)
  return value.map((value, index) => {
    if (!value || typeof value !== 'object') throw new Error(`Topic "${topicId}" has an invalid ${label} block at index ${index}.`)
    const raw = value as Record<string, unknown>
    const blockLabel = `${label}[${index}]`
    if (raw.type === 'paragraph') return { type: 'paragraph', text: expectString(raw.text, `${blockLabel}.text`, topicId) }
    if (raw.type === 'bullets' || raw.type === 'numbered') {
      if (!Array.isArray(raw.items) || raw.items.length === 0) throw new Error(`Topic "${topicId}" ${blockLabel}.items must be nonempty.`)
      return { type: raw.type, items: raw.items.map((item, itemIndex) => expectString(item, `${blockLabel}.items[${itemIndex}]`, topicId)) }
    }
    if (raw.type === 'table') {
      if (!Array.isArray(raw.headers) || raw.headers.length === 0) throw new Error(`Topic "${topicId}" ${blockLabel}.headers must be nonempty.`)
      const headers = raw.headers.map((header, headerIndex) => expectString(header, `${blockLabel}.headers[${headerIndex}]`, topicId))
      if (!Array.isArray(raw.rows) || raw.rows.length === 0) throw new Error(`Topic "${topicId}" ${blockLabel}.rows must be nonempty.`)
      const rows = raw.rows.map((row, rowIndex) => {
        if (!Array.isArray(row) || row.length !== headers.length) throw new Error(`Topic "${topicId}" ${blockLabel}.rows[${rowIndex}] must match the header count.`)
        return row.map((cell, cellIndex) => expectString(cell, `${blockLabel}.rows[${rowIndex}][${cellIndex}]`, topicId))
      })
      return { type: 'table', headers, rows }
    }
    if (raw.type === 'media') return { type: 'media', media: normalizeMedia(raw.media, `${blockLabel}.media`, topicId) }
    throw new Error(`Topic "${topicId}" has an unsupported ${blockLabel}.type.`)
  })
}

function normalizeTopic(value: unknown, index: number): Topic {
  if (!value || typeof value !== 'object') throw new Error(`Topic content at index ${index} is not an object.`)
  const raw = value as Record<string, unknown>
  const id = expectString(raw.id, 'id', `index ${index}`)
  if (!raw.question || typeof raw.question !== 'object') throw new Error(`Topic "${id}" is missing question.`)
  const question = raw.question as Record<string, unknown>
  if (!Array.isArray(raw.options) || raw.options.length < 2) throw new Error(`Topic "${id}" must include at least two options.`)
  const optionIds = new Set<string>()
  const options: TopicOption[] = raw.options.map((value, optionIndex) => {
    if (!value || typeof value !== 'object') throw new Error(`Topic "${id}" has an invalid option at index ${optionIndex}.`)
    const option = value as Record<string, unknown>
    const optionId = expectString(option.id, `options[${optionIndex}].id`, id)
    if (optionIds.has(optionId)) throw new Error(`Topic "${id}" contains duplicate option id "${optionId}".`)
    optionIds.add(optionId)
    return { id: optionId, text: expectString(option.text, `options[${optionIndex}].text`, id) }
  })
  const correctOptionId = expectString(raw.correctOptionId, 'correctOptionId', id)
  if (!optionIds.has(correctOptionId)) throw new Error(`Topic "${id}" correctOptionId must match an option id.`)

  let optionRationales: Topic['optionRationales']
  if (raw.optionRationales !== undefined) {
    if (!Array.isArray(raw.optionRationales) || raw.optionRationales.length === 0) throw new Error(`Topic "${id}" optionRationales must be nonempty when supplied.`)
    const seen = new Set<string>()
    optionRationales = raw.optionRationales.map((value, rationaleIndex) => {
      if (!value || typeof value !== 'object') throw new Error(`Topic "${id}" has an invalid option rationale.`)
      const rationale = value as Record<string, unknown>
      const optionId = expectString(rationale.optionId, `optionRationales[${rationaleIndex}].optionId`, id)
      if (!optionIds.has(optionId) || seen.has(optionId)) throw new Error(`Topic "${id}" has an invalid or duplicate rationale for option "${optionId}".`)
      seen.add(optionId)
      return { optionId, content: normalizeBlocks(rationale.content, `optionRationales[${rationaleIndex}].content`, id) }
    })
  }

  let references: TopicReference[] | undefined
  if (raw.references !== undefined) {
    if (!Array.isArray(raw.references) || raw.references.length === 0) throw new Error(`Topic "${id}" references must be nonempty when supplied.`)
    references = raw.references.map((value, referenceIndex) => {
      if (!value || typeof value !== 'object') throw new Error(`Topic "${id}" has an invalid reference.`)
      const reference = value as Record<string, unknown>
      const url = optionalString(reference.url, `references[${referenceIndex}].url`, id)
      if (url && !/^https?:\/\//.test(url)) throw new Error(`Topic "${id}" has an invalid reference URL.`)
      return { title: expectString(reference.title, `references[${referenceIndex}].title`, id), citation: expectString(reference.citation, `references[${referenceIndex}].citation`, id), ...(url ? { url } : {}) }
    })
  }

  const description = optionalString(raw.description, 'description', id)
  const sourceQuestionNumber = optionalString(question.sourceQuestionNumber, 'question.sourceQuestionNumber', id)
  let media: Media[] | undefined
  if (question.media !== undefined) {
    if (!Array.isArray(question.media) || question.media.length === 0) throw new Error(`Topic "${id}" question.media must be nonempty when supplied.`)
    media = question.media.map((item, mediaIndex) => normalizeMedia(item, `question.media[${mediaIndex}]`, id))
  }
  const testingPoint = optionalString(raw.testingPoint, 'testingPoint', id)
  const bottomLine = optionalString(raw.bottomLine, 'bottomLine', id)
  return {
    id, name: expectString(raw.name, 'name', id), ...(description ? { description } : {}),
    question: { ...(sourceQuestionNumber ? { sourceQuestionNumber } : {}), stem: expectString(question.stem, 'question.stem', id), ...(media ? { media } : {}), prompt: expectString(question.prompt, 'question.prompt', id) },
    options, correctOptionId, explanation: normalizeBlocks(raw.explanation, 'explanation', id),
    ...(optionRationales ? { optionRationales } : {}), ...(testingPoint ? { testingPoint } : {}), ...(bottomLine ? { bottomLine } : {}), ...(references ? { references } : {}),
  }
}

export function validateTopics(rawTopics: unknown): Topic[] {
  if (!Array.isArray(rawTopics)) throw new Error('Topic content must be a JSON array.')
  const ids = new Set<string>()
  return rawTopics.map((rawTopic, index) => {
    const topic = normalizeTopic(rawTopic, index)
    if (ids.has(topic.id)) throw new Error(`Duplicate topic id "${topic.id}" found in the content set.`)
    ids.add(topic.id)
    return topic
  })
}
