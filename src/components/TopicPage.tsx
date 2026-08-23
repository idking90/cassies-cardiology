import type { Topic } from '../data/topics'
import { QrPanel } from './QrPanel'
import { QuestionPanel } from './QuestionPanel'
import { ResponseSummary } from './ResponseSummary'

type TopicPageProps = { correctAnswerIndex: number; isComplete: boolean; isDemo?: boolean; isRevealed: boolean; onBack: () => void; onLearnMore: () => void; onMarkComplete: () => void; onRevealAnswer: () => void; responseCounts: number[]; topic: Topic; topicUrl: string }

export function TopicPage({ correctAnswerIndex, isComplete, isDemo = false, isRevealed, onBack, onLearnMore, onMarkComplete, onRevealAnswer, responseCounts, topic, topicUrl }: TopicPageProps) {
  const correctAnswer = `${topic.options[correctAnswerIndex]?.id ?? ''}. ${topic.options[correctAnswerIndex]?.text ?? ''}`
  return <main><div className="page-actions page-actions-top"><button className="text-button" onClick={onBack} type="button">Back to dashboard</button>{isComplete && <span className="completion-pill">Topic completed</span>}{isDemo && <span className="completion-pill">Demo mode</span>}</div><div className="topic-layout"><QuestionPanel key={topic.id} topic={topic} /><QrPanel topicName={topic.name} topicUrl={topicUrl} /></div><ResponseSummary isDemo={isDemo} responseCounts={responseCounts} topic={topic} />{isRevealed && <p className="revealed-answer educator-revealed-answer" aria-live="polite">Answer revealed: <strong>{correctAnswer}</strong></p>}<div className="page-actions"><button className="button button-secondary" onClick={onBack} type="button">Back</button><button className="button button-secondary" onClick={onLearnMore} type="button">Learn more</button><button className="button button-secondary" disabled={isRevealed} onClick={onRevealAnswer} type="button">{isRevealed ? 'Answer revealed' : isDemo ? 'Sign in to reveal' : 'Reveal answer'}</button><button className="button button-primary" onClick={onMarkComplete} type="button">{isDemo ? 'Sign in to save progress' : 'Mark topic complete'}</button></div></main>
}
