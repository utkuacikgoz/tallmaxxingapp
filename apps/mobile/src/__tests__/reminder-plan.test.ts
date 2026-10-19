import { it, expect } from '@jest/globals';
import { addDays, toIsoDate } from '@tallsoon/engine';
import { atLocalTime, buildReminderPlan, reminderRoute, type ReminderPlanInput } from '@/services/reminder-plan';

const base: ReminderPlanInput = {
  now: atLocalTime('2026-10-19', 6), pro: true, bedtime: '21:00',
  reminders: { bedtime: true, morning: true, morningTime: '07:30', checkin: true, checkinMonths: 1 },
  lastMeasuredOn: '2026-10-01', remeasureOn: '2027-01-19', trialEndsAt: null,
  planStartedOn: '2026-10-19', hasCheckedHabit: true, spentToday: 0,
};

it('schedules local times, with Sunday recap replacing the morning prompt', () => {
  const plan = buildReminderPlan(base);
  const sunday = plan.filter((s) => toIsoDate(s.at) === '2026-10-25');
  expect(sunday.map((s) => s.kind)).toEqual(['weekly', 'bedtime']);
  expect(sunday[0]!.at.getHours()).toBe(18);
  const monday = plan.filter((s) => toIsoDate(s.at) === '2026-10-19');
  expect(monday.map((s) => [s.kind, s.at.getHours(), s.at.getMinutes()])).toEqual([['morning', 7, 30], ['bedtime', 20, 30]]);
  expect(plan.length).toBeLessThanOrEqual(58);
  expect(plan.every((s) => s.at > base.now)).toBe(true);
});

it('prioritizes trial and measurement over routine reminders on the same day', () => {
  const plan = buildReminderPlan({ ...base, lastMeasuredOn: '2026-09-21', trialEndsAt: atLocalTime('2026-10-23', 18).toISOString() });
  const collision = plan.filter((s) => toIsoDate(s.at) === '2026-10-21');
  expect(collision.map((s) => s.kind)).toEqual(['trial', 'checkin']);
  for (const day of new Set(plan.map((s) => toIsoDate(s.at)))) {
    expect(plan.filter((s) => toIsoDate(s.at) === day).length).toBeLessThanOrEqual(2);
  }
});

it('replaces one morning prompt with a first-habit reminder, only while incomplete', () => {
  const incomplete = buildReminderPlan({ ...base, hasCheckedHabit: false });
  expect(incomplete.filter((s) => s.kind === 'activation')).toHaveLength(1);
  expect(incomplete.filter((s) => toIsoDate(s.at) === '2026-10-20').map((s) => s.kind)).toEqual(['activation', 'bedtime']);
  expect(buildReminderPlan(base).some((s) => s.kind === 'activation')).toBe(false);
  expect(buildReminderPlan({ ...base, hasCheckedHabit: false, now: atLocalTime('2026-10-22', 6) }).some((s) => s.kind === 'activation')).toBe(false);
});

it('respects switches and never schedules activation when morning reminders are off', () => {
  expect(buildReminderPlan({ ...base, hasCheckedHabit: false, reminders: { ...base.reminders, morning: false } }).every((s) => s.kind === 'bedtime' || s.kind === 'checkin')).toBe(true);
  expect(buildReminderPlan({ ...base, reminders: { ...base.reminders, morning: false, bedtime: false, checkin: false } })).toEqual([]);
});

it('counts elapsed slots when settings change during the day', () => {
  const input = { ...base, now: atLocalTime('2026-10-19', 9), trialEndsAt: atLocalTime('2026-10-21', 18).toISOString(), spentToday: 1 };
  expect(buildReminderPlan(input).filter((s) => toIsoDate(s.at) === '2026-10-19').map((s) => s.kind)).toEqual(['trial']);
  expect(buildReminderPlan({ ...input, spentToday: 2 }).some((s) => toIsoDate(s.at) === '2026-10-19')).toBe(false);
});

it('keeps a distant check-in, rolls overdue check-ins forward, and removes expired trials', () => {
  expect(buildReminderPlan({ ...base, reminders: { ...base.reminders, checkinMonths: 3 } }).some((s) => s.kind === 'checkin' && toIsoDate(s.at) === '2027-01-01')).toBe(true);
  const overdue = buildReminderPlan({ ...base, lastMeasuredOn: '2026-08-01', trialEndsAt: '2026-10-18T18:00:00Z' });
  expect(overdue.find((s) => s.kind === 'checkin')?.at).toEqual(atLocalTime('2026-10-20', 18));
  expect(overdue.some((s) => s.kind === 'trial')).toBe(false);
});

it('free users receive only their opted-in measurement reminder; upgrades suppress it', () => {
  expect(buildReminderPlan({ ...base, pro: false }).map((s) => s.kind)).toEqual(['remeasure']);
  expect(buildReminderPlan({ ...base, pro: false, remeasureOn: null })).toEqual([]);
  expect(buildReminderPlan(base).some((s) => s.kind === 'remeasure')).toBe(false);
});

it('preserves wall-clock time across the daylight-saving change', () => {
  const plan = buildReminderPlan({ ...base, now: atLocalTime('2026-10-31', 6) });
  for (const slot of plan.filter((s) => s.kind === 'morning')) {
    expect([slot.at.getHours(), slot.at.getMinutes()]).toEqual([7, 30]);
  }
  expect(toIsoDate(plan.at(-1)!.at)).toBe(addDays('2026-10-31', 27));
});

it('allows only known app destinations and supports notifications from earlier builds', () => {
  expect(reminderRoute('reminder.activation.2026-10-20', undefined)).toBe('/(tabs)/today');
  expect(reminderRoute('plan.checkin', undefined)).toBe('/log');
  expect(reminderRoute('free.remeasure', undefined)).toBe('/log');
  expect(reminderRoute('plan.weekly', undefined)).toBe('/score');
  expect(reminderRoute('sub.trial', 'tallsoon://family')).toBe('/(tabs)/family');
  expect(reminderRoute('unknown', 'https://example.com')).toBeNull();
  expect(reminderRoute('unknown', '/paywall')).toBeNull();
});
