import { router } from 'expo-router';

import { todayIso, useMeasurements } from '@/features/child/useChild';
import { openPaywall } from '@/features/paywall/open';
import { useT } from '@/i18n';
import { useEntitlement } from '@/services/entitlements';
import { useSettings } from '@/state/settings';
import { Row, Section } from '@/ui/List';
import { retentionState } from './model';

export function RetentionCards({ childId, bestStreak }: { childId: string | null; bestStreak: number }) {
  const t = useT();
  const ent = useEntitlement();
  const planStartedOn = useSettings((s) => s.planStartedOn);
  const weeklyStartedOn = useSettings((s) => s.weeklyStartedOn);
  const measurements = useMeasurements(childId);
  const state = retentionState({
    today: todayIso(), planStartedOn, weeklyStartedOn, isPro: ent.isPro, plan: ent.plan,
    bestStreak, measurementCount: measurements.length,
  });
  if (!childId) return null;
  return (
    <>
      {state.touchpoint === 'grocery' ? (
        <Section header={t('retention.groceryTitle')} footer={t('retention.groceryBody')}>
          <Row testID="day3-grocery" title={t('retention.groceryCta')} icon="cart" accessory="chevron" onPress={() => router.push('/grocery')} />
        </Section>
      ) : state.touchpoint === 'weekly' ? (
        <Section header={t('retention.weeklyTitle')} footer={t('retention.weeklyBody')}>
          <Row testID="day7-score" title={t('retention.scoreCta')} icon="chart" accessory="chevron" onPress={() => router.push('/score')} />
          <Row testID="day7-review" title={t('retention.reviewCta')} icon="list" accessory="chevron" onPress={() => router.push('/personalize')} />
        </Section>
      ) : null}
      {state.milestones.length ? (
        <Section header={t('retention.milestones')}>
          {state.milestones.map((milestone) => (
            <Row key={milestone} testID={`milestone-${milestone}`} title={t(`retention.milestone.${milestone}`)} icon="share" accessory="chevron"
              onPress={() => router.push({ pathname: '/share', params: { milestone } })} />
          ))}
        </Section>
      ) : null}
      {state.showAnnual ? (
        <Section header={t('retention.annualTitle')} footer={t('retention.annualBody')}>
          <Row testID="compare-annual" title={t('retention.annualCta')} icon="people" accessory="chevron" onPress={() => openPaywall(undefined, 'weekly_after_two_weeks')} />
        </Section>
      ) : null}
    </>
  );
}
