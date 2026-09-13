export function today(timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  }
}

export function mondayOf(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00Z`)
  const dow = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dow)
  return d.toISOString().slice(0, 10)
}

export function weekDates(dateStr: string) {
  const monday = new Date(`${mondayOf(dateStr)}T12:00:00Z`)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setUTCDate(d.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function addDays(dateStr: string, delta: number) {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function daysInMonth(month: string) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

export function monthRange(month: string) {
  const days = daysInMonth(month)
  return { start: `${month}-01`, end: `${month}-${String(days).padStart(2, '0')}`, days }
}

export function currentMonth(timezone: string) {
  return today(timezone).slice(0, 7)
}

export const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function dayLabelFor(dateStr: string) {
  const dow = (new Date(`${dateStr}T12:00:00Z`).getUTCDay() + 6) % 7
  return dayLabels[dow]
}
