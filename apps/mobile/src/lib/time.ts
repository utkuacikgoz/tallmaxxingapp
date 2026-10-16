/** "21:30" → "9:30 PM" (or "21:30") in the device's locale. */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return new Date(2020, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "2026-10-16" → "October 16". */
export function formatDayMonth(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

/** "2026-10-16" → "Oct 16, 2026". */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "2013-05-15" → "May 2013" (birth dates store day 15 when only month/year is known). */
export function formatMonthYear(iso: string): string {
  const [y, m] = iso.split('-').map(Number) as [number, number];
  return new Date(y, m - 1, 15).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
