import { Platform } from 'react-native';
import { create } from 'zustand';

import { useSettings } from '@/state/settings';
import { createMockEntitlementService } from './mock';
import { entitlementMode } from './mode';
import { createUnavailableEntitlementService } from './unavailable';
import { createRevenueCatService } from './revenuecat';
import { FREE_STATUS, type EntitlementService, type EntitlementStatus } from './types';

export * from './types';

function pickService(): EntitlementService {
  const key = Platform.select({
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
    default: undefined,
  });
  const mode = entitlementMode(Platform.OS === 'ios' || Platform.OS === 'android', __DEV__, key);
  if (mode === 'revenuecat') return createRevenueCatService(key!.trim());
  if (mode === 'mock') return createMockEntitlementService();
  return createUnavailableEntitlementService(useSettings.getState().proHint);
}

export const entitlements: EntitlementService = pickService();

interface EntitlementStore {
  status: EntitlementStatus;
  ready: boolean;
  set: (s: EntitlementStatus) => void;
}

export const useEntitlementStore = create<EntitlementStore>((set) => ({
  // MMKV only as a UI hint until CustomerInfo arrives (brief §5.3).
  status: { ...FREE_STATUS, isPro: useSettings.getState().proHint },
  ready: false,
  set: (status) => {
    useSettings.getState().set({ proHint: status.isPro });
    set({ status, ready: true });
  },
}));

let started = false;
export async function startEntitlements() {
  if (started) return;
  started = true;
  try {
    await entitlements.configure();
    entitlements.onChange((s) => useEntitlementStore.getState().set(s));
    useEntitlementStore.getState().set(await entitlements.getStatus());
  } catch {
    useEntitlementStore.setState({ ready: true });
  }
}

export function useEntitlement(): EntitlementStatus {
  return useEntitlementStore((s) => s.status);
}

export const useIsPro = () => useEntitlementStore((s) => s.status.isPro);
