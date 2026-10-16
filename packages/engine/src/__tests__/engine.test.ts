import { khamisRoche as krJson } from '@tallsoon/reference';

import { addMonths, ageYearsMonths, birthDateFromMonthYear, ageInYears } from '../age';
import { heightForAge, normalCdf, normalQuantile, ordinal, valueFromLms, zFromLms, displayPercentile } from '../lms';
import {
  khamisRocheWorked,
  KR_BOUND_90_CM,
  lookupKhamisRoche,
  midParentalTargetCm,
  MPH_BOUND_CM,
  widenForEstimatedParent,
  type KhamisRocheCoefficients,
} from '../methods';
import { cmToFtIn, formatFtIn, formatHeightRange, ftInToCm, kgToLb, lbToKg, parseDecimal, sanitizeDecimal } from '../units';
import { checkAge, checkRange, isUnusualHeight, shouldShowErrorWhileTyping } from '../validation';
import { engine } from './helpers';

const rows = krJson.rows as unknown as KhamisRocheCoefficients[];

describe('units', () => {
  it('round-trips cm ↔ ft/in and kg ↔ lb', () => {
    expect(ftInToCm(5, 0)).toBeCloseTo(152.4, 6);
    expect(cmToFtIn(152)).toEqual({ feet: 5, inches: 0 });
    expect(cmToFtIn(182.88)).toEqual({ feet: 6, inches: 0 });
    expect(lbToKg(kgToLb(45.3))).toBeCloseTo(45.3, 9);
  });
  it('formats heights to the nearest half inch', () => {
    expect(formatFtIn(175.3)).toBe('5′ 9″');
    expect(formatFtIn(174.0)).toBe('5′ 8½″');
    expect(formatHeightRange(169.4, 180.6, 'cm')).toBe('169–181 cm');
  });
  it('accepts "." and "," and strips other characters', () => {
    expect(parseDecimal('152,5')).toBe(152.5);
    expect(parseDecimal('1a5b2')).toBe(152);
    expect(parseDecimal('')).toBeNull();
    expect(sanitizeDecimal('12.34.5')).toBe('12.3');
    expect(sanitizeDecimal('12,', 1)).toBe('12,');
  });
});

describe('age', () => {
  it('computes years and months from a month/year birth date', () => {
    const birth = birthDateFromMonthYear(2013, 5);
    expect(birth).toBe('2013-05-15');
    expect(ageYearsMonths(birth, '2026-10-16')).toEqual({ years: 13, months: 5 });
    expect(ageInYears('2016-10-16', '2026-10-16')).toBeCloseTo(10, 2);
  });
  it('adds months without overflowing short months', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
  });
});

describe('validation', () => {
  it('applies the §13.4 hard ranges', () => {
    expect(checkRange(300, 'childHeightCm')).toBe('tooHigh');
    expect(checkRange(59, 'childHeightCm')).toBe('tooLow');
    expect(checkRange(152, 'childHeightCm')).toBe('valid');
    expect(checkRange(null, 'weightKg')).toBe('empty');
    expect(checkRange(230, 'parentHeightCm')).toBe('valid');
    expect(checkAge(1.9)).toBe('tooYoung');
    expect(checkAge(21.9)).toBe('valid');
    expect(checkAge(22)).toBe('tooOld');
  });
  it('never flashes an error for a partial value while typing', () => {
    expect(shouldShowErrorWhileTyping(1, 'childHeightCm')).toBe(false);
    expect(shouldShowErrorWhileTyping(300, 'childHeightCm')).toBe(true);
  });
  it('flags heights more than 22% from typical', () => {
    expect(isUnusualHeight(100, 150)).toBe(true);
    expect(isUnusualHeight(140, 150)).toBe(false);
  });
});

describe('LMS maths', () => {
  it('normal CDF and quantile are inverse and accurate', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 12);
    expect(normalCdf(1.959963985)).toBeCloseTo(0.975, 9);
    expect(normalQuantile(0.97)).toBeCloseTo(1.880793608, 7);
    for (const p of [0.03, 0.1, 0.25, 0.5, 0.75, 0.9, 0.97]) expect(normalCdf(normalQuantile(p))).toBeCloseTo(p, 9);
  });
  it('z ↔ value round-trips for L ≠ 0 and L = 0', () => {
    for (const lms of [{ L: 1.17, M: 150, S: 0.045 }, { L: 0, M: 150, S: 0.045 }, { L: -0.5, M: 120, S: 0.05 }]) {
      expect(zFromLms(valueFromLms(1.3, lms), lms)).toBeCloseTo(1.3, 10);
    }
  });
  it('the median of each reference is the 50th percentile', () => {
    const cdc = engine.references.cdc;
    const lms = cdc.lmsAt('male', 120)!;
    expect(heightForAge(cdc, 'male', 120, lms.M)!.percentile).toBeCloseTo(50, 9);
  });
  it('matches published CDC 2000 stature medians at 20 y and WHO 2007 at 19 y', () => {
    expect(engine.references.cdc.lmsAt('male', 240)!.M).toBeCloseTo(176.85, 1);
    expect(engine.references.cdc.lmsAt('female', 240)!.M).toBeCloseTo(163.34, 1);
    expect(engine.references.who.lmsAt('male', 228)!.M).toBeCloseTo(176.5, 1);
    expect(engine.references.who.lmsAt('female', 228)!.M).toBeCloseTo(163.2, 1);
  });
  it('interpolates between rows', () => {
    const who = engine.references.who;
    const a = who.lmsAt('male', 120)!.M;
    const b = who.lmsAt('male', 121)!.M;
    expect(who.lmsAt('male', 120.5)!.M).toBeCloseTo((a + b) / 2, 9);
    expect(who.lmsAt('male', 60)).toBeNull();
  });
  it('formats ordinals and clamps displayed percentiles', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 64].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '64th']);
    expect(displayPercentile(0.2)).toBe(1);
    expect(displayPercentile(99.9)).toBe(99);
  });
});

