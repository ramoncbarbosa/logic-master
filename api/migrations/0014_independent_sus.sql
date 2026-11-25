CREATE TABLE sus_responses_new (
  id TEXT PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  q1 INTEGER NOT NULL, q2 INTEGER NOT NULL, q3 INTEGER NOT NULL, q4 INTEGER NOT NULL, q5 INTEGER NOT NULL,
  q6 INTEGER NOT NULL, q7 INTEGER NOT NULL, q8 INTEGER NOT NULL, q9 INTEGER NOT NULL, q10 INTEGER NOT NULL,
  score REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (date('now'))
);

INSERT INTO sus_responses_new (id, quiz_id, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, score, created_at)
SELECT lower(hex(randomblob(16))), quiz_id, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, score, date(created_at)
FROM sus_responses;

DROP TABLE sus_responses;
ALTER TABLE sus_responses_new RENAME TO sus_responses;
CREATE INDEX idx_sus_quiz ON sus_responses(quiz_id, created_at);
DROP TABLE answers;
DROP TABLE attempts;
