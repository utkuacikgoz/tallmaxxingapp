import { cmToIn, inToCm, kgToLb } from './units';
import type { GrowthReference } from './lms';
import { heightForAge, valueFromLms } from './lms';
import type { Prediction, Sex } from './types';

export const CITATIONS = {
  khamisRoche:
    'Khamis HJ, Roche AF. Predicting adult stature without using skeletal age: the Khamis–Roche method. Pediatrics. 1994;94(4 Pt 1):504–507. Erratum: Pediatrics. 1995;95(3):457.',
  midParental:
    'Tanner JM, Goldstein H, Whitehouse RH. Standards for children’s height at ages 2–9 years allowing for height of parents. Arch Dis Child. 1970;45:755–762.',
  cdc: 'Kuczmarski RJ et al. 2000 CDC Growth Charts for the United States: methods and development. Vital Health Stat 11. 2002;(246).',
  who: 'de Onis M et al. Development of a WHO growth reference for school-aged children and adolescents. Bull World Health Organ. 2007;85:660–667.',
} as const;

/** Average 90% error bounds reported for Khamis–Roche (cm). */
export const KR_BOUND_90_CM: Record<Sex, number> = { male: 5.3, female: 4.3 };
/** Average 50% error bounds reported for Khamis–Roche (cm). */
export const KR_BOUND_50_CM: Record<Sex, number> = { male: 2.2, female: 1.7 };
/** ≈ 2 SD target range for mid-parental height (Tanner 1970). */
export const MPH_BOUND_CM = 8.5;
/** Prototype assumption for one estimated parent, flagged for product review (brief §13.4). */
export const UNKNOWN_PARENT_WIDEN_CM = 3.5;
/** Percentile projection band: z ± 0.5, illustrative only. */
export const PROJECTION_Z_BAND = 0.5;

export const KR_MIN_AGE = 4;
export const KR_MAX_AGE = 17.5;
export const KR_MIN_SOURCES = 2;

export interface KhamisRocheCoefficients {
  sex: Sex;
  age: number;
  intercept: number;
  stature_coef: number;
  weight_coef: number;
  midparent_coef: number;
  verified_by_n_sources: number;
  source_urls: string[];
}

export type KhamisRocheLookup =
  | { ok: true; row: KhamisRocheCoefficients }
  | { ok: false; reason: 'outOfAgeRange' | 'unverified' };

/**
 * Nearest half-year row (documented choice, brief §5.4). Ages are valid from 4.0 to 17.5 inclusive.
 * Rows verified by fewer than two independent sources are refused.
 */
export function lookupKhamisRoche(rows: readonly KhamisRocheCoefficients[], sex: Sex, ageYears: number): KhamisRocheLookup {
  if (ageYears < KR_MIN_AGE || ageYears > KR_MAX_AGE) return { ok: false, reason: 'outOfAgeRange' };
  const rowAge = Math.min(KR_MAX_AGE, Math.max(KR_MIN_AGE, Math.round(ageYears * 2) / 2));
  const row = rows.find((r) => r.sex === sex && Math.abs(r.age - rowAge) < 1e-6);
  if (!row || row.verified_by_n_sources < KR_MIN_SOURCES) return { ok: false, reason: 'unverified' };
  return { ok: true, row };
}

export interface KhamisRocheWorked {
  row: KhamisRocheCoefficients;
  statureIn: number;
  weightLb: number;
  midparentIn: number;
  resultIn: number;
  resultCm: number;
}

export function khamisRocheWorked(row: KhamisRocheCoefficients, heightCm: number, weightKg: number, motherCm: number, fatherCm: number): KhamisRocheWorked {
  const statureIn = cmToIn(heightCm);
  const weightLb = kgToLb(weightKg);
  const midparentIn = (cmToIn(motherCm) + cmToIn(fatherCm)) / 2;
  const resultIn = row.intercept + row.stature_coef * statureIn + row.weight_coef * weightLb + row.midparent_coef * midparentIn;
  return { row, statureIn, weightLb, midparentIn, resultIn, resultCm: inToCm(resultIn) };
}

