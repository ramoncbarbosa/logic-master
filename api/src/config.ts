export const SESSION_COOKIE = 'lm_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 8
export const PBKDF2_ITERATIONS = 100_000
export const LOGIN_LOCK_WINDOW = '-15 minutes'
export const MAX_LOGIN_FAILURES_PER_IP = 10
export const MAX_LOGIN_FAILURES_PER_EMAIL = 5
export const DATA_RETENTION_DAYS = 180
export const MAX_BODY_BYTES = 1024 * 1024
export const DEFAULT_LICENSE = 'CC BY-NC-SA 4.0'
export const CONTENT_LICENSES: Record<string, string> = {
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY-NC 4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'CC BY-NC-SA 4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
}

export const REPOSITORY_URL = 'https://github.com/ramoncbarbosa/logic-master'
export const EXPORT_FORMAT = 'logic-master-quiz'
export const EXPORT_VERSION = 1
