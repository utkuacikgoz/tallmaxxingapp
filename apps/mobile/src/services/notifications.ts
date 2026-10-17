import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { addDays, addMonths, ageInYears, toIsoDate } from '@tallsoon/engine';
import { notificationLines, resolveCopy, type Copy } from '@tallsoon/content';

import { AppConfig } from '@/config/app-config';
import { planVars } from '@/features/plan/vars';
import { tr } from '@/i18n';
import { analytics } from '@/services/analytics';
import { useSettings } from '@/state/settings';

/**
 * Local notifications only: no push server, no token (brief §5.1). Permission is asked only from a
 * user action after the first result (brief §12.4). At most 2 a day: on Sundays the weekly score
 * replaces the morning plan.
 */

const CHANNEL = 'reminders';
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export function initNotifications() {
  if (!isNative) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(CHANNEL, {
      name: tr('notifications.channelReminders'),
      description: tr('notifications.channelReminderDesc'),
      importance: AndroidImportance.DEFAULT,
    });
  }
}

export type PermissionResult = 'granted' | 'denied' | 'unavailable';

export async function notificationPermission(): Promise<PermissionResult> {
  if (!isNative) return 'unavailable';
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

/** Shows the OS prompt (Android 13+: POST_NOTIFICATIONS). Call only from a user action. */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (!isNative) return 'unavailable';
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  if (!current.canAskAgain) return 'denied';
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: false, allowBadge: false },
  });
  const result = status === 'granted' ? 'granted' : 'denied';
  analytics.track('notification_permission', { result });
  return result;
}

function pick(lines: Copy[], seed: number): Copy {
  return lines[Math.abs(seed) % lines.length] as Copy;
}

function line(lines: Copy[], seed: number, vars: Record<string, string>): string {
  const role = useSettings.getState().role;
  return resolveCopy(pick(lines, seed), role === 'teen' ? 'teen' : 'parent', vars);
}

function minusMinutes(hhmm: string, minutes: number): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const total = (h * 60 + m - minutes + 24 * 60) % (24 * 60);
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

function atTime(dateIso: string, hour: number, minute: number): Date {
  const [y, mo, d] = dateIso.split('-').map(Number) as [number, number, number];
  return new Date(y, mo - 1, d, hour, minute, 0);
}

const IDS = {
  bedtime: 'plan.bedtime',
  morning: (weekday: number) => `plan.morning.${weekday}`,
  weekly: 'plan.weekly',
  checkin: 'plan.checkin',
  trial: 'sub.trial',
  remeasure: 'free.remeasure',
};

async function cancel(ids: string[]) {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}

export interface PlanReminderInput {
  childName: string;
  birthDate: string;
  bedtime: string;
  /** Latest measurement date, for the next check-in. */
  lastMeasuredOn: string | null;
}

/** (Re)schedules Pro reminders from settings. Safe to call often; rotates the copy each time. */
export async function schedulePlanReminders(input: PlanReminderInput): Promise<void> {
  if (!isNative || (await notificationPermission()) !== 'granted') return;
  const { reminders } = useSettings.getState();
  const seed = Math.floor(Date.now() / 86_400_000);
  const age = ageInYears(input.birthDate, toIsoDate(new Date()));
  const vars = { ...planVars(age, input.bedtime), name: input.childName, bedtime: input.bedtime };

  await cancel([IDS.bedtime, IDS.weekly, IDS.checkin, ...[1, 2, 3, 4, 5, 6, 7].map(IDS.morning)]);

  if (reminders.bedtime) {
    const { hour, minute } = minusMinutes(input.bedtime, 30);
    await Notifications.scheduleNotificationAsync({
      identifier: IDS.bedtime,
      content: { title: AppConfig.appName, body: line(notificationLines.bedtime, seed, vars) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
    });
  }
  if (reminders.morning) {
    const [hour, minute] = reminders.morningTime.split(':').map(Number) as [number, number];
    // Monday–Saturday (weekday 2–7; 1 = Sunday). Sunday gets the weekly score instead.
    for (const weekday of [2, 3, 4, 5, 6, 7]) {
      await Notifications.scheduleNotificationAsync({
        identifier: IDS.morning(weekday),
        content: { title: AppConfig.appName, body: line(notificationLines.morning, seed + weekday, vars) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute, channelId: CHANNEL },
      });
    }
    await Notifications.scheduleNotificationAsync({
      identifier: IDS.weekly,
      content: { title: AppConfig.appName, body: line(notificationLines.weekly, seed, vars) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 18, minute: 0, channelId: CHANNEL },
    });
  }
  if (reminders.checkin) {
    const base = input.lastMeasuredOn ?? toIsoDate(new Date());
    let due = addMonths(base, reminders.checkinMonths);
    const today = toIsoDate(new Date());
    if (due <= today) due = addDays(today, 1);
    await Notifications.scheduleNotificationAsync({
      identifier: IDS.checkin,
      content: { title: AppConfig.appName, body: line(notificationLines.checkin, seed, vars) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: atTime(due, 18, 0), channelId: CHANNEL },
    });
  }
}

export async function cancelPlanReminders() {
  if (!isNative) return;
  await cancel([IDS.bedtime, IDS.weekly, IDS.checkin, ...[1, 2, 3, 4, 5, 6, 7].map(IDS.morning)]);
}

/** Free users: one re-measure reminder in 3 months (brief §12.4). Asks permission (user action). */
export async function scheduleRemeasureReminder(childName = ''): Promise<boolean> {
  if ((await requestNotificationPermission()) !== 'granted') return false;
  const due = addMonths(toIsoDate(new Date()), AppConfig.freeRemeasureMonths);
  await Notifications.scheduleNotificationAsync({
    identifier: IDS.remeasure,
    content: { title: AppConfig.appName, body: line(notificationLines.remeasure, 0, { name: childName || tr('family.unnamed') }) },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: atTime(due, 18, 0), channelId: CHANNEL },
  });
  useSettings.getState().set({ remeasureReminderAt: due });
  return true;
}

/** Trial reminder 2 days before conversion (brief §5.6). Cancelled if the trial is gone. */
export async function syncTrialReminder(trialEndsAt: string | null, price: string | null) {
  if (!isNative) return;
  await cancel([IDS.trial]);
  if (!trialEndsAt || !price || (await notificationPermission()) !== 'granted') return;
  const endIso = trialEndsAt.slice(0, 10);
  const remindOn = addDays(endIso, -AppConfig.trialReminderDaysBefore);
  const when = atTime(remindOn, 10, 0);
  if (when.getTime() <= Date.now()) return;
  const date = new Date(endIso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  await Notifications.scheduleNotificationAsync({
    identifier: IDS.trial,
    content: { title: tr('notifications.trialTitle'), body: tr('notifications.trialBody', { date, price }), data: { url: 'tallsoon://family' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
  });
}

/** Delete All Data also removes every scheduled reminder (brief §2 F6). */
export async function cancelAllNotifications() {
  if (!isNative) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
