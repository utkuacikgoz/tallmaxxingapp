const DAY_MS = 86_400_000;
const DAYS_PER_YEAR = 365.2425;

/** Parses `YYYY-MM-DD` as a UTC midnight timestamp so time zones and DST never shift ages. */
export function parseIsoDate(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Invalid ISO date: ${iso}`);
  return Date.UTC(y, m - 1, d);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Birth dates are stored with day 15 when only month and year are known (brief §13.4). */
export function birthDateFromMonthYear(year: number, month1to12: number): string {
  return `${year}-${String(month1to12).padStart(2, '0')}-15`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso) - parseIsoDate(fromIso)) / DAY_MS);
}

export function ageInYears(birthIso: string, atIso: string): number {
  return daysBetween(birthIso, atIso) / DAYS_PER_YEAR;
}

export function ageInMonths(birthIso: string, atIso: string): number {
  return ageInYears(birthIso, atIso) * 12;
}

/** Whole years and months, for "Age 13 years, 5 months". */
export function ageYearsMonths(birthIso: string, atIso: string): { years: number; months: number } {
  const [by, bm, bd] = birthIso.split('-').map(Number) as [number, number, number];
  const [ay, am, ad] = atIso.split('-').map(Number) as [number, number, number];
  let total = (ay - by) * 12 + (am - bm);
  if (ad < bd) total -= 1;
  total = Math.max(0, total);
  return { years: Math.floor(total / 12), months: total % 12 };
}

export function addDays(iso: string, days: number): string {
  const t = parseIsoDate(iso) + days * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}
