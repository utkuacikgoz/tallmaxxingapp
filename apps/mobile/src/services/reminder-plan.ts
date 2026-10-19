import { addDays, addMonths, toIsoDate } from '@tallsoon/engine';

/** A bounded local schedule, refreshed whenever the app opens or reminder inputs change. */
export const REMINDER_DAYS = 28;
export type ReminderKind = 'bedtime' | 'morning' | 'weekly' | 'checkin' | 'trial' | 'remeasure' | 'activation';
export interface ReminderSlot { id: string; kind: ReminderKind; at: Date }
export interface ReminderLedger { at: string }
export interface ReminderPlanInput {
  now: Date;
  pro: boolean;
  bedtime: string;
  reminders: { bedtime: boolean; morning: boolean; morningTime: string; checkin: boolean; checkinMonths: 1 | 3 };
  lastMeasuredOn: string | null;
  remeasureOn: string | null;
  trialEndsAt: string | null;
  planStartedOn: string | null;
  hasCheckedHabit: boolean;
  spentToday: number;
}

export function atLocalTime(day: string, hour: number, minute = 0): Date {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, hour, minute);
}

// Service/trial and measurement notices take precedence over routine habit prompts.
const priority: Record<ReminderKind, number> = { trial: 0, checkin: 1, remeasure: 1, activation: 2, weekly: 3, morning: 4, bedtime: 5 };

export function buildReminderPlan(input: ReminderPlanInput): ReminderSlot[] {
  const today = toIsoDate(input.now);
  const candidates: ReminderSlot[] = [];
  const add = (kind: ReminderKind, at: Date) => candidates.push({ kind, at, id: `reminder.${kind}.${toIsoDate(at)}` });
  if (input.pro) {
    const [hour, minute] = input.reminders.morningTime.split(':').map(Number) as [number, number];
    const [bedHour, bedMinute] = input.bedtime.split(':').map(Number) as [number, number];
    const bedTotal = (bedHour * 60 + bedMinute - 30 + 1440) % 1440;
    const activationDay = input.planStartedOn ? addDays(input.planStartedOn, 1) : null;
    for (let i = 0; i < REMINDER_DAYS; i++) {
      const day = addDays(today, i);
      if (input.reminders.bedtime) add('bedtime', atLocalTime(day, Math.floor(bedTotal / 60), bedTotal % 60));
      if (input.reminders.morning) {
        if (day === activationDay && !input.hasCheckedHabit) add('activation', atLocalTime(day, hour, minute));
        else if (atLocalTime(day, 12).getDay() === 0) add('weekly', atLocalTime(day, 18));
        else add('morning', atLocalTime(day, hour, minute));
      }
    }
    if (input.reminders.checkin) {
      let due = addMonths(input.lastMeasuredOn ?? today, input.reminders.checkinMonths);
      if (due <= today) due = addDays(today, 1);
      add('checkin', atLocalTime(due, 18));
    }
    if (input.trialEndsAt) {
      const end = new Date(input.trialEndsAt);
      if (Number.isFinite(end.getTime())) add('trial', atLocalTime(addDays(toIsoDate(end), -2), 10));
    }
  } else if (input.remeasureOn) {
    add('remeasure', atLocalTime(input.remeasureOn, 18));
  }

  const byDay = new Map<string, ReminderSlot[]>();
  for (const slot of candidates) {
    if (slot.at.getTime() <= input.now.getTime()) continue;
    const day = toIsoDate(slot.at);
    const group = byDay.get(day) ?? [];
    group.push(slot);
    byDay.set(day, group);
  }
  return [...byDay.entries()].flatMap(([day, slots]) => slots
    .sort((a, b) => priority[a.kind] - priority[b.kind] || a.at.getTime() - b.at.getTime())
    .slice(0, Math.max(0, 2 - (day === today ? input.spentToday : 0))))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

export type ReminderRoute = '/(tabs)/today' | '/score' | '/(tabs)/family' | '/log';
export function reminderRoute(identifier: string, url: unknown): ReminderRoute | null {
  const allowed: ReminderRoute[] = ['/(tabs)/today', '/score', '/(tabs)/family', '/log'];
  if (typeof url === 'string' && allowed.includes(url as ReminderRoute)) return url as ReminderRoute;
  if (url === 'tallsoon://family') return '/(tabs)/family';
  if (identifier === 'sub.trial' || identifier.startsWith('reminder.trial.')) return '/(tabs)/family';
  if (identifier === 'plan.checkin' || identifier === 'free.remeasure' || /^reminder\.(checkin|remeasure)\./.test(identifier)) return '/log';
  if (identifier === 'plan.weekly' || identifier.startsWith('reminder.weekly.')) return '/score';
  if (/^plan\.(bedtime|morning)/.test(identifier) || /^reminder\.(bedtime|morning|activation)\./.test(identifier)) return '/(tabs)/today';
  return null;
}
