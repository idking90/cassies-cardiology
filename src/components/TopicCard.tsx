import type { Topic } from '../data/topics'

type TopicCardProps = {
  topic: Topic
  isComplete: boolean
  onSelect: () => void
}

export function TopicCard({ topic, isComplete, onSelect }: TopicCardProps) {
  return (
    <button
      className={`topic-card${isComplete ? ' complete' : ''}`}
      onClick={onSelect}
      type="button"
    >
      {isComplete && <span className="topic-card-status">Completed</span>}
      <strong>{topic.name}</strong>
      <span>{topic.description}</span>
    </button>
  )
}
