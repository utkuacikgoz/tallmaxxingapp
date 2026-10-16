import { ageInMonths, ageInYears } from './age';
import type { GrowthReference, LmsTableJson } from './lms';
import { createReference, heightForAge } from './lms';
import type { KhamisRocheCoefficients } from './methods';
import { khamisRoche, KR_MAX_AGE, KR_MIN_AGE, lookupKhamisRoche, midParental, percentileProjection } from './methods';
import type {
  FallbackReason,
  ParentKey,
  Prediction,
  PredictionInput,
  PredictionSummary,
  ReferenceId,
  UnknownParentMode,
} from './types';

export interface EngineData {
  cdc: LmsTableJson;
  who: LmsTableJson;
  khamisRoche: { rows: readonly KhamisRocheCoefficients[] };
  populationAdultHeightCm: Record<ParentKey, number>;
}

export interface PredictOptions {
  reference: ReferenceId;
  unknownParentMode: UnknownParentMode;
}

export interface Engine {
  references: Record<ReferenceId, GrowthReference>;
  predict(input: PredictionInput, options: PredictOptions): PredictionSummary;
  /** Reference to use for an age: the preferred one when it covers the age, else the other. */
  referenceFor(preferred: ReferenceId, ageMonths: number): GrowthReference | null;
  khamisRocheRows: readonly KhamisRocheCoefficients[];
  populationAdultHeightCm: Record<ParentKey, number>;
}

/** CDC 2000 projects to 20 y (240 months), WHO 2007 to 19 y (228 months). */
const CDC_ADULT_MONTHS = 240;
const WHO_ADULT_MONTHS = 228;

export function createEngine(data: EngineData): Engine {
  const references: Record<ReferenceId, GrowthReference> = {
    cdc: createReference('cdc', 'CDC', data.cdc, CDC_ADULT_MONTHS),
    who: createReference('who', 'WHO', data.who, WHO_ADULT_MONTHS),
  };

  function referenceFor(preferred: ReferenceId, ageMonths: number): GrowthReference | null {
    const covers = (r: GrowthReference) => ageMonths >= r.minMonths && ageMonths <= r.maxMonths;
    const first = references[preferred];
    if (covers(first)) return first;
    const other = references[preferred === 'cdc' ? 'who' : 'cdc'];
    return covers(other) ? other : null;
  }

  function predict(input: PredictionInput, options: PredictOptions): PredictionSummary {
    const ageYears = ageInYears(input.birthDate, input.measuredOn);
    const ageMonths = ageInMonths(input.birthDate, input.measuredOn);

    // Parent heights: at most one may be unknown (enforced by the UI and checked here).
    let estimatedParent: ParentKey | null = null;
    let mother = input.motherHeightCm;
    let father = input.fatherHeightCm;
    if (mother == null && father == null) throw new Error('At least one parent height is required');
    let parentMethodsAllowed = true;
    if (mother == null || father == null) {
      estimatedParent = mother == null ? 'mother' : 'father';
      if (options.unknownParentMode === 'populationAverage') {
        mother ??= data.populationAdultHeightCm.mother;
        father ??= data.populationAdultHeightCm.father;
      } else {
        parentMethodsAllowed = false;
      }
    }
    const parentEstimated = estimatedParent != null;

    const predictions: Prediction[] = [];
    let fallback: FallbackReason = 'none';

    // A. Khamis–Roche (ages 4.0–17.5, needs weight).
    let kr: Prediction | null = null;
    if (!parentMethodsAllowed) fallback = 'parentUnknownDisabled';
    else if (ageYears < KR_MIN_AGE) fallback = 'underFour';
    else if (ageYears > KR_MAX_AGE) fallback = 'overKhamisRocheAge';
    else if (input.weightKg == null) fallback = 'noWeight';
    else {
      const lookup = lookupKhamisRoche(data.khamisRoche.rows, input.sex, ageYears);
      if (lookup.ok && mother != null && father != null) {
        kr = khamisRoche({
          row: lookup.row,
          sex: input.sex,
          heightCm: input.heightCm,
          weightKg: input.weightKg,
          motherCm: mother,
          fatherCm: father,
          parentEstimated,
        });
      } else {
        fallback = 'coefficientsUnverified';
      }
    }

    // B. Mid-parental height.
    const mph =
      parentMethodsAllowed && mother != null && father != null
        ? midParental({ sex: input.sex, motherCm: mother, fatherCm: father, parentEstimated })
        : null;

    // C. Percentile projection (not under 4: brief §13.4 "Under 4, we use mid-parental height only").
    let projection: Prediction | null = null;
    if (ageYears >= KR_MIN_AGE || !mph) {
      const ref = referenceFor(options.reference, ageMonths);
      if (ref) {
        projection = percentileProjection({
          ref,
          sex: input.sex,
          ageMonths,
          heightCm: input.heightCm,
          differentReference: ref.id !== options.reference,
        });
      }
    }

    // Lead: KR when it runs; past 17.5 the projection (growth is nearly done); otherwise mid-parental.
    if (kr) predictions.push(kr);
    if (ageYears > KR_MAX_AGE && projection) {
      predictions.push(projection);
      if (mph) predictions.push(mph);
    } else {
      if (mph) predictions.push(mph);
      if (projection) predictions.push(projection);
    }

    const lead = predictions[0];
    if (!lead) throw new Error('No prediction method applies to these inputs');

    const floor = input.heightCm;
    const estimateCm = Math.max(floor, lead.estimateCm);
    const lowCm = Math.max(floor, lead.lowCm);
    const highCm = Math.max(estimateCm, lead.highCm);

    const todayRef = referenceFor(options.reference, ageMonths);
    const hfa = todayRef ? heightForAge(todayRef, input.sex, ageMonths, input.heightCm) : null;

    return {
      ageYears,
      predictions,
      lead,
      estimateCm,
      lowCm,
      highCm,
      fallback: kr ? 'none' : fallback,
      estimatedParent,
      today: hfa && todayRef ? { z: hfa.z, percentile: hfa.percentile, reference: todayRef.id } : null,
    };
  }

  return {
    references,
    predict,
    referenceFor,
    khamisRocheRows: data.khamisRoche.rows,
    populationAdultHeightCm: data.populationAdultHeightCm,
  };
}
