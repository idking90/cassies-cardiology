import { useState } from 'react'
import type { Topic } from '../data/topics'

type QuestionPanelProps = {
  interactive?: boolean
  onSubmitAnswer?: (choiceIndex: number) => void
  revealCorrectAnswerIndex?: number
  submitted?: boolean
  topic: Topic
}

export function QuestionPanel({ interactive = false, onSubmitAnswer, revealCorrectAnswerIndex, submitted = false, topic }: QuestionPanelProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)

  function selectChoice(choiceIndex: number) {
    setSelectedChoice(choiceIndex)
  }

  function submitAnswer() {
    if (selectedChoice !== null) onSubmitAnswer?.(selectedChoice)
  }

  return <section className="question-panel" aria-labelledby="question-heading"><h1 id="question-heading">{topic.question}</h1><div className="answer-list" role={interactive ? 'radiogroup' : undefined} aria-label="Answer choices">{topic.choices.map((choice, index) => interactive ? <button aria-checked={selectedChoice === index} className={`answer-choice${selectedChoice === index ? ' selected' : ''}${revealCorrectAnswerIndex === index ? ' correct' : ''}`} disabled={submitted} key={choice} onClick={() => selectChoice(index)} role="radio" type="button"><span>{String.fromCharCode(65 + index)}</span>{choice}</button> : <div className="answer-preview" key={choice}><span>{String.fromCharCode(65 + index)}</span>{choice}</div>)}</div>{interactive && <button className="button button-primary submit-answer" disabled={selectedChoice === null || submitted} onClick={submitAnswer} type="button">{submitted ? 'Answer recorded' : 'Submit answer'}</button>}</section>
}
