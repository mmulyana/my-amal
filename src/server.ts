import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createUser, checkPassword, currentUser, endSession, startSession } from './auth.js'
import { today, weekDates, dayLabelFor, currentMonth, monthRange } from './dates.js'
import { db, getUserByEmail } from './db.js'
import { prayerKeys } from './prayers.js'
import { authPage } from './views/auth.js'
import { homePage, renderPrayerCircle } from './views/home.js'
import { layout } from './views/layout.js'
import { reportPage } from './views/report.js'

const app = new Hono()

app.get('/login', (c) => currentUser(c) ? c.redirect('/') : c.html(authPage('login')))
app.get('/register', (c) => currentUser(c) ? c.redirect('/') : c.html(authPage('register')))

app.post('/register', async (c) => {
  const body = await c.req.parseBody()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  if (!email || password.length < 8) return c.html(authPage('register', 'Email dan password minimal 8 karakter wajib diisi.'), 400)
  if (getUserByEmail(email)) return c.html(authPage('register', 'Email tersebut sudah terdaftar.'), 409)
  try {
    const id = await createUser(email, password)
    startSession(c, id)
    return c.redirect('/')
  } catch {
    return c.html(authPage('register', 'Email tidak valid atau gagal membuat akun.'), 400)
  }
})

app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const id = await checkPassword(String(body.email ?? '').trim().toLowerCase(), String(body.password ?? ''))
  if (!id) return c.html(authPage('login', 'Email atau password salah.'), 401)
  startSession(c, id)
  return c.redirect('/')
})

app.post('/logout', (c) => { endSession(c); return c.redirect('/login') })

app.get('/', (c) => {
  const user = currentUser(c)
  if (!user) return c.redirect('/login')
  const timezone = getCookie(c, 'timezone') ?? 'UTC'
  const date = today(timezone)
  const week = weekDates(date)
  const placeholders = week.map(() => '?').join(',')
  const rows = db.prepare(`SELECT prayer, date FROM prayer_logs WHERE user_id = ? AND date IN (${placeholders}) AND completed = 1`).all(user.id, ...week) as { prayer: string; date: string }[]
  const completed: Record<string, Set<string>> = {}
  for (const row of rows) {
    (completed[row.prayer] ??= new Set()).add(row.date)
  }
  return c.html(layout('Hari ini', homePage(date, week, completed, user.email), user, 'home'))
})

app.get('/report', (c) => {
  const user = currentUser(c)
  if (!user) return c.redirect('/login')
  const timezone = getCookie(c, 'timezone') ?? 'UTC'
  const requested = c.req.query('month')
  const month = requested && /^\d{4}-\d{2}$/.test(requested) ? requested : currentMonth(timezone)
  const { start, end, days } = monthRange(month)
  const rows = db.prepare('SELECT prayer, COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND date >= ? AND date <= ? AND completed = 1 GROUP BY prayer').all(user.id, start, end) as { prayer: string; count: number }[]
  const counts: Record<string, number> = {}
  for (const row of rows) counts[row.prayer] = row.count
  return c.html(layout('Report', reportPage(month, days, counts), user, 'report'))
})

app.post('/habits/prayer', async (c) => {
  const user = currentUser(c)
  if (!user) return c.body(null, 401)
  const body = await c.req.parseBody()
  const prayer = String(body.prayer ?? '')
  const date = String(body.date ?? '')
  const timezone = getCookie(c, 'timezone') ?? 'UTC'
  const todayDate = today(timezone)
  const valid = prayerKeys.includes(prayer as (typeof prayerKeys)[number]) && /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= todayDate
  if (!valid) return c.body(null, 400)
  // Optional custom timestamp (from the long-press dialog), stored as ISO local time
  let loggedAt: string | null = null
  const datetime = String(body.datetime ?? '')
  if (datetime) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetime) || datetime.slice(0, 10) > todayDate) return c.body(null, 400)
    loggedAt = `${datetime}:00`
  }
  const existing = db.prepare('SELECT completed FROM prayer_logs WHERE user_id = ? AND date = ? AND prayer = ?').get(user.id, date, prayer) as { completed: number } | undefined
  if (existing) db.prepare('DELETE FROM prayer_logs WHERE user_id = ? AND date = ? AND prayer = ?').run(user.id, date, prayer)
  else db.prepare('INSERT INTO prayer_logs (user_id, date, prayer, completed, logged_at) VALUES (?, ?, ?, 1, ?)').run(user.id, date, prayer, loggedAt)
  const checked = !existing
  return c.html(renderPrayerCircle(prayer, date, dayLabelFor(date), checked, date === todayDate, false))
})

app.get('/health', (c) => c.json({ ok: true }))

const port = Number(process.env.PORT ?? 3000)
console.log(`My Amal listening on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
