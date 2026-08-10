import { useEffect, useState } from 'react'
import { getStudentStatus, submitStudentResponse, type StudentStatus } from '../data/quizApi'
import type { Topic } from '../data/topics'
import { QuestionPanel } from './QuestionPanel'

type StudentPageProps = { topic: Topic }

export function StudentPage({ topic }: StudentPageProps) {
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null)
  const [status, setStatus] = useState<StudentStatus>({ active: false, revealed: false })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function refreshStatus() {
      try {
        const nextStatus = await getStudentStatus(topic.id)
        if (!cancelled) {
          setStatus(nextStatus)
          setErrorMessage(null)
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : 'Unable to load this question.')
      }
    }
    void refreshStatus()
    const intervalId = window.setInterval(() => void refreshStatus(), 2000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [topic.id])

  async function submitAnswer(choiceIndex: number) {
    setErrorMessage(null)
    try {
      await submitStudentResponse(topic.id, choiceIndex)
      setSubmittedAnswer(choiceIndex)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to record your answer.')
    }
  }

  const { correctAnswerIndex, revealed: isRevealed } = status
  const correctAnswer = correctAnswerIndex === undefined ? '' : `${String.fromCharCode(65 + correctAnswerIndex)}. ${topic.choices[correctAnswerIndex]}`

  return <main className="student-page"><div className="student-question"><p className="eyebrow">Cassie's Cardiology</p>{errorMessage ? <p className="submission-status" role="alert">{errorMessage}</p> : !status.active ? <p className="submission-status" aria-live="polite">This question is not accepting responses right now.</p> : <QuestionPanel interactive onSubmitAnswer={submitAnswer} revealCorrectAnswerIndex={isRevealed ? correctAnswerIndex : undefined} submitted={submittedAnswer !== null} topic={topic} />}{submittedAnswer !== null && <p className="submission-status" aria-live="polite">Answer recorded — waiting for discussion.</p>}{isRevealed && correctAnswerIndex !== undefined && <p className="revealed-answer" aria-live="polite">The educator has revealed the answer: <strong>{correctAnswer}</strong></p>}</div></main>
}
