import { ageBandFor, focusTargets, type AgeBand } from '@tallsoon/content';

/** Values that fill {placeholders} in plan copy, from the child's age and bedtime. */
export function planVars(ageYears: number, bedtime: string | null): Record<string, string> {
  const band: AgeBand = ageBandFor(ageYears);
  const sleep = focusTargets.find((f) => f.key === 'sleep')?.value[band] ?? '9–12 h';
  const calcium = focusTargets.find((f) => f.key === 'calcium')?.value[band] ?? '1,300 mg';
  return {
    bedtime: bedtime ?? defaultBedtime(ageYears),
    sleepRange: sleep.replace(/ h$/, ' hours'),
    calcium,
  };
}

/** A sensible default lights-out time before the parent picks one. */
export function defaultBedtime(ageYears: number): string {
  if (ageYears < 9) return '20:00';
  if (ageYears < 13) return '21:00';
  return '21:30';
}
