import { dayLabels } from "../dates.js";
import { prayers } from "../prayers.js";

export function renderPrayerCircle(
  prayer: string,
  date: string,
  dayLabel: string,
  checked: boolean,
  isQodo: boolean,
  isToday: boolean,
  disabled: boolean,
) {
  const circleClasses = [
    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition",
    checked ? "bg-amber-500 text-neutral-950" : "bg-neutral-800 text-transparent",
    isToday ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-neutral-900" : "",
    disabled && !checked ? "opacity-40" : "",
  ].filter(Boolean).join(" ");
  const attrs = disabled
    ? "disabled"
    : `hx-post="/habits/prayer" hx-vals='{"prayer":"${prayer}","date":"${date}"}' hx-swap="outerHTML"`;
  const icon = isQodo ? "!" : "&#10003;";
  const ariaLabel = `${prayer} ${date}${isQodo ? ", qodo" : ""}`;
  return `<button type="button" aria-label="${ariaLabel}" data-prayer="${prayer}" data-date="${date}" class="prayer-circle flex flex-col items-center gap-1.5 ${disabled ? "cursor-default" : "cursor-pointer"}" ${attrs}><span class="${circleClasses}">${checked ? icon : ""}</span><span class="text-[10px] font-medium uppercase tracking-wide text-neutral-500">${dayLabel}</span></button>`;
}

export function homePage(
  date: string,
  week: string[],
  completed: Record<string, Map<string, boolean>>,
  email: string,
) {
  const asUtc = new Date(`${date}T12:00:00Z`);
  const weekdayName = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" }).format(asUtc);
  const dateLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(asUtc);
  const cards = prayers.map(([key, label]) => {
    const doneSet = completed[key] ?? new Map<string, boolean>();
    const count = week.filter((d) => d <= date && doneSet.has(d)).length;
    const circles = week.map((d, i) => renderPrayerCircle(key, d, dayLabels[i], doneSet.has(d), doneSet.get(d) ?? false, d === date, d > date)).join("");
    return `<div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"><div class="flex items-center justify-between"><h3 class="font-medium text-neutral-100">${label}</h3><span class="text-xs text-neutral-500">${count}/7</span></div><div class="mt-4 flex justify-between">${circles}</div></div>`;
  }).join("");
  return `<div><div class="flex items-start justify-between"><div class="flex items-end gap-2"><h1 class="text-xl font-semibold text-neutral-50">${weekdayName}</h1><p class="text-sm text-neutral-500">${dateLabel}</p></div></div><div class="mt-6 space-y-3">${cards}</div></div>`;
}
