import { useState } from 'react'
import type { Topic } from '../data/topics'
import { QuestionPanel } from './QuestionPanel'

export function StudentPage({ topic }: { topic: Topic }) {
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null)

  function submitAnswer(choiceIndex: number) {
    setSubmittedAnswer(choiceIndex)
  }

  return <main className="student-page"><QuestionPanel interactive onSubmitAnswer={submitAnswer} topic={topic} />{submittedAnswer !== null && <p className="submission-status" aria-live="polite">Answer submitted.</p>}</main>
}
