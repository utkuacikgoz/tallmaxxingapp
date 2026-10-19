import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { addMonths, ageInYears, toIsoDate } from '@tallsoon/engine';
import { notificationLines, resolveCopy, type Copy } from '@tallsoon/content';

import { AppConfig } from '@/config/app-config';
import { planVars } from '@/features/plan/vars';
import { tr } from '@/i18n';
import { analytics } from '@/services/analytics';
import { useSettings } from '@/state/settings';
import { buildReminderPlan, reminderRoute, type ReminderLedger, type ReminderPlanInput } from './reminder-plan';

/** Local-only reminders. Permission is requested from an explicit action after the first result. */

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

export interface PlanReminderInput {
  pro: boolean;
  childName: string;
  birthDate: string;
  bedtime: string;
  lastMeasuredOn: string | null;
  hasCheckedHabit: boolean;
  trial: { endsAt: string; price: string } | null;
}

// Serialize permission, settings, lifecycle and habit updates so schedules cannot interleave.
let scheduleQueue: Promise<void> = Promise.resolve();
function serialize(work: () => Promise<void>): Promise<void> {
  const result = scheduleQueue.then(work);
  scheduleQueue = result.catch(() => undefined);
  return result;
}

function owned(id: string) {
  return id.startsWith('reminder.') || id.startsWith('plan.') || id === 'sub.trial' || id === 'free.remeasure';
}

/** Replaces legacy repeats with at most 58 dated requests (below iOS's 64-request limit). */
export function syncReminderSchedule(input: PlanReminderInput | null): Promise<void> {
  return serialize(async () => {
    if (!isNative) return;
    const now = new Date();
    const today = toIsoDate(now);
    const settings = useSettings.getState();
    // Keep today's elapsed slots even if a notification was dismissed. Settings changes must not
    // create a third slot later that day. Counting a delayed/undelivered slot is conservative.
    const elapsed = settings.reminderLedger.filter((slot) => new Date(slot.at).getTime() <= now.getTime() && toIsoDate(new Date(slot.at)) === today);
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    for (const request of pending) {
      if (owned(request.identifier)) await Notifications.cancelScheduledNotificationAsync(request.identifier);
    }
    settings.set({ reminderLedger: elapsed });
    if ((await notificationPermission()) !== 'granted') return;
    const model: ReminderPlanInput = {
      now, pro: input?.pro ?? false, bedtime: input?.bedtime ?? '21:00',
      reminders: settings.reminders, lastMeasuredOn: input?.lastMeasuredOn ?? null,
      remeasureOn: input ? settings.remeasureReminderAt : null, trialEndsAt: input?.trial?.endsAt ?? null,
      planStartedOn: settings.planStartedOn, hasCheckedHabit: input?.hasCheckedHabit ?? true,
      spentToday: elapsed.length,
    };
    const age = input ? ageInYears(input.birthDate, today) : 13;
    const vars = { ...planVars(age, model.bedtime), name: input?.childName ?? tr('family.unnamed'), bedtime: model.bedtime };
    const seed = Math.floor(now.getTime() / 86_400_000);
    const ledger: ReminderLedger[] = [...elapsed];
    for (const slot of buildReminderPlan(model)) {
      let title: string = AppConfig.appName;
      let body: string;
      if (slot.kind === 'activation') body = tr('notifications.firstHabit');
      else if (slot.kind === 'trial') {
        if (!input?.trial) continue;
        title = tr('notifications.trialTitle');
        const date = new Date(input.trial.endsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
        body = tr('notifications.trialBody', { date, price: input.trial.price });
      } else body = line(notificationLines[slot.kind], seed + slot.at.getDay(), vars);
      await Notifications.scheduleNotificationAsync({
        identifier: slot.id,
        content: { title, body, data: { url: reminderRoute(slot.id, undefined) } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: slot.at, channelId: CHANNEL },
      });
      ledger.push({ at: slot.at.toISOString() });
      settings.set({ reminderLedger: [...ledger] });
    }
  });
}

/** Free users explicitly opt in to a single three-month reminder. */
export async function scheduleRemeasureReminder(): Promise<boolean> {
  if ((await requestNotificationPermission()) !== 'granted') return false;
  const due = addMonths(toIsoDate(new Date()), AppConfig.freeRemeasureMonths);
  useSettings.getState().set({ remeasureReminderAt: due });
  return true; // The caller refreshes using the current entitlement, including an upgrade in flight.
}

/** Delete All Data also removes every scheduled reminder. */
export function cancelAllNotifications(): Promise<void> {
  return serialize(async () => {
    if (!isNative) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    useSettings.getState().set({ reminderLedger: [], reminderTrial: null });
  });
}
