import { prayers } from '../prayers.js'

export function reportPage(month: string, rangeDays: number, counts: Record<string, number>) {
  const rows = prayers.map(([key, label]) => {
    const count = counts[key] ?? 0
    const pct = rangeDays ? Math.round((count / rangeDays) * 100) : 0
    return `<div>
      <span class="text-sm font-medium text-neutral-100">${label}</span>
      <div class="mt-1.5 flex items-center gap-3">
        <div class="h-2 flex-1 rounded-full bg-neutral-800">
          <div class="h-2 rounded-full bg-amber-500" style="width:${pct}%"></div>
        </div>
        <span class="shrink-0 text-xs font-medium text-white">${count}/${rangeDays} · ${pct}%</span>
      </div>
    </div>`
  }).join('')

  return `<div>
    <div class="flex items-start justify-between">
      <h1 class="text-xl font-semibold text-neutral-50">Report</h1>
      <form method="get" action="/report">
        <input type="month" name="month" value="${month}" onchange="this.form.submit()" class="[color-scheme:dark] rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100">
      </form>
    </div>
    <div class="mt-6 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">${rows}</div>
  </div>`
}
