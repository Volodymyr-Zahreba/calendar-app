import type { DayCellMeta, ISODate } from '../components/DateRangePicker/types'

// First day of week by locale: 0=Sunday, 1=Monday
const LOCALE_FIRST_DAY_OF_WEEK: Record<string, number> = {
  'en-US': 0,
  'en-CA': 0,
  'en-AU': 0,
  'zh-CN': 0,
  'ja-JP': 0,
  'ko-KR': 0,
  'ru': 1,
  'de': 1,
  'fr': 1,
  'es': 1,
  'it': 1,
  'pl': 1,
  'nl': 1,
  'pt': 1,
  'sv': 1,
  'fi': 1,
  'da': 1,
  'nb': 1,
  'cs': 1,
  'hu': 1,
  'ro': 1,
  'tr': 1,
  'uk': 1,
}

export function getFirstDayOfWeek(locale: string): number {
  // Try exact match
  if (locale in LOCALE_FIRST_DAY_OF_WEEK) {
    return LOCALE_FIRST_DAY_OF_WEEK[locale]
  }
  // Try language tag prefix (e.g. 'en-GB' -> 'en')
  const lang = locale.split('-')[0]
  if (lang in LOCALE_FIRST_DAY_OF_WEEK) {
    return LOCALE_FIRST_DAY_OF_WEEK[lang]
  }
  return 1 // default Monday
}

/**
 * Returns a 6x7 grid of DayCellMeta for the given year/month.
 * DST-safe: uses getFullYear/getMonth/getDate and new Date(y, m, d).
 */
export function monthGrid(
  year: number,
  month: number, // 0-indexed
  firstDayOfWeek: number,
  minDate?: Date,
  maxDate?: Date,
): DayCellMeta[] {
  if (year < 1900) {
    throw new Error('monthGrid: year must be >= 1900')
  }

  const cells: DayCellMeta[] = []

  // First day of the displayed month
  const firstOfMonth = new Date(year, month, 1)
  const firstDow = firstOfMonth.getDay() // 0=Sun, 6=Sat

  // How many days from the previous month we need to show
  let offset = (firstDow - firstDayOfWeek + 7) % 7

  // Start date of the grid
  const gridStart = new Date(year, month, 1 - offset)

  for (let i = 0; i < 42; i++) {
    const d = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    )
    const inCurrentMonth = d.getMonth() === month && d.getFullYear() === year
    let isDisabled = false
    if (minDate) {
      const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      if (d < min) isDisabled = true
    }
    if (maxDate) {
      const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      if (d > max) isDisabled = true
    }
    cells.push({
      date: d,
      iso: toISO(d),
      inCurrentMonth,
      isDisabled,
    })
  }

  return cells
}

export function addMonths(date: Date, delta: number): Date {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  // Create new date at the 1st to avoid day overflow, then set date clamped
  const target = new Date(y, m + delta, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d, lastDay))
}

export function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isInRange(d: Date, start: Date, end: Date): boolean {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return day >= s && day <= e
}

export function toISO(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
