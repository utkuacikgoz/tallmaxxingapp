import { beforeEach, expect, it, jest } from '@jest/globals';
import { childrenRepo } from '@/db/repo';
import { refreshReminders } from '@/features/app/lifecycle';
import { entitlements, useEntitlementStore } from '@/services/entitlements';
import { FREE_STATUS } from '@/services/entitlements/types';
import { syncReminderSchedule } from '@/services/notifications';
import { useSettings } from '@/state/settings';

jest.mock('@/state/storage', () => ({ zustandStorage: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn() } }));
jest.mock('@/db/repo', () => ({
  childrenRepo: { list: jest.fn(async () => [{ id: 'child', nickname: '', birthDate: '2013-01-01', bedtime: '21:00' }]) },
  measurementsRepo: { forChild: jest.fn(async () => []) },
  habitsRepo: { all: jest.fn(async () => []) },
}));
jest.mock('@/services/entitlements', () => ({ entitlements: { getOffering: jest.fn() }, useEntitlementStore: { getState: jest.fn() } }));
jest.mock('@/services/notifications', () => ({ syncReminderSchedule: jest.fn(async () => undefined) }));
jest.mock('@/services/files', () => ({ cleanupTempFiles: jest.fn() }));

const cached = { endsAt: '2026-10-26T18:00:00Z', price: '$39.99' };
beforeEach(() => {
  useSettings.getState().reset();
  useSettings.getState().set({ reminderTrial: cached });
  jest.mocked(entitlements.getOffering).mockRejectedValue(new Error('Offline'));
  jest.mocked(useEntitlementStore.getState).mockReturnValue({
    ready: true, set: jest.fn(), status: { ...FREE_STATUS, isPro: true, isTrial: true, expiresAt: cached.endsAt },
  });
});

it('preserves the existing schedule and cached price until entitlement initialization completes', async () => {
  jest.mocked(useEntitlementStore.getState).mockReturnValue({ ready: false, set: jest.fn(), status: FREE_STATUS });
  await refreshReminders();
  expect(syncReminderSchedule).not.toHaveBeenCalled();
  expect(childrenRepo.list).not.toHaveBeenCalled();
  expect(useSettings.getState().reminderTrial).toEqual(cached);
});

it('keeps the real cached trial price offline for the same expiry', async () => {
  await refreshReminders();
  expect(syncReminderSchedule).toHaveBeenCalledWith(expect.objectContaining({ pro: true, trial: cached }));
});

it('never reuses a cached price for a different trial expiry', async () => {
  const current = useEntitlementStore.getState();
  jest.mocked(useEntitlementStore.getState).mockReturnValue({ ...current, status: { ...current.status, expiresAt: '2026-11-10T18:00:00Z' } });
  await refreshReminders();
  expect(syncReminderSchedule).toHaveBeenCalledWith(expect.objectContaining({ trial: null }));
  expect(useSettings.getState().reminderTrial).toBeNull();
});
