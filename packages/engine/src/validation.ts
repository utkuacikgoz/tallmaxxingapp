import { z } from 'zod';

/** Hard ranges (brief §13.4). Values outside block Continue. */
export const RANGES = {
  ageYears: { min: 2, max: 22 },
  childHeightCm: { min: 60, max: 220 },
  weightKg: { min: 10, max: 200 },
  parentHeightCm: { min: 130, max: 230 },
  inches: { min: 0, max: 11 },
} as const;

/** Soft warning when height is more than this fraction from the typical height for age and sex. */
export const UNUSUAL_HEIGHT_FRACTION = 0.22;
/** Logged measurement dated today and more than this many cm below the latest entry. */
export const DROP_WARNING_CM = 2;

export type RangeKey = keyof typeof RANGES;

export type FieldStatus = 'empty' | 'valid' | 'tooLow' | 'tooHigh';

export function checkRange(value: number | null, key: Exclude<RangeKey, 'ageYears'>): FieldStatus {
  if (value == null || Number.isNaN(value)) return 'empty';
  const r = RANGES[key];
  if (value < r.min) return 'tooLow';
  if (value > r.max) return 'tooHigh';
  return 'valid';
}

/**
 * Errors show on blur/Return, or immediately when the value is far out of range (> 1.2 × max),
 * so a partial value like "1" for 152 never flashes an error while typing.
 */
export function shouldShowErrorWhileTyping(value: number | null, key: Exclude<RangeKey, 'ageYears'>): boolean {
  if (value == null) return false;
  return value > RANGES[key].max * 1.2;
}

export type AgeStatus = 'valid' | 'tooYoung' | 'tooOld';

export function checkAge(ageYears: number): AgeStatus {
  if (ageYears < RANGES.ageYears.min) return 'tooYoung';
  if (ageYears >= RANGES.ageYears.max) return 'tooOld';
  return 'valid';
}

export function isUnusualHeight(heightCm: number, typicalCm: number | null): boolean {
  if (typicalCm == null) return false;
  return Math.abs(heightCm - typicalCm) / typicalCm > UNUSUAL_HEIGHT_FRACTION;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const sex = z.enum(['female', 'male']);

export const childSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().max(40),
  avatarEmoji: z.string().max(16),
  sexAtBirth: sex,
  birthDate: isoDate,
  motherHeightCm: z.number().min(RANGES.parentHeightCm.min).max(RANGES.parentHeightCm.max).nullable(),
  fatherHeightCm: z.number().min(RANGES.parentHeightCm.min).max(RANGES.parentHeightCm.max).nullable(),
  parentHeightsSelfReported: z.boolean(),
  parentHeightEstimated: z.enum(['mother', 'father']).nullable(),
  sleepBand: z.enum(['lt7', '7-8', '8-9', '9+']).nullable(),
  pubertySigns: z.array(z.string()),
  primaryGoal: z.string().nullable(),
  bedtime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  createdAt: z.string(),
});

export const measurementSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  date: isoDate,
  heightCm: z.number().min(RANGES.childHeightCm.min).max(RANGES.childHeightCm.max),
  weightKg: z.number().min(RANGES.weightKg.min).max(RANGES.weightKg.max).nullable(),
  note: z.string().max(500).nullable(),
});

export const habitCheckSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  day: isoDate,
  habitKey: z.string().min(1),
  done: z.boolean(),
  isRestDay: z.boolean(),
});

/** Shape of "Export all data" files; also validates a future import. */
export const exportSchema = z.object({
  format: z.literal('tallsoon-export'),
  version: z.literal(1),
  exportedAt: z.string(),
  children: z.array(childSchema),
  measurements: z.array(measurementSchema),
  habitChecks: z.array(habitCheckSchema),
});

export type ChildRecord = z.infer<typeof childSchema>;
export type MeasurementRecord = z.infer<typeof measurementSchema>;
export type HabitCheckRecord = z.infer<typeof habitCheckSchema>;
export type ExportFile = z.infer<typeof exportSchema>;
