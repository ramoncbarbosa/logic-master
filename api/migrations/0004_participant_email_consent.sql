ALTER TABLE attempts ADD COLUMN player_email TEXT;
ALTER TABLE attempts ADD COLUMN consent_at TEXT;
ALTER TABLE attempts ADD COLUMN consent_version TEXT;
CREATE INDEX idx_attempts_email ON attempts(player_email);
