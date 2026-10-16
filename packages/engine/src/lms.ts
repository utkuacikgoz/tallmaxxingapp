import type { ReferenceId, Sex } from './types';

/** One row of an LMS table: [age in months, L, M, S]. */
export type LmsRow = readonly [number, number, number, number];

export interface LmsTableJson {
  id: string;
  name: string;
  male: LmsRow[];
  female: LmsRow[];
}

export interface Lms {
  L: number;
  M: number;
  S: number;
}

export interface GrowthReference {
  id: ReferenceId;
  name: string;
  /** Short label for UI, e.g. "CDC". */
  label: string;
  minMonths: number;
  maxMonths: number;
  /** Age (months) at which the reference treats height as adult; used for projection. */
  adultMonths: number;
  lmsAt(sex: Sex, ageMonths: number): Lms | null;
}

export function createReference(
  id: ReferenceId,
  label: string,
  json: LmsTableJson,
  adultMonths: number,
): GrowthReference {
  const tables: Record<Sex, LmsRow[]> = {
    male: [...json.male].sort((a, b) => a[0] - b[0]),
    female: [...json.female].sort((a, b) => a[0] - b[0]),
  };
  const first = tables.male[0];
  const last = tables.male[tables.male.length - 1];
  if (!first || !last) throw new Error(`Empty LMS table: ${json.id}`);
  const minMonths = first[0];
  const maxMonths = last[0];

  return {
    id,
    name: json.name,
    label,
    minMonths,
    maxMonths,
    adultMonths: Math.min(adultMonths, maxMonths),
    lmsAt(sex, ageMonths) {
      const rows = tables[sex];
      if (ageMonths < minMonths || ageMonths > maxMonths) return null;
      // Binary search for the bracketing rows, then interpolate linearly.
      let lo = 0;
      let hi = rows.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if ((rows[mid] as LmsRow)[0] <= ageMonths) lo = mid;
        else hi = mid;
      }
      const a = rows[lo] as LmsRow;
      const b = rows[hi] as LmsRow;
      if (a[0] === b[0] || ageMonths <= a[0]) return { L: a[1], M: a[2], S: a[3] };
      if (ageMonths >= b[0]) return { L: b[1], M: b[2], S: b[3] };
      const t = (ageMonths - a[0]) / (b[0] - a[0]);
      return {
        L: a[1] + (b[1] - a[1]) * t,
        M: a[2] + (b[2] - a[2]) * t,
        S: a[3] + (b[3] - a[3]) * t,
      };
    },
  };
}

/** z = ((X/M)^L − 1) / (L·S), or ln(X/M)/S when L = 0. */
export function zFromLms(x: number, { L, M, S }: Lms): number {
  if (Math.abs(L) < 1e-9) return Math.log(x / M) / S;
  return (Math.pow(x / M, L) - 1) / (L * S);
}

/** X = M·(1 + L·S·z)^(1/L), or M·exp(S·z) when L = 0. */
export function valueFromLms(z: number, { L, M, S }: Lms): number {
  if (Math.abs(L) < 1e-9) return M * Math.exp(S * z);
  return M * Math.pow(1 + L * S * z, 1 / L);
}

/** Standard normal CDF (Hart / West 2005 double-precision approximation). */
export function normalCdf(z: number): number {
  const x = Math.abs(z);
  let c: number;
  if (x > 37) {
    c = 0;
  } else {
    const e = Math.exp((-x * x) / 2);
    if (x < 7.07106781186547) {
      let n = 3.52624965998911e-2 * x + 0.700383064443688;
      n = n * x + 6.37396220353165;
      n = n * x + 33.912866078383;
      n = n * x + 112.079291497871;
      n = n * x + 221.213596169931;
      n = n * x + 220.206867912376;
      let d = 8.83883476483184e-2 * x + 1.75566716318264;
      d = d * x + 16.064177579207;
      d = d * x + 86.7807322029461;
      d = d * x + 296.564248779674;
      d = d * x + 637.333633378831;
      d = d * x + 793.826512519948;
      d = d * x + 440.413735824752;
      c = (e * n) / d;
    } else {
      let d = x + 0.65;
      d = x + 4 / d;
      d = x + 3 / d;
      d = x + 2 / d;
      d = x + 1 / d;
      c = e / d / 2.506628274631;
    }
  }
  return z > 0 ? 1 - c : c;
}

/** Inverse standard normal CDF (Acklam's algorithm, |error| < 1.2e-9). */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  const [a0, a1, a2, a3, a4, a5] = a as [number, number, number, number, number, number];
  const [b0, b1, b2, b3, b4] = b as [number, number, number, number, number];
  const [c0, c1, c2, c3, c4, c5] = c as [number, number, number, number, number, number];
  const [d0, d1, d2, d3] = d as [number, number, number, number];
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1);
  }
  if (p > 1 - pl) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a0 * r + a1) * r + a2) * r + a3) * r + a4) * r + a5) * q) / (((((b0 * r + b1) * r + b2) * r + b3) * r + b4) * r + 1);
}

export interface HeightForAge {
  z: number;
  /** 0–100 */
  percentile: number;
}

export function heightForAge(ref: GrowthReference, sex: Sex, ageMonths: number, heightCm: number): HeightForAge | null {
  const lms = ref.lmsAt(sex, ageMonths);
  if (!lms) return null;
  const z = zFromLms(heightCm, lms);
  return { z, percentile: normalCdf(z) * 100 };
}

/** Height at a given percentile (0–100) and age. */
export function heightAtPercentile(ref: GrowthReference, sex: Sex, ageMonths: number, percentile: number): number | null {
  const lms = ref.lmsAt(sex, ageMonths);
  if (!lms) return null;
  return valueFromLms(normalQuantile(percentile / 100), lms);
}

/** Median (P50) height, used for the "unusual for their age" soft warning. */
export function typicalHeight(ref: GrowthReference, sex: Sex, ageMonths: number): number | null {
  return ref.lmsAt(sex, ageMonths)?.M ?? null;
}

/** Percentile shown to people: 1st–99th, never 0 or 100. */
export function displayPercentile(p: number): number {
  return Math.min(99, Math.max(1, Math.round(p)));
}

/** "1st", "2nd", "64th", "11th"… */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