export function khamisRoche(opts: {
  row: KhamisRocheCoefficients;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  motherCm: number;
  fatherCm: number;
  parentEstimated: boolean;
}): Prediction {
  const worked = khamisRocheWorked(opts.row, opts.heightCm, opts.weightKg, opts.motherCm, opts.fatherCm);
  const plusMinus = KR_BOUND_90_CM[opts.sex] + (opts.parentEstimated ? UNKNOWN_PARENT_WIDEN_CM : 0);
  const notes: Prediction['notes'] = [];
  let estimate = worked.resultCm;
  if (estimate < opts.heightCm) {
    estimate = opts.heightCm;
    notes.push('flooredAtCurrentHeight');
  }
  if (opts.parentEstimated) notes.push('parentEstimated');
  return {
    method: 'khamisRoche',
    estimateCm: estimate,
    lowCm: Math.max(opts.heightCm, estimate - plusMinus),
    highCm: estimate + plusMinus,
    plusMinusCm: plusMinus,
    inputsUsed: {
      age: String(opts.row.age),
      heightCm: opts.heightCm.toFixed(1),
      weightKg: opts.weightKg.toFixed(1),
      motherCm: opts.motherCm.toFixed(1),
      fatherCm: opts.fatherCm.toFixed(1),
    },
    citation: CITATIONS.khamisRoche,
    notes,
  };
}

/** Boys: (father + mother + 13) / 2. Girls: (father + mother − 13) / 2. */
export function midParentalTargetCm(sex: Sex, motherCm: number, fatherCm: number): number {
  return (fatherCm + motherCm + (sex === 'male' ? 13 : -13)) / 2;
}

export function midParental(opts: { sex: Sex; motherCm: number; fatherCm: number; parentEstimated: boolean }): Prediction {
  const target = midParentalTargetCm(opts.sex, opts.motherCm, opts.fatherCm);
  const plusMinus = MPH_BOUND_CM + (opts.parentEstimated ? UNKNOWN_PARENT_WIDEN_CM : 0);
  return {
    method: 'midParental',
    estimateCm: target,
    lowCm: target - plusMinus,
    highCm: target + plusMinus,
    plusMinusCm: plusMinus,
    inputsUsed: { motherCm: opts.motherCm.toFixed(1), fatherCm: opts.fatherCm.toFixed(1) },
    citation: CITATIONS.midParental,
    notes: opts.parentEstimated ? ['parentEstimated'] : [],
  };
}

/** Keeps today's height-for-age z and reads it off at adult age (CDC: 20 y, WHO: 19 y). */
export function percentileProjection(opts: {
  ref: GrowthReference;
  sex: Sex;
  ageMonths: number;
  heightCm: number;
  differentReference: boolean;
}): Prediction | null {
  const today = heightForAge(opts.ref, opts.sex, opts.ageMonths, opts.heightCm);
  const adult = opts.ref.lmsAt(opts.sex, opts.ref.adultMonths);
  if (!today || !adult) return null;
  const estimate = Math.max(opts.heightCm, valueFromLms(today.z, adult));
  const low = Math.max(opts.heightCm, valueFromLms(today.z - PROJECTION_Z_BAND, adult));
  const high = Math.max(opts.heightCm, valueFromLms(today.z + PROJECTION_Z_BAND, adult));
  const notes: Prediction['notes'] = ['illustrativeRange'];
  if (opts.differentReference) notes.push('differentReference');
  return {
    method: 'percentileProjection',
    estimateCm: estimate,
    lowCm: low,
    highCm: high,
    plusMinusCm: (high - low) / 2,
    inputsUsed: { heightCm: opts.heightCm.toFixed(1), z: today.z.toFixed(2), reference: opts.ref.id },
    citation: opts.ref.id === 'cdc' ? CITATIONS.cdc : CITATIONS.who,
    notes,
  };
}
