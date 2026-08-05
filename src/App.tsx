import { useState } from 'react'
import { mockQuestions } from './mockQuestions'
import './App.css'

function App() {
  const [activeQuestionId, setActiveQuestionId] = useState(mockQuestions[0].id)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  const activeQuestion = mockQuestions.find(
    (question) => question.id === activeQuestionId,
  )!
  const isAnswered = selectedAnswer !== null
  const isCorrect = selectedAnswer === activeQuestion.correctAnswer

  function selectQuestion(questionId: string) {
    setActiveQuestionId(questionId)
    setSelectedAnswer(null)
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Live teaching prototype</p>
          <h1>Cassie's Cardiology</h1>
        </div>
        <span className="session-status">Session active</span>
      </header>

      <section className="learner-card" aria-labelledby="question-heading">
        <div className="question-meta">
          <span>{activeQuestion.topic}</span>
          <span>Multiple choice</span>
        </div>
        <h2 id="question-heading">{activeQuestion.prompt}</h2>

        <div className="answers" role="radiogroup" aria-label="Answer choices">
          {activeQuestion.choices.map((choice, index) => {
            const isSelected = selectedAnswer === index
            const answerState =
              isAnswered && index === activeQuestion.correctAnswer
                ? ' correct'
                : isSelected
                  ? ' incorrect'
                  : ''

            return (
              <button
                className={`answer${answerState}`}
                disabled={isAnswered}
                key={choice}
                onClick={() => setSelectedAnswer(index)}
                role="radio"
                aria-checked={isSelected}
              >
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span>{choice}</span>
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <section
            className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
            aria-live="polite"
          >
            <p className="feedback-label">{isCorrect ? 'Correct' : 'Not quite'}</p>
            <p>{activeQuestion.explanation}</p>
          </section>
        )}

        {isAnswered && !isCorrect && (
          <section className="teaching-card" aria-labelledby="teaching-heading">
            <p className="eyebrow">Teaching material</p>
            <h3 id="teaching-heading">Key discussion points</h3>
            <ul>
              {activeQuestion.teachingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="reference">Reference: {activeQuestion.reference}</p>
          </section>
        )}
      </section>

      <aside className="teacher-panel" aria-labelledby="teacher-heading">
        <div className="teacher-panel-heading">
          <div>
            <p className="eyebrow">Educator view</p>
            <h2 id="teacher-heading">Select active question</h2>
          </div>
          <span className="mock-badge">Mock data</span>
        </div>
        <p className="teacher-intro">
          Choose the question learners should see. This selection is local to the prototype.
        </p>
        <div className="question-list">
          {mockQuestions.map((question, index) => (
            <button
              className={`question-option${question.id === activeQuestionId ? ' active' : ''}`}
              key={question.id}
              onClick={() => selectQuestion(question.id)}
            >
              <span className="question-number">{index + 1}</span>
              <span>
                <strong>{question.topic}</strong>
                <small>{question.prompt}</small>
              </span>
              {question.id === activeQuestionId && <span className="active-label">Active</span>}
            </button>
          ))}
        </div>
      </aside>
    </main>
  )
}

export default App
