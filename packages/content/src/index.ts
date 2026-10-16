import type { Aisle, AgeBand, Copy, Habit, Meal, SeasonalPack, Tip } from './types';
import { habits } from './habits';
import { meals } from './meals';
import { seasonalPacks } from './seasonal';
import { tips } from './tips';

export * from './types';
export * from './habits';
export * from './routines';
export * from './meals';
export * from './tips';
export * from './plan';
export * from './guides';
export * from './notifications';
export * from './seasonal';

/** Maps an age in years (whole or fractional) to its band. Callers keep ages within 2–21. */
export function ageBandFor(ageYears: number): AgeBand {
  if (ageYears < 6) return '2-5';
  if (ageYears < 9) return '6-8';
  if (ageYears < 13) return '9-12';
  if (ageYears < 18) return '13-17';
  return '18-21';
}

/** Picks the parent or teen wording and fills {placeholders}. Unknown placeholders are left as written. */
export function resolveCopy(
  copy: Copy,
  audience: 'parent' | 'teen',
  vars: Record<string, string> = {},
): string {
  const text = typeof copy === 'string' ? copy : copy[audience];
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : value;
  });
}

function dayNumber(dateIso: string): number {
  const [y, m, d] = dateIso.slice(0, 10).split('-').map(Number);
  return Math.floor(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) / 86_400_000);
}

function dayOfYear(dateIso: string): number {
  const y = Number(dateIso.slice(0, 4));
  return dayNumber(dateIso) - Math.floor(Date.UTC(y, 0, 1) / 86_400_000);
}

const SLOTS: Habit['slot'][] = ['move', 'sleep', 'food', 'outside', 'water'];

/** Exactly 5 habits, one per slot in order move, sleep, food, outside, water. Same inputs, same output. */
export function habitsForDay(band: AgeBand, dateIso: string): Habit[] {
  const doy = dayOfYear(dateIso);
  const out: Habit[] = [];
  for (const slot of SLOTS) {
    const pool = habits.filter((h) => h.slot === slot && h.bands.includes(band));
    const fallback = habits.filter((h) => h.slot === slot);
    const list = pool.length > 0 ? pool : fallback;
    const pick = list[((doy % list.length) + list.length) % list.length];
    if (pick) out.push(pick);
  }
  return out;
}

function pickRotating(pool: Meal[], offset: number, count: number): Meal[] {
  if (pool.length === 0) return [];
  const out: Meal[] = [];
  for (let n = 0; n < count; n++) {
    const meal = pool[(((offset + n) % pool.length) + pool.length) % pool.length];
    if (meal) out.push(meal);
  }
  return out;
}

/** 7 breakfasts and 7 dinners for the week, interleaved breakfast, dinner. Pools smaller than 7 repeat. */
export function mealsForWeek(
  _band: AgeBand,
  weekStartIso: string,
  filters: { vegetarian?: boolean; dairyFree?: boolean } = {},
): Meal[] {
  const allowed = (m: Meal) =>
    (!filters.vegetarian || m.tags.includes('vegetarian')) &&
    (!filters.dairyFree || m.tags.includes('dairyFree'));
  const week = Math.floor(dayNumber(weekStartIso) / 7);
  const breakfasts = pickRotating(meals.filter((m) => m.slot === 'breakfast' && allowed(m)), week * 7, 7);
  const dinners = pickRotating(meals.filter((m) => m.slot === 'dinner' && allowed(m)), week * 7, 7);
  const out: Meal[] = [];
  for (let n = 0; n < 7; n++) {
    const b = breakfasts[n];
    const d = dinners[n];
    if (b) out.push(b);
    if (d) out.push(d);
  }
  return out;
}

const AISLE_ORDER: Aisle[] = ['produce', 'bakery', 'dairy', 'protein', 'frozen', 'pantry'];

/** Merges ingredients by item name (case-insensitive). `count` is how many of the meals use the item. */
export function groceryList(
  mealList: Meal[],
): Array<{ aisle: Aisle; items: Array<{ item: string; count: number }> }> {
  const byAisle = new Map<Aisle, Map<string, { item: string; count: number }>>();
  for (const meal of mealList) {
    for (const ing of meal.ingredients) {
      let aisle = byAisle.get(ing.aisle);
      if (!aisle) {
        aisle = new Map();
        byAisle.set(ing.aisle, aisle);
      }
      const k = ing.item.trim().toLowerCase();
      const existing = aisle.get(k);
      if (existing) existing.count += 1;
      else aisle.set(k, { item: ing.item.trim(), count: 1 });
    }
  }
  return AISLE_ORDER.filter((a) => byAisle.has(a)).map((aisle) => ({
    aisle,
    items: [...(byAisle.get(aisle)?.values() ?? [])].sort((a, b) => a.item.localeCompare(b.item)),
  }));
}

/** The seasonal pack for the month of `dateIso`, or null in months without one (March, October). */
export function currentSeasonalPack(dateIso: string): SeasonalPack | null {
  const month = Number(dateIso.slice(5, 7));
  return seasonalPacks.find((p) => p.months.includes(month)) ?? null;
}

/** One "Why it matters" tip per day, rotating through the whole set. */
export function tipForDay(dateIso: string): Tip {
  const n = dayNumber(dateIso);
  const tip = tips[((n % tips.length) + tips.length) % tips.length];
  if (!tip) throw new Error('No tips available');
  return tip;
}
