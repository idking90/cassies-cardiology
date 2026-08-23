export type QuestionKey = {
  choiceCount: number
  correctAnswerIndex: number
}

const questionKeys: Record<string, QuestionKey> = {
  'hlhs': { correctAnswerIndex: 2, choiceCount: 5 },
  'murmurs': { correctAnswerIndex: 1, choiceCount: 5 },
  'vsds': { correctAnswerIndex: 2, choiceCount: 5 },
  'asd': { correctAnswerIndex: 1, choiceCount: 5 },
  'free-space-genetics': { correctAnswerIndex: 1, choiceCount: 5 },
  'heart-failure': { correctAnswerIndex: 1, choiceCount: 5 },
  'cchd': { correctAnswerIndex: 1, choiceCount: 5 },
  'alcapa': { correctAnswerIndex: 1, choiceCount: 5 },
  'coarctation': { correctAnswerIndex: 2, choiceCount: 5 },
  'echo': { correctAnswerIndex: 4, choiceCount: 5 },
  'ekg': { correctAnswerIndex: 3, choiceCount: 5 },
  'infectious-disease': { correctAnswerIndex: 4, choiceCount: 5 },
  'cyanotic-heart': { correctAnswerIndex: 0, choiceCount: 5 },
  'tapvr': { correctAnswerIndex: 4, choiceCount: 5 },
  'htn': { correctAnswerIndex: 4, choiceCount: 5 },
  'dorv': { correctAnswerIndex: 0, choiceCount: 5 },
  'sports-physical': { correctAnswerIndex: 3, choiceCount: 5 },
  'chest-pain': { correctAnswerIndex: 1, choiceCount: 5 },
  'wpw': { correctAnswerIndex: 2, choiceCount: 5 },
  'pda': { correctAnswerIndex: 4, choiceCount: 5 },
  'avcd': { correctAnswerIndex: 2, choiceCount: 5 },
  'transitional': { correctAnswerIndex: 4, choiceCount: 5 },
  'pulmonary-hypertension': { correctAnswerIndex: 2, choiceCount: 5 },
  'cardiac-masses': { correctAnswerIndex: 1, choiceCount: 5 },
  'mechanical-circulatory-support': { correctAnswerIndex: 1, choiceCount: 5 },
}

export function getQuestionKey(topicId: string) {
  return questionKeys[topicId]
}
