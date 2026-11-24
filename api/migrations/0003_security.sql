CREATE TABLE login_failures (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip         TEXT,
  email      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_login_failures_ip ON login_failures(ip, created_at);
CREATE INDEX idx_login_failures_email ON login_failures(email, created_at);
CREATE INDEX idx_attempts_ip ON attempts(ip, started_at);
