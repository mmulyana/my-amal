import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const path = process.env.DATABASE_PATH ?? './data/my-amal.db'
mkdirSync(dirname(path), { recursive: true })

export const db = new Database(path)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS prayer_logs (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    prayer TEXT NOT NULL CHECK (prayer IN ('subuh','dzuhur','ashar','maghrib','isya')),
    completed INTEGER NOT NULL DEFAULT 1,
    logged_at TEXT,
    PRIMARY KEY (user_id, date, prayer)
  );
`)

// Migration for databases created before the logged_at column existed
const cols = db.prepare("PRAGMA table_info(prayer_logs)").all() as { name: string }[]
if (!cols.some((col) => col.name === 'logged_at')) {
  db.exec('ALTER TABLE prayer_logs ADD COLUMN logged_at TEXT')
}

export type User = { id: number; email: string }

export function getUserByEmail(email: string): User | undefined {
  return db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as User | undefined
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT id, email FROM users WHERE id = ?').get(id) as User | undefined
}
