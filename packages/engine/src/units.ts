export const CM_PER_IN = 2.54;
export const KG_PER_LB = 0.45359237;

export type HeightUnit = 'cm' | 'ftin';
export type WeightUnit = 'kg' | 'lb';

export const cmToIn = (cm: number): number => cm / CM_PER_IN;
export const inToCm = (inches: number): number => inches * CM_PER_IN;
export const kgToLb = (kg: number): number => kg / KG_PER_LB;
export const lbToKg = (lb: number): number => lb * KG_PER_LB;

export interface FeetInches {
  feet: number;
  inches: number;
}

/** Splits a height into feet and inches, rounding inches to `step` (1 for fields, 0.5 for display). */
export function cmToFtIn(cm: number, step = 1): FeetInches {
  const total = Math.round(cmToIn(cm) / step) * step;
  let feet = Math.floor(total / 12);
  let inches = total - feet * 12;
  if (inches >= 12 - 1e-9) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches: Math.round(inches * 10) / 10 };
}

export const ftInToCm = (feet: number, inches: number): number => inToCm(feet * 12 + inches);

/** Accepts "." and "," as decimal separators; strips anything else. Returns null for empty/invalid. */
export function parseDecimal(raw: string): number | null {
  const cleaned = sanitizeDecimal(raw).replace(',', '.');
  if (cleaned === '' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Keeps digits and a single decimal separator, as the user types. */
export function sanitizeDecimal(raw: string, maxDecimals = 1): string {
  let out = '';
  let seenSep = false;
  let decimals = 0;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      if (seenSep) {
        if (decimals >= maxDecimals) continue;
        decimals += 1;
      }
      out += ch;
    } else if ((ch === '.' || ch === ',') && !seenSep && maxDecimals > 0) {
      seenSep = true;
      out += ch;
    }
  }
  return out;
}

/** Whole cm for display. */
export const roundCm = (cm: number): number => Math.round(cm);

function fraction(inches: number): string {
  const whole = Math.floor(inches);
  return inches - whole >= 0.5 ? `${whole}½` : `${whole}`;
}

/** "5′ 8½″" (display rounds to the nearest half inch). */
export function formatFtIn(cm: number): string {
  const { feet, inches } = cmToFtIn(cm, 0.5);
  return `${feet}′ ${fraction(inches)}″`;
}

export function formatHeight(cm: number, unit: HeightUnit): string {
  return unit === 'cm' ? `${roundCm(cm)} cm` : formatFtIn(cm);
}

/** "169–180 cm" or "5′ 6½″–5′ 11″". */
export function formatHeightRange(lowCm: number, highCm: number, unit: HeightUnit): string {
  if (unit === 'cm') return `${roundCm(lowCm)}–${roundCm(highCm)} cm`;
  return `${formatFtIn(lowCm)}–${formatFtIn(highCm)}`;
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  return unit === 'kg' ? `${Math.round(kg * 10) / 10} kg` : `${Math.round(kgToLb(kg))} lb`;
}

/** A ± half-width in the given unit: "±5.3 cm" / "±2.1 in". */
export function formatPlusMinus(cm: number, unit: HeightUnit): string {
  return unit === 'cm' ? `±${cm.toFixed(1)} cm` : `±${cmToIn(cm).toFixed(1)} in`;
}
