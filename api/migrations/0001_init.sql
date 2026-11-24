CREATE TABLE owners (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE quizzes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id    INTEGER REFERENCES owners(id) ON DELETE SET NULL,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  audience    TEXT NOT NULL DEFAULT '',
  objective   TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  video_url   TEXT,
  license     TEXT NOT NULL DEFAULT 'CC BY-SA 4.0',
  published   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE questions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  prompt        TEXT NOT NULL,
  concept       TEXT NOT NULL DEFAULT '',
  image_url     TEXT,
  image_alt     TEXT,
  code          TEXT,
  options       TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation   TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_questions_quiz ON questions(quiz_id, position);

CREATE TABLE attempts (
  id          TEXT PRIMARY KEY,
  quiz_id     INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  ip          TEXT,
  country     TEXT,
  region      TEXT,
  city        TEXT,
  user_agent  TEXT,
  started_at  TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  score       INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL
);
CREATE INDEX idx_attempts_quiz ON attempts(quiz_id, started_at);

CREATE TABLE answers (
  attempt_id     TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id    INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_index INTEGER NOT NULL,
  is_correct     INTEGER NOT NULL,
  time_ms        INTEGER,
  answered_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (attempt_id, question_id)
);
CREATE INDEX idx_answers_question ON answers(question_id);
