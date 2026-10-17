import { addDays, toIsoDate } from '@tallsoon/engine';

import { kv } from '@/state/storage';
import { FREE_STATUS, type EntitlementService, type EntitlementStatus, type Offering, type PlanId } from './types';

const KEY = 'mock.entitlement';

function load(): EntitlementStatus {
  const raw = kv.getString(KEY);
  if (!raw) return FREE_STATUS;
  try {
    return { ...FREE_STATUS, ...(JSON.parse(raw) as EntitlementStatus) };
  } catch {
    return FREE_STATUS;
  }
}

/**
 * Used in tests, on web and in debug builds without RevenueCat keys. Prices are the brief's example
 * prices and the paywall labels them "Example prices · placeholder".
 */
export function createMockEntitlementService(): EntitlementService {
  const listeners = new Set<(s: EntitlementStatus) => void>();
  let status = load();
  const emit = (s: EntitlementStatus) => {
    status = s;
    kv.set(KEY, JSON.stringify(s));
    listeners.forEach((l) => l(s));
  };

  const offering: Offering = {
    annual: { plan: 'annual', priceString: '$39.99', price: 39.99, currencyCode: 'USD', ref: 'annual' },
    annualTrial: { plan: 'annual', priceString: '$39.99', price: 39.99, currencyCode: 'USD', ref: 'annual_trial' },
    weekly: { plan: 'weekly', priceString: '$4.99', price: 4.99, currencyCode: 'USD', ref: 'weekly' },
    isExample: true,
  };

  return {
    kind: 'mock',
    async configure() {},
    async getStatus() {
      return status;
    },
    async getOffering() {
      return offering;
    },
    async purchase(plan: PlanId, { trial }) {
      await new Promise((r) => setTimeout(r, 900));
      const today = toIsoDate(new Date());
      const next: EntitlementStatus = {
        isPro: true,
        multiChild: plan === 'annual',
        plan,
        isTrial: plan === 'annual' && trial,
        willRenew: true,
        expiresAt: addDays(today, plan === 'weekly' ? 7 : trial ? 7 : 365),
        hadPro: true,
        managementURL: null,
      };
      emit(next);
      return { status: 'purchased', entitlement: next };
    },
    async restore() {
      return status;
    },
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async manageSubscriptions() {
      // Demo builds: cancelling in "Manage" lapses the subscription so the read-only state can be tested.
      if (status.isPro) emit({ ...status, isPro: false, multiChild: false, willRenew: false });
    },
    async requestRefund() {
      return 'unsupported';
    },
  };
}
