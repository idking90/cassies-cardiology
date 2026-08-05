import type { Topic } from '../data/topics'

type ResponseSummaryProps = {
  topic: Topic
}

export function ResponseSummary({ topic }: ResponseSummaryProps) {
  const totalResponses = topic.responseCounts.reduce((total, count) => total + count, 0)

  return (
    <section className="response-summary" aria-labelledby="response-summary-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Educator view</p>
          <h2 id="response-summary-heading">Anonymous responses</h2>
        </div>
        <span className="response-total">{totalResponses} responses</span>
      </div>
      <p className="summary-description">Simulated prototype data — no learner information is collected.</p>
      <div className="response-bars">
        {topic.choices.map((choice, index) => {
          const count = topic.responseCounts[index]
          const percentage = Math.round((count / totalResponses) * 100)

          return (
            <div className="response-row" key={choice}>
              <div className="response-label">
                <span>{String.fromCharCode(65 + index)}</span>
                <span>{percentage}%</span>
              </div>
              <div className="response-track" aria-label={`${choice}: ${count} responses`}>
                <span className="response-fill" style={{ width: `${percentage}%` }} />
              </div>
              <span className="response-count">{count}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