describe('Khamis–Roche coefficients (bundled, erratum-corrected)', () => {
  it('has 56 rows, every row verified by ≥ 2 sources', () => {
    expect(rows).toHaveLength(56);
    expect(rows.every((r) => r.verified_by_n_sources >= 2)).toBe(true);
  });
  it('pins boy 10.0 and girl 4.0 (brief §5.4)', () => {
    const boy = rows.find((r) => r.sex === 'male' && r.age === 10)!;
    expect([boy.intercept, boy.stature_coef, boy.weight_coef, boy.midparent_coef]).toEqual([-11.038, 0.97135, -0.039981, 0.45932]);
    const girl = rows.find((r) => r.sex === 'female' && r.age === 4)!;
    expect([girl.intercept, girl.stature_coef, girl.weight_coef, girl.midparent_coef]).toEqual([-8.1325, 1.24768, -0.19435, 0.44774]);
  });
  it('picks the nearest half-year row and refuses ages outside 4.0–17.5', () => {
    expect(lookupKhamisRoche(rows, 'male', 10.2)).toMatchObject({ ok: true, row: { age: 10 } });
    expect(lookupKhamisRoche(rows, 'male', 10.3)).toMatchObject({ ok: true, row: { age: 10.5 } });
    expect(lookupKhamisRoche(rows, 'female', 3.9)).toEqual({ ok: false, reason: 'outOfAgeRange' });
    expect(lookupKhamisRoche(rows, 'female', 17.6)).toEqual({ ok: false, reason: 'outOfAgeRange' });
  });
  it('refuses rows verified by fewer than 2 sources', () => {
    const weak = rows.map((r) => ({ ...r, verified_by_n_sources: 1 }));
    expect(lookupKhamisRoche(weak, 'male', 10)).toEqual({ ok: false, reason: 'unverified' });
  });
  it('computes in inches and pounds, then converts to cm', () => {
    const boy = rows.find((r) => r.sex === 'male' && r.age === 10)!;
    const w = khamisRocheWorked(boy, 140, 32, 165, 180);
    const expectedIn = -11.038 + 0.97135 * (140 / 2.54) - 0.039981 * (32 / 0.45359237) + 0.45932 * ((165 + 180) / 2 / 2.54);
    expect(w.resultIn).toBeCloseTo(expectedIn, 9);
    expect(w.resultCm).toBeCloseTo(expectedIn * 2.54, 9);
    // Sanity: a 10-year-old boy at ~50th percentile with average parents lands near 178 cm.
    expect(w.resultCm).toBeGreaterThan(170);
    expect(w.resultCm).toBeLessThan(186);
  });
});

describe('unknown-parent widening', () => {
  it('derives adult height SDs from the CDC 2000 reference at 20 y', () => {
    expect(engine.adultHeightSdCm.father).toBeCloseTo(7.14, 1);
    expect(engine.adultHeightSdCm.mother).toBeCloseTo(6.47, 1);
  });
  it('combines the method error and the substituted parent in quadrature', () => {
    // Mid-parental, father unknown: 2·√(4.25² + (7.14/2)²) ≈ 11.1 cm.
    expect(widenForEstimatedParent(8.5, 2, 0.5, engine.adultHeightSdCm.father)).toBeCloseTo(11.1, 1);
    expect(widenForEstimatedParent(8.5, 2, 0.5, engine.adultHeightSdCm.mother)).toBeCloseTo(10.69, 1);
    expect(widenForEstimatedParent(5.3, 1.645, 0, 7)).toBeCloseTo(5.3, 9);
  });
});

describe('mid-parental height', () => {
  it('uses ±13 cm by sex', () => {
    expect(midParentalTargetCm('male', 165, 180)).toBe(179);
    expect(midParentalTargetCm('female', 165, 180)).toBe(166);
  });
});

