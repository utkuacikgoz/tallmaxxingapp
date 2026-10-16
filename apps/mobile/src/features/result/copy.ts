import {
  displayPercentile,
  formatFtIn,
  formatHeight,
  formatHeightRange,
  formatPlusMinus,
  ordinal,
  type HeightUnit,
  type Prediction,
  type PredictionSummary,
} from '@tallsoon/engine';

/** Puberty context line under the hero (brief §11.3), mirroring the approved prototype logic. */
export function pubertyKey(signs: string[], ageYears: number): 'adult' | 'late' | 'early' | 'none' | 'unknown' {
  const s = signs.filter((x) => x !== 'none' && x !== 'unsure');
  if (ageYears > 17) return 'adult';
  const late = s.includes('period') || s.includes('facialHair') || (s.includes('voice') && s.length >= 3);
  if (late) return 'late';
  if (s.length) return 'early';
  if (signs.includes('none')) return 'none';
  return 'unknown';
}

export function heroNumber(cm: number, unit: HeightUnit): { value: string; suffix: string } {
  if (unit === 'cm') return { value: String(Math.round(cm)), suffix: 'cm' };
  return { value: formatFtIn(cm), suffix: '' };
}

/** "5′ 9″ · likely 169–180 cm" (alt unit first, range in the user's unit). */
export function heroAlt(cm: number, unit: HeightUnit): string {
  return unit === 'cm' ? formatFtIn(cm) : formatHeight(cm, 'cm');
}

export function rangeText(s: Pick<PredictionSummary, 'lowCm' | 'highCm'>, unit: HeightUnit): string {
  return formatHeightRange(s.lowCm, s.highCm, unit);
}

export function methodValue(p: Prediction, unit: HeightUnit): string {
  return formatHeight(p.estimateCm, unit);
}

export function plusMinus(p: Prediction, unit: HeightUnit): string {
  return formatPlusMinus(p.plusMinusCm, unit);
}

export function percentileOrdinal(p: number): string {
  return ordinal(displayPercentile(p));
}
