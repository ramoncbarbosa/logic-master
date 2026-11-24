import type { Bindings } from './types'

export const CONSENT_VERSION = '2026-11-v1'
export const SESSION_COOKIE = 'lm_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 8
export const PBKDF2_ITERATIONS = 100_000
export const ATTEMPT_MAX_AGE_HOURS = 3
export const MAX_ATTEMPTS_PER_IP_PER_HOUR = 30
export const LOGIN_LOCK_WINDOW = '-15 minutes'
export const MAX_LOGIN_FAILURES_PER_IP = 10
export const MAX_LOGIN_FAILURES_PER_EMAIL = 5
export const DATA_RETENTION_DAYS = 180
export const MAX_BODY_BYTES = 256 * 1024
export const DEFAULT_LICENSE = 'CC BY-SA 4.0'

export const allowedEmailDomains = (env: Bindings) =>
  (env.ALLOWED_EMAIL_DOMAINS ?? 'icen.ufpa.br')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
