import { it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as Notifications from 'expo-notifications';
import { atLocalTime } from '@/services/reminder-plan';
import { cancelAllNotifications, syncReminderSchedule, type PlanReminderInput } from '@/services/notifications';
import { useSettings } from '@/state/settings';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'scheduled'),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));
jest.mock('@/state/storage', () => ({ zustandStorage: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn() } }));

const input: PlanReminderInput = {
  pro: true, childName: 'Private name', birthDate: '2013-01-01', bedtime: '21:00',
  lastMeasuredOn: '2026-10-01', hasCheckedHabit: false, trial: null,
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(atLocalTime('2026-10-19', 6));
  useSettings.getState().reset();
  useSettings.getState().set({ planStartedOn: '2026-10-19' });
  jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ status: 'granted' } as Notifications.NotificationPermissionsStatus);
  jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([]);
});
afterEach(() => { jest.useRealTimers(); });

it('migrates legacy repeats, leaves unrelated requests alone, and sets safe tap routes', async () => {
  jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([
    { identifier: 'plan.bedtime' }, { identifier: 'free.remeasure' }, { identifier: 'other.feature' },
  ] as Notifications.NotificationRequest[]);
  await syncReminderSchedule(input);
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('plan.bedtime');
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('free.remeasure');
  expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('other.feature');
  const requests = jest.mocked(Notifications.scheduleNotificationAsync).mock.calls.map(([request]) => request);
  expect(requests.length).toBeLessThanOrEqual(58);
  expect(requests.every((request) => request.trigger && !('repeats' in request.trigger))).toBe(true);
  const activation = requests.find((request) => request.identifier?.startsWith('reminder.activation.'));
  expect(activation?.content.body).toContain('first habit');
  expect(activation?.content.data).toEqual({ url: '/(tabs)/today' });
  expect(JSON.stringify(requests.map((request) => request.content.data))).not.toContain('Private name');
});

it('reserves elapsed slots across refreshes and prevents a third request today', async () => {
  await syncReminderSchedule(input);
  jest.setSystemTime(atLocalTime('2026-10-19', 9));
  jest.mocked(Notifications.scheduleNotificationAsync).mockClear();
  await syncReminderSchedule({ ...input, trial: { endsAt: atLocalTime('2026-10-21', 18).toISOString(), price: '$39.99' } });
  const today = () => jest.mocked(Notifications.scheduleNotificationAsync).mock.calls.filter(([request]) =>
    request.identifier?.endsWith('2026-10-19'));
  expect(today()).toHaveLength(1);
  expect(today()[0]![0].identifier).toContain('trial');
  jest.setSystemTime(atLocalTime('2026-10-19', 11));
  jest.mocked(Notifications.scheduleNotificationAsync).mockClear();
  await syncReminderSchedule(input);
  expect(today()).toHaveLength(0);
});

it('cancels stale pending reminders and does not request permission when denied', async () => {
  jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ status: 'denied' } as Notifications.NotificationPermissionsStatus);
  jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([{ identifier: 'reminder.morning.2026-10-19' }] as Notifications.NotificationRequest[]);
  await syncReminderSchedule(input);
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

it('serializes simultaneous refreshes and data deletion clears the queue and ledger', async () => {
  await Promise.all([syncReminderSchedule(input), cancelAllNotifications()]);
  expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  expect(useSettings.getState().reminderLedger).toEqual([]);
  expect(useSettings.getState().reminderTrial).toBeNull();
});
