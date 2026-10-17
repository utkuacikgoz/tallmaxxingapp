import { ageInMonths } from './age';
import type { GrowthReference } from './lms';
import { heightForAge, valueFromLms, zFromLms } from './lms';
import type { Engine } from './predict';
import type { PredictionSummary, ReferenceId, Sex } from './types';
import { compareMeasurementsAscending } from './measurement-order';

/** Points are [ageYears, heightCm]. */
export type XY = readonly [number, number];

export interface ChartPoint {
  date: string;
  ageYears: number;
  heightCm: number;
  percentile: number | null;
  z: number | null;
}

export interface GrowthChartData {
  reference: ReferenceId;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  percentiles: Array<{ p: number; points: XY[] }>;
  measurements: ChartPoint[];
  projection: XY[];
  bandUpper: XY[];
  bandLower: XY[];
  estimateCm: number | null;
  xTicks: number[];
  yTicks: number[];
}

export const CHART_PERCENTILES = [3, 10, 25, 50, 75, 90, 97] as const;

const Z_FOR: Record<number, number> = { 3: -1.880794, 10: -1.281552, 25: -0.67449, 50: 0, 75: 0.67449, 90: 1.281552, 97: 1.880794 };

function niceStep(range: number): number {
  if (range <= 30) return 5;
  if (range <= 70) return 10;
  return 20;
}

/**
 * Everything a growth chart needs, in data units, so the app (SVG) and the PDF draw the same thing:
 * CDC/WHO percentile curves, the child's points, and a dashed projection to the predicted adult
 * height with its likely-range band. The projection eases from today's z-score to the z-score of
 * the prediction (and of its low/high bounds) at adult age, so it follows the shape of real curves.
 */
export function buildGrowthChart(opts: {
  engine: Engine;
  sex: Sex;
  birthDate: string;
  reference: ReferenceId;
  measurements: ReadonlyArray<{ date: string; heightCm: number; sequence?: number }>;
  summary: PredictionSummary | null;
}): GrowthChartData | null {
  const sorted = [...opts.measurements].sort(compareMeasurementsAscending);
  const last = sorted[sorted.length - 1];
  if (!last) return null;
  const ageAt = (date: string) => ageInMonths(opts.birthDate, date) / 12;
  const lastAge = ageAt(last.date);
  const ref: GrowthReference | null = opts.engine.referenceFor(opts.reference, lastAge * 12);
  if (!ref) return null;

  const refMinY = ref.minMonths / 12;
  const adultAge = ref.adultMonths / 12;
  const firstAge = ageAt(sorted[0]!.date);
  const xMin = Math.max(refMinY, Math.floor(Math.min(firstAge, lastAge) - 1));
  const xMax = adultAge;

  const step = 0.25;
  const ages: number[] = [];
  for (let a = xMin; a <= xMax + 1e-9; a += step) ages.push(Math.min(a, xMax));

  const percentiles = CHART_PERCENTILES.map((p) => ({
    p,
    points: ages
      .map((a) => {
        const lms = ref.lmsAt(opts.sex, a * 12);
        return lms ? ([a, valueFromLms(Z_FOR[p] as number, lms)] as XY) : null;
      })
      .filter((v): v is XY => v != null),
  }));

  const measurements: ChartPoint[] = sorted.map((m) => {
    const age = ageAt(m.date);
    const hfa = heightForAge(ref, opts.sex, age * 12, m.heightCm);
    return { date: m.date, ageYears: age, heightCm: m.heightCm, percentile: hfa ? hfa.percentile : null, z: hfa ? hfa.z : null };
  });

  // Projection from the latest point to adult age.
  let projection: XY[] = [];
  let bandUpper: XY[] = [];
  let bandLower: XY[] = [];
  const s = opts.summary;
  const adultLms = ref.lmsAt(opts.sex, ref.adultMonths);
  const lastLms = ref.lmsAt(opts.sex, lastAge * 12);
  if (s && adultLms && lastLms && lastAge < adultAge) {
    const z0 = zFromLms(last.heightCm, lastLms);
    const zEst = zFromLms(s.estimateCm, adultLms);
    const zLow = zFromLms(s.lowCm, adultLms);
    const zHigh = zFromLms(s.highCm, adultLms);
    const span = adultAge - lastAge;
    const path = (zEnd: number): XY[] => {
      const out: XY[] = [];
      const n = Math.max(2, Math.ceil(span / (step / 2)));
      for (let i = 0; i <= n; i += 1) {
        const a = lastAge + (span * i) / n;
        const tt = i / n;
        const ease = tt * tt * (3 - 2 * tt);
        const lms = ref.lmsAt(opts.sex, Math.min(a, adultAge) * 12);
        if (!lms) continue;
        const v = valueFromLms(z0 + (zEnd - z0) * ease, lms);
        out.push([Math.min(a, adultAge), Math.max(last.heightCm, v)]);
      }
      return out.filter((p) => p[0] <= xMax + 1e-9);
    };
    projection = path(zEst);
    bandUpper = path(zHigh);
    bandLower = path(zLow);
  }

  const ys = [
    ...measurements.map((m) => m.heightCm),
    ...projection.map((p) => p[1]),
    ...bandUpper.map((p) => p[1]),
    ...(percentiles[0]?.points.map((p) => p[1]) ?? []),
    ...(percentiles[percentiles.length - 1]?.points.map((p) => p[1]) ?? []),
  ];
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const ystep = niceStep(hi - lo);
  const yMin = Math.floor((lo - 2) / ystep) * ystep;
  const yMax = Math.ceil((hi + 2) / ystep) * ystep;
  const yTicks: number[] = [];
  for (let y = yMin; y <= yMax; y += ystep) yTicks.push(y);
  const xTicks: number[] = [];
  const xstep = xMax - xMin > 8 ? 4 : 2;
  for (let x = Math.ceil(xMin / xstep) * xstep; x <= xMax; x += xstep) xTicks.push(x);

  return {
    reference: ref.id,
    xMin,
    xMax,
    yMin,
    yMax,
    percentiles,
    measurements,
    projection,
    bandUpper,
    bandLower,
    estimateCm: s ? s.estimateCm : null,
    xTicks,
    yTicks,
  };
}
