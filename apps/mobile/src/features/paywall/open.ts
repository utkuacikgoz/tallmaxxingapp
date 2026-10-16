import { router } from 'expo-router';

import { analytics } from '@/services/analytics';

export type PaywallContext = 'curve' | 'plan' | 'spurt' | 'pdf' | 'child' | 'measure';

/** The paywall never opens before the first free result (brief §2); every entry point goes through here. */
export function openPaywall(context?: PaywallContext, trigger = 'cta') {
  analytics.track('paywall_shown', { trigger, context: context ?? 'none' });
  router.push({ pathname: '/paywall', params: context ? { context } : {} });
}
