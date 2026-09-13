export const prayers = [
  ['subuh', 'Subuh'],
  ['dzuhur', 'Dzuhur'],
  ['ashar', 'Ashar'],
  ['maghrib', 'Maghrib'],
  ['isya', 'Isya'],
] as const

export type PrayerKey = (typeof prayers)[number][0]

export const prayerKeys = prayers.map(([key]) => key)
