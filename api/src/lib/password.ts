import { PBKDF2_ITERATIONS } from '../config'

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

const fromHex = (hex: string) => new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))

export const DUMMY_SALT = '0'.repeat(32)
export const DUMMY_HASH = '0'.repeat(64)

export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS }, key, 256)
  return { hash: toHex(bits), salt: toHex(salt) }
}

export function timingSafeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a)
  const eb = new TextEncoder().encode(b)
  if (ea.length !== eb.length) return false
  let diff = 0
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i]
  return diff === 0
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const candidate = await hashPassword(password, salt)
  return timingSafeEqual(candidate.hash, hash)
}
