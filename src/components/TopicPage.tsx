import type { Topic } from '../data/topics'
import { QrPanel } from './QrPanel'
import { QuestionPanel } from './QuestionPanel'
import { ResponseSummary } from './ResponseSummary'

type TopicPageProps = { isComplete: boolean; onBack: () => void; onLearnMore: () => void; onMarkComplete: () => void; topic: Topic; topicUrl: string }

export function TopicPage({ isComplete, onBack, onLearnMore, onMarkComplete, topic, topicUrl }: TopicPageProps) {
  return <main><div className="page-actions page-actions-top"><button className="text-button" onClick={onBack} type="button">Back to dashboard</button>{isComplete && <span className="completion-pill">Topic completed</span>}</div><div className="topic-layout"><QuestionPanel key={topic.id} topic={topic} /><QrPanel topicName={topic.name} topicUrl={topicUrl} /></div><ResponseSummary topic={topic} /><div className="page-actions"><button className="button button-secondary" onClick={onBack} type="button">Back</button><button className="button button-secondary" onClick={onLearnMore} type="button">Learn more</button><button className="button button-primary" onClick={onMarkComplete} type="button">Mark topic complete</button></div></main>
}