const base = {
  sex: 'male' as const,
  birthDate: '2013-05-15',
  measuredOn: '2026-10-16',
  heightCm: 152,
  weightKg: 42,
  motherHeightCm: 163,
  fatherHeightCm: 178,
};
const opts = { reference: 'cdc' as const, unknownParentMode: 'populationAverage' as const };

describe('predict', () => {
  it('leads with Khamis–Roche when weight is given, and shows all valid methods', () => {
    const s = engine.predict(base, opts);
    expect(s.predictions.map((p) => p.method)).toEqual(['khamisRoche', 'midParental', 'percentileProjection']);
    expect(s.fallback).toBe('none');
    expect(s.highCm - s.estimateCm).toBeCloseTo(KR_BOUND_90_CM.male, 9);
    expect(s.today?.reference).toBe('cdc');
    expect(s.today!.percentile).toBeGreaterThan(5);
  });
  it('falls back to mid-parental when weight is skipped', () => {
    const s = engine.predict({ ...base, weightKg: null }, opts);
    expect(s.lead.method).toBe('midParental');
    expect(s.fallback).toBe('noWeight');
    expect(s.lead.plusMinusCm).toBe(MPH_BOUND_CM);
  });
  it('uses mid-parental only under 4', () => {
    const s = engine.predict({ ...base, birthDate: '2023-05-15', heightCm: 98, weightKg: 15 }, opts);
    expect(s.predictions.map((p) => p.method)).toEqual(['midParental']);
    expect(s.fallback).toBe('underFour');
  });
  it('leads with the percentile projection after 17.5', () => {
    const s = engine.predict({ ...base, birthDate: '2008-03-15', heightCm: 176 }, opts);
    expect(s.lead.method).toBe('percentileProjection');
    expect(s.fallback).toBe('overKhamisRocheAge');
    expect(s.estimateCm).toBeGreaterThanOrEqual(176);
  });
  it('substitutes the population average for one unknown parent and widens every range', () => {
    const s = engine.predict({ ...base, fatherHeightCm: null }, opts);
    expect(s.estimatedParent).toBe('father');
    const kr = s.predictions.find((p) => p.method === 'khamisRoche')!;
    const mph = s.predictions.find((p) => p.method === 'midParental')!;
    // Widening is derived from the CDC 2000 SD of adult height, not a fixed guess.
    expect(mph.plusMinusCm).toBeGreaterThan(MPH_BOUND_CM + 2);
    expect(mph.plusMinusCm).toBeLessThan(MPH_BOUND_CM + 3);
    expect(kr.plusMinusCm).toBeGreaterThan(KR_BOUND_90_CM.male);
    expect(kr.plusMinusCm).toBeLessThan(KR_BOUND_90_CM.male + 1.5);
    expect(mph.inputsUsed.fatherCm).toBe('175.3');
    expect(kr.notes).toContain('parentEstimated');
  });
  it('turns parent methods off in disableParentMethods mode', () => {
    const s = engine.predict({ ...base, fatherHeightCm: null }, { ...opts, unknownParentMode: 'disableParentMethods' });
    expect(s.predictions.map((p) => p.method)).toEqual(['percentileProjection']);
    expect(s.fallback).toBe('parentUnknownDisabled');
  });
  it('refuses when both parents are unknown', () => {
    expect(() => engine.predict({ ...base, fatherHeightCm: null, motherHeightCm: null }, opts)).toThrow();
  });
  it('never predicts below today’s height', () => {
    const s = engine.predict({ ...base, birthDate: '2009-05-15', heightCm: 190, weightKg: 70, motherHeightCm: 150, fatherHeightCm: 160 }, opts);
    expect(s.estimateCm).toBeGreaterThanOrEqual(190);
    expect(s.lowCm).toBeGreaterThanOrEqual(190);
    const kr = s.predictions.find((p) => p.method === 'khamisRoche');
    if (kr && kr.notes.includes('flooredAtCurrentHeight')) expect(kr.estimateCm).toBe(190);
  });
  it('uses WHO when chosen and falls back to CDC outside WHO ages', () => {
    expect(engine.predict(base, { ...opts, reference: 'who' }).today?.reference).toBe('who');
    const young = engine.predict({ ...base, birthDate: '2022-01-15', heightCm: 105, weightKg: 17 }, { ...opts, reference: 'who' });
    expect(young.today?.reference).toBe('cdc');
    const proj = young.predictions.find((p) => p.method === 'percentileProjection')!;
    expect(proj.notes).toContain('differentReference');
  });
  it('gives the same answer for girls with the girls’ table', () => {
    const s = engine.predict({ ...base, sex: 'female', heightCm: 150, weightKg: 42 }, opts);
    expect(s.highCm - s.estimateCm).toBeCloseTo(KR_BOUND_90_CM.female, 9);
  });
});
