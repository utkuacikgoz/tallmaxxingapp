/**
 * Privacy-first analytics seam (brief §7). The default sink is a no-op: nothing leaves the phone.
 * Events carry no PII and no measurement values. Swap the sink for TelemetryDeck or PostHog
 * (anonymous mode) after approval.
 */
export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_step_skipped'
  | 'result_shown'
  | 'locked_card_tapped'
  | 'method_sheet_opened'
  | 'paywall_shown'
  | 'plan_selected'
  | 'trial_toggled'
  | 'purchase_completed'
  | 'paywall_closed'
  | 'restore_tapped'
  | 'manage_subscription_tapped'
  | 'teen_share_to_parent'
  | 'notification_permission'
  | 'habit_checked'
  | 'streak_milestone'
  | 'habit_score_viewed'
  | 'grocery_list_opened'
  | 'measurement_logged'
  | 'checkin_completed'
  | 'spurt_alert_shown'
  | 'pdf_exported'
  | 'child_added';

type Props = Record<string, string | number | boolean>;

export interface AnalyticsSink {
  track(event: AnalyticsEvent, props?: Props): void;
}

const noop: AnalyticsSink = { track: () => undefined };

let sink: AnalyticsSink = noop;

export const analytics = {
  track(event: AnalyticsEvent, props?: Props) {
    if (__DEV__) console.debug(`[analytics] ${event}`, props ?? '');
    sink.track(event, props);
  },
  setSink(next: AnalyticsSink) {
    sink = next;
  },
};
