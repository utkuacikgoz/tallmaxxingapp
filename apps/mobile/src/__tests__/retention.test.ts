import { expect, test } from '@jest/globals';
import { retentionState } from '@/features/retention/model';

const base = {
  today: '2026-10-17', planStartedOn: '2026-10-15', weeklyStartedOn: '2026-10-03',
  isPro: true, plan: 'weekly' as const, bestStreak: 30, measurementCount: 2,
};

test('touchpoints, milestones and the weekly comparison respect calendar-day boundaries', () => {
  expect(retentionState(base)).toEqual({ touchpoint: 'grocery', showAnnual: true, milestones: ['7', '30', 'checkin'] });
  expect(retentionState({ ...base, weeklyStartedOn: '2026-10-04' }).showAnnual).toBe(false);
  expect(retentionState({ ...base, planStartedOn: '2026-10-11' }).touchpoint).toBe('weekly');
  expect(retentionState({ ...base, planStartedOn: '2026-10-04' }).touchpoint).toBeNull();
  expect(retentionState({ ...base, planStartedOn: null, weeklyStartedOn: null, bestStreak: 0, measurementCount: 1 }))
    .toEqual({ touchpoint: null, showAnnual: false, milestones: [] });
});

test('free and lapsed users do not receive paid-plan milestones or upgrade nudges', () => {
  expect(retentionState({ ...base, isPro: false })).toEqual({ touchpoint: null, showAnnual: false, milestones: [] });
  expect(retentionState({ ...base, plan: 'annual' }).showAnnual).toBe(false);
  expect(retentionState({ ...base, bestStreak: 100 }).milestones).toEqual(['7', '30', '100', 'checkin']);
});
