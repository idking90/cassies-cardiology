import { useState } from 'react'
import type { Topic } from '../data/topics'
import { MediaRenderer } from './MediaRenderer'

type QuestionPanelProps = {
  interactive?: boolean
  onSubmitAnswer?: (choiceIndex: number) => void
  revealCorrectAnswerIndex?: number
  submitted?: boolean
  topic: Topic
}

export function QuestionPanel({ interactive = false, onSubmitAnswer, revealCorrectAnswerIndex, submitted = false, topic }: QuestionPanelProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)

  function selectChoice(choiceId: string) {
    setSelectedChoiceId(choiceId)
  }

  function submitAnswer() {
    if (selectedChoiceId !== null) {
      const selectedChoiceIndex = topic.options.findIndex((option) => option.id === selectedChoiceId)
      if (selectedChoiceIndex >= 0) onSubmitAnswer?.(selectedChoiceIndex)
    }
  }

  const orderedOptionIds = topic.options.map((option) => option.id)

  return <section className="question-panel" aria-labelledby="question-heading"><div className="question-stem">{topic.question.sourceQuestionNumber && <p className="source-question-number">Source question {topic.question.sourceQuestionNumber}</p>}<p>{topic.question.stem}</p></div>{topic.question.media?.map((media, index) => <MediaRenderer key={`${media.src}-${index}`} media={media} />)}<h1 id="question-heading" className="question-prompt">{topic.question.prompt}</h1><div className="answer-list" role={interactive ? 'radiogroup' : undefined} aria-label="Answer choices">{topic.options.map((option) => {
    const isSelected = selectedChoiceId === option.id
    const isCorrect = revealCorrectAnswerIndex !== undefined && option.id === orderedOptionIds[revealCorrectAnswerIndex]
    const label = option.id
    return interactive ? <button aria-checked={isSelected} className={`answer-choice${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}`} disabled={submitted} key={option.id} onClick={() => selectChoice(option.id)} role="radio" type="button"><span>{label}</span>{option.text}</button> : <div className="answer-preview" key={option.id}><span>{label}</span>{option.text}</div>
  })}</div>{interactive && <button className="button button-primary submit-answer" disabled={selectedChoiceId === null || submitted} onClick={submitAnswer} type="button">{submitted ? 'Answer recorded' : 'Submit answer'}</button>}</section>
}
