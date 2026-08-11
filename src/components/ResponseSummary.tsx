import type { Topic } from '../data/topics'

type ResponseSummaryProps = {
  isDemo?: boolean
  responseCounts: number[]
  topic: Topic
}

export function ResponseSummary({ isDemo = false, responseCounts, topic }: ResponseSummaryProps) {
  const totalResponses = responseCounts.reduce((total, count) => total + count, 0)

  return (
    <section className="response-summary" aria-labelledby="response-summary-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Educator view</p>
          <h2 id="response-summary-heading">Anonymous responses</h2>
        </div>
        <span className="response-total">{isDemo ? 'Demo mode' : `${totalResponses} responses`}</span>
      </div>
      <p className="summary-description">{isDemo ? 'Sign in as an educator to view live responses from a quiz session.' : 'Anonymous responses from this quiz session. No learner information is collected.'}</p>
      {!isDemo && <div className="response-bars">
        {topic.choices.map((choice, index) => {
          const count = responseCounts[index]
          const percentage = totalResponses === 0 ? 0 : Math.round((count / totalResponses) * 100)

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
      </div>}
    </section>
  )
}
