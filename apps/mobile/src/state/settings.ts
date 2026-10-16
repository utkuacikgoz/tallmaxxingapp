import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { HeightUnit, ReferenceId, WeightUnit } from '@tallsoon/engine';

import { AppConfig } from '@/config/app-config';
import { zustandStorage } from './storage';

export type Role = 'parent' | 'teen';

export interface Reminders {
  bedtime: boolean;
  morning: boolean;
  checkin: boolean;
  checkinMonths: 1 | 3;
  morningTime: string;
}

export interface SettingsState {
  hasCompletedOnboarding: boolean;
  role: Role;
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  reference: ReferenceId;
  activeChildId: string | null;
  reminders: Reminders;
  /** Free users' single 3-month re-measure reminder. */
  remeasureReminderAt: string | null;
  resultVariant: 'honest' | 'soft';
  softPaywallShown: boolean;
  diet: { vegetarian: boolean; dairyFree: boolean };
  activityDays: number;
  /** Best streak per child, kept forever (brief §12.4). */
  bestStreak: Record<string, number>;
  /** UI hint only; RevenueCat CustomerInfo is the source of truth (brief §5.3). */
  proHint: boolean;
  firstOpenedOn: string | null;
  /** Day the paid plan started (Week 1, Day 1). */
  planStartedOn: string | null;
  measurementsLoggedCount: number;
  reviewRequested: boolean;
  set: (patch: Partial<Omit<SettingsState, 'set' | 'reset'>>) => void;
  reset: () => void;
}

function localeDefaults(): Pick<SettingsState, 'heightUnit' | 'weightUnit' | 'reference'> {
  const locale = getLocales()[0];
  const region = locale?.regionCode ?? 'US';
  const imperial = locale?.measurementSystem === 'us' || region === 'US' || region === 'LR' || region === 'MM';
  return {
    heightUnit: imperial ? 'ftin' : 'cm',
    weightUnit: imperial ? 'lb' : 'kg',
    // CDC by default in the US, WHO elsewhere (brief §2 P2).
    reference: region === 'US' ? 'cdc' : 'who',
  };
}

const initial = (): Omit<SettingsState, 'set' | 'reset'> => ({
  hasCompletedOnboarding: false,
  role: 'parent',
  ...localeDefaults(),
  activeChildId: null,
  reminders: { bedtime: true, morning: true, checkin: true, checkinMonths: 1, morningTime: '07:30' },
  remeasureReminderAt: null,
  resultVariant: AppConfig.defaultResultVariant,
  softPaywallShown: false,
  diet: { vegetarian: false, dairyFree: false },
  activityDays: 3,
  bestStreak: {},
  proHint: false,
  firstOpenedOn: null,
  planStartedOn: null,
  measurementsLoggedCount: 0,
  reviewRequested: false,
});

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...initial(),
      set: (patch) => set(patch),
      reset: () => set(initial()),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ set: _s, reset: _r, ...rest }) => rest,
    },
  ),
);

export const settings = () => useSettings.getState();
