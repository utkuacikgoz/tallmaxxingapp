import type { UnknownParentMode } from '@tallsoon/engine';

/**
 * Single place for product constants. Renaming the app is one edit here (plus the store listings
 * and app.config.ts `name`, which reads from this file).
 */
export const AppConfig = {
  appName: 'TallSoon',
  /** Marketing site; also used in share cards. */
  websiteHost: 'tallsoon.app',
  websiteUrl: 'https://tallsoon.app',
  privacyUrl: 'https://tallsoon.app/privacy',
  termsUrl: 'https://tallsoon.app/terms',
  supportEmail: 'support@tallsoon.app',
  /** Brief §13.4, flagged for product review before launch. */
  unknownParentMode: 'populationAverage' as UnknownParentMode,
  plans: {
    weekly: { maxChildren: 2 },
    annual: { maxChildren: Number.POSITIVE_INFINITY },
  },
  /** RevenueCat entitlement identifiers (brief §5.6). */
  entitlements: { pro: 'pro', multiChild: 'multi_child' },
  /** RevenueCat package identifiers in the `default` offering. */
  packages: { weekly: '$rc_weekly', annual: '$rc_annual', annualTrial: 'annual_trial' },
  /** Play subscription offer tag for the opt-in trial. */
  playTrialOfferTag: 'optin-trial',
  trialDays: 7,
  /** Days before the trial converts when we send the reminder. */
  trialReminderDaysBefore: 2,
  /** Result variant A/B (brief §11.5). 'honest' is the default; 'soft' auto-presents the paywall once. */
  defaultResultVariant: 'honest' as 'honest' | 'soft',
  /** Free users get one re-measure reminder after this many months. */
  freeRemeasureMonths: 3,
} as const;
