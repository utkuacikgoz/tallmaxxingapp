import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ageInYears, toIsoDate } from '@tallsoon/engine';

import { childrenRepo, measurementsRepo } from '@/db/repo';
import { defaultBedtime } from '@/features/plan/vars';
import { tr } from '@/i18n';
import { entitlements, useEntitlementStore } from '@/services/entitlements';
import { cancelPlanReminders, schedulePlanReminders, syncTrialReminder } from '@/services/notifications';
import { cleanupTempFiles } from '@/services/files';
import { useSettings } from '@/state/settings';

/** Keeps reminders in sync with the subscription and the child's latest data. */
export async function refreshReminders() {
  const { activeChildId } = useSettings.getState();
  const status = useEntitlementStore.getState().status;
  if (!status.isPro) {
    await cancelPlanReminders();
    await syncTrialReminder(null, null);
    return;
  }
  const kids = await childrenRepo.list();
  const child = kids.find((k) => k.id === activeChildId) ?? kids[0];
  if (!child) return;
  const latest = (await measurementsRepo.forChild(child.id))[0];
  const age = ageInYears(child.birthDate, toIsoDate(new Date()));
  await schedulePlanReminders({
    childName: child.nickname || tr('family.unnamed'),
    birthDate: child.birthDate,
    bedtime: child.bedtime ?? defaultBedtime(age),
    lastMeasuredOn: latest?.date ?? null,
  });
  if (status.isTrial && status.expiresAt) {
    try {
      const offering = await entitlements.getOffering();
      await syncTrialReminder(status.expiresAt, (offering.annualTrial ?? offering.annual).priceString);
    } catch {
      // Prices unavailable offline; the reminder is re-synced next time.
    }
  } else {
    await syncTrialReminder(null, null);
  }
}

export function useAppLifecycle(dbReady: boolean) {
  useEffect(() => {
    if (!dbReady) return;
    const s = useSettings.getState();
    if (!s.firstOpenedOn) s.set({ firstOpenedOn: toIsoDate(new Date()) });
    void cleanupTempFiles();
    void refreshReminders();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshReminders();
    });
    const unsub = useEntitlementStore.subscribe((st, prev) => {
      if (st.status.isPro !== prev.status.isPro || st.status.isTrial !== prev.status.isTrial) void refreshReminders();
    });
    return () => {
      sub.remove();
      unsub();
    };
  }, [dbReady]);
}
