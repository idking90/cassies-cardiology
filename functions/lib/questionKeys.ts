export type QuestionKey = {
  choiceCount: number
  correctAnswerIndex: number
}

const questionKeys: Record<string, QuestionKey> = {
  'rhythm-review': { correctAnswerIndex: 0, choiceCount: 4 },
  'murmur-basics': { correctAnswerIndex: 0, choiceCount: 4 },
  'chest-pain': { correctAnswerIndex: 2, choiceCount: 4 },
  'heart-failure': { correctAnswerIndex: 1, choiceCount: 4 },
}

export function getQuestionKey(topicId: string) {
  return questionKeys[topicId]
}
