export type Sex = 'female' | 'male';

export type ParentKey = 'mother' | 'father';

export type MethodId = 'khamisRoche' | 'midParental' | 'percentileProjection';

export type ReferenceId = 'cdc' | 'who';

/** What to do when one parent's height is unknown (brief §13.4, flagged for product review). */
export type UnknownParentMode = 'populationAverage' | 'disableParentMethods';

/** All heights in cm, weights in kg. Dates are ISO `YYYY-MM-DD` strings in local time. */
export interface PredictionInput {
  sex: Sex;
  birthDate: string;
  /** Date the height was measured. */
  measuredOn: string;
  heightCm: number;
  weightKg: number | null;
  motherHeightCm: number | null;
  fatherHeightCm: number | null;
}

export interface Prediction {
  method: MethodId;
  estimateCm: number;
  lowCm: number;
  highCm: number;
  /** Half-width of the range before any flooring, e.g. 5.3 or 8.5. */
  plusMinusCm: number;
  /** Human-readable inputs actually used, keyed by input name. */
  inputsUsed: Record<string, string>;
  citation: string;
  /** Machine-readable notes; the UI maps them to copy. */
  notes: PredictionNote[];
}

export type PredictionNote =
  | 'flooredAtCurrentHeight'
  | 'parentEstimated'
  | 'illustrativeRange'
  | 'differentReference';

export type FallbackReason =
  | 'none'
  | 'noWeight'
  | 'underFour'
  | 'overKhamisRocheAge'
  | 'coefficientsUnverified'
  | 'parentUnknownDisabled';

export interface PredictionSummary {
  ageYears: number;
  /** Methods valid for these inputs, lead method first. */
  predictions: Prediction[];
  lead: Prediction;
  /** Headline values (lead method, floored at today's height). */
  estimateCm: number;
  lowCm: number;
  highCm: number;
  /** Why Khamis–Roche is not the lead, if it is not. */
  fallback: FallbackReason;
  estimatedParent: ParentKey | null;
  /** Today's height-for-age on the chosen reference, if the age is covered. */
  today: { z: number; percentile: number; reference: ReferenceId } | null;
}
