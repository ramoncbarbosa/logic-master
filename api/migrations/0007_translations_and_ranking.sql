CREATE TABLE quiz_translations (
  quiz_id     INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  audience    TEXT NOT NULL DEFAULT '',
  objective   TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (quiz_id, locale)
);

CREATE TABLE question_translations (
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  concept     TEXT NOT NULL DEFAULT '',
  options     TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  image_url   TEXT,
  image_alt   TEXT,
  code        TEXT,
  PRIMARY KEY (question_id, locale)
);

ALTER TABLE attempts ADD COLUMN locale TEXT NOT NULL DEFAULT 'pt';
CREATE INDEX idx_attempts_ranking ON attempts(quiz_id, finished_at, score);
