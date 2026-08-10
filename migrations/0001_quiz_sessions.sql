CREATE TABLE quiz_sessions (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  correct_answer_index INTEGER NOT NULL,
  choice_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'revealed', 'closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revealed_at TEXT,
  closed_at TEXT
);

CREATE UNIQUE INDEX one_active_quiz_session_per_topic
  ON quiz_sessions(topic_id)
  WHERE status IN ('open', 'revealed');

CREATE TABLE quiz_responses (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES quiz_sessions(id),
  choice_index INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX quiz_responses_by_session
  ON quiz_responses(session_id, choice_index);
