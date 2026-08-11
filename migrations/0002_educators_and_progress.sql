CREATE TABLE educators (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE educator_topic_progress (
  educator_id TEXT NOT NULL REFERENCES educators(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (educator_id, topic_id)
);

CREATE INDEX educator_topic_progress_by_educator
  ON educator_topic_progress(educator_id);

ALTER TABLE quiz_sessions ADD COLUMN educator_id TEXT REFERENCES educators(id);

UPDATE quiz_sessions
SET status = 'closed', closed_at = CURRENT_TIMESTAMP
WHERE educator_id IS NULL AND status IN ('open', 'revealed');

DROP INDEX one_active_quiz_session_per_topic;

CREATE UNIQUE INDEX one_active_quiz_session_per_educator_topic
  ON quiz_sessions(educator_id, topic_id)
  WHERE educator_id IS NOT NULL AND status IN ('open', 'revealed');

CREATE INDEX quiz_sessions_by_educator_topic
  ON quiz_sessions(educator_id, topic_id, status);
