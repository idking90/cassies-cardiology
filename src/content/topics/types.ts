export const VALID_MEDIA_TYPES = ['image', 'ecg', 'xray', 'diagram'] as const
export type MediaType = (typeof VALID_MEDIA_TYPES)[number]
export type Media = { type: MediaType; src: string; alt: string; caption?: string; source?: string }
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'media'; media: Media }
export type TopicOption = { id: string; text: string }
export type TopicReference = { title: string; citation: string; url?: string }
export type Topic = {
  id: string
  name: string
  description?: string
  question: { sourceQuestionNumber?: string; stem: string; media?: Media[]; prompt: string }
  options: TopicOption[]
  correctOptionId: string
  explanation: ContentBlock[]
  optionRationales?: { optionId: string; content: ContentBlock[] }[]
  testingPoint?: string
  bottomLine?: string
  references?: TopicReference[]
}
