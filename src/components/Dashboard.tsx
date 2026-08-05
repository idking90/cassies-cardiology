import { topics } from '../data/topics'
import { TopicCard } from './TopicCard'

type DashboardProps = { completedTopicIds: Set<string>; onSelectTopic: (topicId: string) => void }

export function Dashboard({ completedTopicIds, onSelectTopic }: DashboardProps) {
  return <main className="dashboard"><div className="topic-grid">{topics.map((topic) => <TopicCard isComplete={completedTopicIds.has(topic.id)} key={topic.id} onSelect={() => onSelectTopic(topic.id)} topic={topic} />)}</div></main>
}
