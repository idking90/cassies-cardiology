import type { Topic } from '../data/topics'

type TeachingPageProps = { onBack: () => void; onDashboard: () => void; topic: Topic }

export function TeachingPage({ onBack, onDashboard, topic }: TeachingPageProps) {
  return <main className="teaching-page"><button className="text-button" onClick={onBack} type="button">Back to question</button><article className="teaching-content"><h1>{topic.teaching.title}</h1><p className="teaching-summary">{topic.teaching.summary}</p><section aria-labelledby="discussion-heading"><h2 id="discussion-heading">Discussion prompts</h2><ul>{topic.teaching.discussionPoints.map((point) => <li key={point}>{point}</li>)}</ul></section><aside className="facilitator-note"><h2>Facilitator note</h2><p>{topic.teaching.facilitatorNote}</p></aside><p className="teaching-reference">Reference: {topic.teaching.reference}</p></article><div className="page-actions"><button className="button button-secondary" onClick={onBack} type="button">Back to question</button><button className="button button-primary" onClick={onDashboard} type="button">Return to dashboard</button></div></main>
}
