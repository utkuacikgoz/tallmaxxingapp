import { ageInMonths, ageInYears, daysBetween, parseIsoDate } from './age';
import type { Engine, PredictOptions } from './predict';
import type { ReferenceId, Sex } from './types';
import { compareMeasurementsAscending } from './measurement-order';

export interface MeasurementPoint {
  date: string;
  heightCm: number;
  weightKg: number | null;
  sequence?: number;
}

/** Minimum gap between two measurements before velocity is meaningful (≈ 3 months). */
export const MIN_VELOCITY_GAP_DAYS = 91;

export type VelocityStatus = 'typical' | 'fast' | 'slow';

export interface Velocity {
  cmPerYear: number;
  fromDate: string;
  toDate: string;
  /** Slope of the reference median over the same interval. */
  typicalCmPerYear: number;
  status: VelocityStatus;
  reference: ReferenceId;
}

/**
 * Growth speed between the latest measurement and the most recent one at least 3 months earlier.
 * Bands are a simple screen against the reference median slope, not a diagnosis
 * (thresholds <!-- REVIEW --> by a pediatric professional, see DECISIONS.md).
 */
export function growthVelocity(
  engine: Engine,
  points: readonly MeasurementPoint[],
  birthDate: string,
  sex: Sex,
  reference: ReferenceId,
): Velocity | null {
  if (points.length < 2) return null;
  const sorted = [...points].sort(compareMeasurementsAscending);
  const latest = sorted[sorted.length - 1] as MeasurementPoint;
  let earlier: MeasurementPoint | null = null;
  for (let i = sorted.length - 2; i >= 0; i -= 1) {
    const p = sorted[i] as MeasurementPoint;
    if (daysBetween(p.date, latest.date) >= MIN_VELOCITY_GAP_DAYS) {
      earlier = p;
      break;
    }
  }
  if (!earlier) return null;

  const years = daysBetween(earlier.date, latest.date) / 365.2425;
  const cmPerYear = (latest.heightCm - earlier.heightCm) / years;
  const m1 = ageInMonths(birthDate, earlier.date);
  const m2 = ageInMonths(birthDate, latest.date);
  const ref = engine.referenceFor(reference, m1) ?? engine.referenceFor(reference, m2);
  if (!ref) return null;
  const a = ref.lmsAt(sex, Math.max(ref.minMonths, m1));
  const b = ref.lmsAt(sex, Math.min(ref.maxMonths, m2));
  if (!a || !b) return null;
  const typical = Math.max(0, (b.M - a.M) / years);

  const age = ageInYears(birthDate, latest.date);
  let status: VelocityStatus = 'typical';
  if (age >= 8 && age <= 17 && cmPerYear >= Math.max(typical * 1.5, typical + 2)) status = 'fast';
  else if (typical >= 2 && cmPerYear < typical * 0.5) status = 'slow';

  return { cmPerYear, fromDate: earlier.date, toDate: latest.date, typicalCmPerYear: typical, status, reference: ref.id };
}

export interface HistoryPoint {
  date: string;
  estimateCm: number;
  lowCm: number;
  highCm: number;
}

