import { randomBytes } from 'node:crypto'
import { hash, compare } from 'bcryptjs'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { db, getUserById, type User } from './db.js'

const SESSION_DAYS = 30

export async function createUser(email: string, password: string) {
  const passwordHash = await hash(password, 12)
  const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash)
  return Number(result.lastInsertRowid)
}

export async function checkPassword(email: string, password: string) {
  const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as { id: number; password_hash: string } | undefined
  return row && await compare(password, row.password_hash) ? row.id : undefined
}

export function startSession(c: Context, userId: number) {
  const id = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000)
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(id, userId, expires.toISOString())
  setCookie(c, 'session', id, { httpOnly: true, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 86400 })
}

export function endSession(c: Context) {
  const id = getCookie(c, 'session')
  if (id) db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
  deleteCookie(c, 'session', { path: '/' })
}

export function currentUser(c: Context): User | undefined {
  const id = getCookie(c, 'session')
  if (!id) return undefined
  const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').get(id) as { user_id: number; expires_at: string } | undefined
  if (!session || new Date(session.expires_at) <= new Date()) return undefined
  return getUserById(session.user_id)
}
