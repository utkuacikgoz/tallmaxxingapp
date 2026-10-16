import { create } from 'zustand';

import { ageInYears, birthDateFromMonthYear, toIsoDate, type ParentKey, type Sex } from '@tallsoon/engine';

import type { Role } from '@/state/settings';

export type SleepBand = 'lt7' | '7-8' | '8-9' | '9+';
export type Goal = 'adultHeight' | 'fullHeight' | 'track' | 'onTrack';

export type StepId = 'role' | 'sex' | 'birth' | 'height' | 'weight' | 'parents' | 'puberty' | 'sleep' | 'goal' | 'research';

/** 'first' = first run; 'addChild' = Pro "Add Child" (role and research are skipped). */
export type FlowMode = 'first' | 'addChild';

export interface Draft {
  mode: FlowMode;
  /** Set when editing an existing child from the result or adding a child. */
  childId: string | null;
  role: Role | null;
  sex: Sex | null;
  birth: { month: number; year: number } | null;
  heightCm: number | null;
  weightKg: number | null;
  weightSkipped: boolean;
  motherCm: number | null;
  fatherCm: number | null;
  unknownParent: ParentKey | null;
  pubertySigns: string[];
  sleepBand: SleepBand | null;
  goal: Goal | null;
  nickname: string;
}

const empty: Draft = {
  mode: 'first',
  childId: null,
  role: null,
  sex: null,
  birth: null,
  heightCm: null,
  weightKg: null,
  weightSkipped: false,
  motherCm: null,
  fatherCm: null,
  unknownParent: null,
  pubertySigns: [],
  sleepBand: null,
  goal: null,
  nickname: '',
};

interface DraftStore extends Draft {
  patch: (p: Partial<Draft>) => void;
  reset: (p?: Partial<Draft>) => void;
}

/** In-memory onboarding answers. Saved to SQLite when the result is computed. */
export const useDraft = create<DraftStore>((set) => ({
  ...empty,
  patch: (p) => set(p),
  reset: (p) => set({ ...empty, ...p }),
}));

export const draft = () => useDraft.getState();

export function draftBirthDate(d: Pick<Draft, 'birth'>): string | null {
  return d.birth ? birthDateFromMonthYear(d.birth.year, d.birth.month) : null;
}

export function draftAgeYears(d: Pick<Draft, 'birth'>, today = toIsoDate(new Date())): number | null {
  const b = draftBirthDate(d);
  return b ? ageInYears(b, today) : null;
}

/** Puberty checklist only where relevant: girls 8–15, boys 9–16 (brief §11.3). */
export function pubertyEligible(sex: Sex | null, age: number | null): boolean {
  if (!sex || age == null) return false;
  return sex === 'female' ? age >= 8 && age < 16 : age >= 9 && age < 17;
}

export function stepsFor(d: Pick<Draft, 'mode' | 'sex' | 'birth'>): StepId[] {
  const age = draftAgeYears(d);
  const puberty = pubertyEligible(d.sex, age);
  const all: StepId[] =
    d.mode === 'addChild'
      ? ['sex', 'birth', 'height', 'weight', 'parents', 'puberty', 'sleep']
      : ['role', 'sex', 'birth', 'height', 'weight', 'parents', 'puberty', 'sleep', 'goal', 'research'];
  return all.filter((s) => s !== 'puberty' || puberty);
}

export function nextStep(current: StepId, d: Pick<Draft, 'mode' | 'sex' | 'birth'>): StepId | 'loader' {
  const steps = stepsFor(d);
  const i = steps.indexOf(current);
  return steps[i + 1] ?? 'loader';
}

export function stepProgress(current: StepId, d: Pick<Draft, 'mode' | 'sex' | 'birth'>): { step: number; total: number } {
  const steps = stepsFor(d);
  return { step: steps.indexOf(current) + 1, total: steps.length };
}