/** Recomputes the headline prediction at every measurement, so parents see it narrow or shift. */
export function predictionHistory(
  engine: Engine,
  child: { sex: Sex; birthDate: string; motherHeightCm: number | null; fatherHeightCm: number | null },
  points: readonly MeasurementPoint[],
  options: PredictOptions,
): HistoryPoint[] {
  const sorted = [...points].sort(compareMeasurementsAscending);
  let lastWeight: number | null = null;
  const out: HistoryPoint[] = [];
  for (const p of sorted) {
    // Weight carries forward from the most recent measurement that had one.
    if (p.weightKg != null) lastWeight = p.weightKg;
    const weight = lastWeight;
    try {
      const s = engine.predict(
        {
          sex: child.sex,
          birthDate: child.birthDate,
          measuredOn: p.date,
          heightCm: p.heightCm,
          weightKg: weight,
          motherHeightCm: child.motherHeightCm,
          fatherHeightCm: child.fatherHeightCm,
        },
        options,
      );
      out.push({ date: p.date, estimateCm: s.estimateCm, lowCm: s.lowCm, highCm: s.highCm });
    } catch {
      // Out-of-range historic rows are skipped rather than crashing the chart.
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Habits: streaks and the weekly Growth Habits Score (brief §12.2–12.4)
// ---------------------------------------------------------------------------------------------

/** Items a day needs to count toward the streak. */
export const STREAK_MIN_ITEMS = 3;

export type HabitCategory = 'sleep' | 'activity' | 'nutrition' | 'posture' | 'daylight' | 'hydration';

export interface DayLog {
  day: string;
  /** Number of habits ticked that day. */
  done: number;
  /** Categories ticked that day. */
  categories: readonly HabitCategory[];
}

/** Monday-based week key, e.g. the ISO date of that week's Monday. */
export function weekKey(iso: string): string {
  const t = parseIsoDate(iso);
  const dow = (new Date(t).getUTCDay() + 6) % 7; // Monday = 0
  return new Date(t - dow * 86_400_000).toISOString().slice(0, 10);
}

export interface StreakResult {
  current: number;
  best: number;
  /** Days the automatic weekly rest day covered. */
  restDays: string[];
}

/**
 * A day counts when ≥ 3 items are done. The first missed day in each Monday–Sunday week is covered
 * by an automatic rest day, so one off day never breaks a streak. Today never breaks it (it is still
 * in progress). `bestEver` lets callers keep the best streak even if history is trimmed.
 */
export function computeStreak(logs: readonly DayLog[], today: string, bestEver = 0): StreakResult {
  const byDay = new Map(logs.map((l) => [l.day, l]));
  const first = logs.reduce<string | null>((min, l) => (min == null || l.day < min ? l.day : min), null);
  if (!first) return { current: 0, best: bestEver, restDays: [] };

  let current = 0;
  let best = bestEver;
  const restUsed = new Set<string>();
  const restDays: string[] = [];
  const total = daysBetween(first, today);
  for (let i = 0; i <= total; i += 1) {
    const day = new Date(parseIsoDate(first) + i * 86_400_000).toISOString().slice(0, 10);
    const done = (byDay.get(day)?.done ?? 0) >= STREAK_MIN_ITEMS;
    if (done) {
      current += 1;
      best = Math.max(best, current);
    } else if (day === today) {
      // Still time today.
    } else if (current > 0 && !restUsed.has(weekKey(day))) {
      restUsed.add(weekKey(day));
      restDays.push(day);
    } else {
      current = 0;
    }
  }
  return { current, best, restDays };
}

export interface HabitScore {
  /** 0–100 */
  score: number;
  parts: { sleep: number; activity: number; nutrition: number; consistency: number };
  weakest: 'sleep' | 'activity' | 'nutrition' | 'consistency';
}

export const HABIT_SCORE_WEIGHTS = { sleep: 0.35, activity: 0.3, nutrition: 0.25, consistency: 0.1 } as const;

/**
 * Growth Habits Score over the 7 days ending `endDay`: how well the habits that support growth went.
 * Measures habits only; it never predicts height. Rest days are left out of the denominator.
 */
export function habitScore(logs: readonly DayLog[], endDay: string, restDays: readonly string[] = []): HabitScore {
  const byDay = new Map(logs.map((l) => [l.day, l]));
  const rest = new Set(restDays);
  let counted = 0;
  const hits = { sleep: 0, activity: 0, nutrition: 0, consistency: 0 };
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(parseIsoDate(endDay) - i * 86_400_000).toISOString().slice(0, 10);
    if (rest.has(day)) continue;
    counted += 1;
    const log = byDay.get(day);
    if (!log) continue;
    if (log.categories.includes('sleep')) hits.sleep += 1;
    if (log.categories.includes('activity') || log.categories.includes('posture')) hits.activity += 1;
    if (log.categories.includes('nutrition')) hits.nutrition += 1;
    if (log.done >= STREAK_MIN_ITEMS) hits.consistency += 1;
  }
  const d = Math.max(1, counted);
  const parts = {
    sleep: hits.sleep / d,
    activity: hits.activity / d,
    nutrition: hits.nutrition / d,
    consistency: hits.consistency / d,
  };
  const score = Math.round(
    100 *
      (parts.sleep * HABIT_SCORE_WEIGHTS.sleep +
        parts.activity * HABIT_SCORE_WEIGHTS.activity +
        parts.nutrition * HABIT_SCORE_WEIGHTS.nutrition +
        parts.consistency * HABIT_SCORE_WEIGHTS.consistency),
  );
  const order = ['sleep', 'activity', 'nutrition', 'consistency'] as const;
  const weakest = order.reduce((w, k) => (parts[k] < parts[w] ? k : w), order[0]);
  return { score, parts, weakest };
}
