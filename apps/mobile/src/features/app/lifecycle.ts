import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ageInYears, toIsoDate } from '@tallsoon/engine';

import { childrenRepo, habitsRepo, measurementsRepo } from '@/db/repo';
import { defaultBedtime } from '@/features/plan/vars';
import { tr } from '@/i18n';
import { entitlements, useEntitlementStore } from '@/services/entitlements';
import { syncReminderSchedule } from '@/services/notifications';
import { cleanupTempFiles } from '@/services/files';
import { useSettings } from '@/state/settings';

/** Keeps reminders in sync with the subscription and the child's latest data. */
let refreshQueue: Promise<void> = Promise.resolve();
export function refreshReminders(): Promise<void> {
  const result = refreshQueue.then(refreshReminderState);
  refreshQueue = result.catch(() => undefined);
  return result;
}

async function refreshReminderState() {
  const settings = useSettings.getState();
  const entitlement = useEntitlementStore.getState();
  // Wait for cached CustomerInfo before replacing a schedule from the previous launch.
  if (!entitlement.ready) return;
  const status = entitlement.status;
  const kids = await childrenRepo.list();
  const child = kids.find((k) => k.id === settings.activeChildId) ?? kids[0];
  if (!child) {
    await syncReminderSchedule(null);
    return;
  }
  let trial = status.isPro && status.isTrial && status.expiresAt && settings.reminderTrial?.endsAt === status.expiresAt
    ? settings.reminderTrial : null;
  if (status.isPro && status.isTrial && status.expiresAt) {
    try {
      const offering = await entitlements.getOffering();
      trial = { endsAt: status.expiresAt, price: (offering.annualTrial ?? offering.annual).priceString };
    } catch {
      // Keep the cached real store price for this same trial while offline.
    }
  }
  settings.set({ reminderTrial: trial });
  const latest = (await measurementsRepo.forChild(child.id))[0];
  const checks = status.isPro ? await habitsRepo.all(child.id) : [];
  const age = ageInYears(child.birthDate, toIsoDate(new Date()));
  await syncReminderSchedule({
    pro: status.isPro, childName: child.nickname || tr('family.unnamed'), birthDate: child.birthDate,
    bedtime: child.bedtime ?? defaultBedtime(age), lastMeasuredOn: latest?.date ?? null,
    hasCheckedHabit: checks.some((check) => check.done && !check.isRestDay), trial,
  });
}

export function useAppLifecycle(dbReady: boolean) {
  useEffect(() => {
    if (!dbReady) return;
    const s = useSettings.getState();
    if (!s.firstOpenedOn) s.set({ firstOpenedOn: toIsoDate(new Date()) });
    void cleanupTempFiles();
    void refreshReminders().catch(() => undefined);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshReminders().catch(() => undefined);
    });
    const unsub = useEntitlementStore.subscribe((st, prev) => {
      if (st.ready !== prev.ready || st.status.isPro !== prev.status.isPro || st.status.isTrial !== prev.status.isTrial || st.status.expiresAt !== prev.status.expiresAt) void refreshReminders().catch(() => undefined);
    });
    const settingsSub = useSettings.subscribe((st, prev) => {
      if (st.activeChildId !== prev.activeChildId || st.reminders !== prev.reminders || st.planStartedOn !== prev.planStartedOn) {
        void refreshReminders().catch(() => undefined);
      }
    });
    return () => {
      settingsSub();
      sub.remove();
      unsub();
    };
  }, [dbReady]);
}
