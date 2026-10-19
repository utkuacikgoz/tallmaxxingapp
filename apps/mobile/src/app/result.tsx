import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ageYearsMonths, formatHeight, formatWeight } from '@tallsoon/engine';
import { ageBandFor, habitsForDay, resolveCopy } from '@tallsoon/content';
import { populationAdultHeightCm } from '@tallsoon/reference';

import { childrenRepo } from '@/db/repo';
import { useActiveChild, useChildModel, todayIso } from '@/features/child/useChild';
import { useDraft } from '@/features/onboarding/draft';
import { openPaywall } from '@/features/paywall/open';
import { planVars } from '@/features/plan/vars';
import { methodValue, percentileOrdinal, plusMinus, pubertyKey } from '@/features/result/copy';
import { ResultHero } from '@/features/result/ResultHero';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { useIsPro } from '@/services/entitlements';
import { haptics } from '@/services/haptics';
import { refreshReminders } from '@/features/app/lifecycle';
import { scheduleRemeasureReminder } from '@/services/notifications';
import { useSettings } from '@/state/settings';
import { minTouch, space, useTheme } from '@/theme';
import { showBanner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Celebrate } from '@/ui/Celebrate';
import { Icon } from '@/ui/Icon';
import { BottomBar } from '@/ui/Layout';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

export default function ResultScreen() {
  const t = useT();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ reveal?: string }>();
  const reveal = params.reveal === '1';
  const child = useActiveChild();
  const model = useChildModel(child);
  const isPro = useIsPro();
  const role = useSettings((s) => s.role);
  const unit = useSettings((s) => s.heightUnit);
  const weightUnit = useSettings((s) => s.weightUnit);
  const variant = useSettings((s) => s.resultVariant);
  const softShown = useSettings((s) => s.softPaywallShown);
  const remeasureAt = useSettings((s) => s.remeasureReminderAt);
  const revealed = useRef(false);

  const summary = model?.summary ?? null;

  useEffect(() => {
    if (!summary || revealed.current) return;
    revealed.current = true;
    analytics.track('result_shown', { methods_count: summary.predictions.length, variant });
    if (reveal) {
      haptics.success();
      // Variant B ("soft"): the paywall presents once per install after the confetti (brief §11.5).
      if (variant === 'soft' && !softShown && !isPro) {
        const id = setTimeout(() => {
          useSettings.getState().set({ softPaywallShown: true });
          openPaywall(undefined, 'soft_auto');
        }, 1500);
        return () => clearTimeout(id);
      }
    }
    return undefined;
  }, [summary, reveal, variant, softShown, isPro]);

  const preview = useMemo(() => {
    if (!summary) return [];
    return habitsForDay(ageBandFor(summary.ageYears), todayIso()).slice(0, 3);
  }, [summary]);

  if (!child || !model || !summary || !model.latest) {
    return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  }

  const audience = role === 'teen' ? 'teen' : 'parent';
  const ym = ageYearsMonths(child.birthDate, model.latest.date);
  const editStep = (step: string) => {
    useDraft.getState().reset({
      mode: 'first',
      childId: child.id,
      role,
      sex: child.sexAtBirth,
      birth: { year: Number(child.birthDate.slice(0, 4)), month: Number(child.birthDate.slice(5, 7)) },
      heightCm: model.latest?.heightCm ?? null,
      weightKg: model.weightKg,
      weightSkipped: model.weightKg == null,
      motherCm: child.motherHeightCm,
      fatherCm: child.fatherHeightCm,
      unknownParent: child.parentHeightEstimated,
      pubertySigns: child.pubertySigns ?? [],
      sleepBand: child.sleepBand,
      goal: (child.primaryGoal as never) ?? null,
      nickname: child.nickname,
    });
    router.push({ pathname: `/onboarding/${step}` as never, params: { edit: '1' } });
  };

  const methodRow = (p: (typeof summary.predictions)[number]) => {
    const title = p.method === 'khamisRoche' ? t('result.krRow') : p.method === 'midParental' ? t('result.mphRow') : t('result.projRow');
    const subtitle =
      p.method === 'khamisRoche'
        ? t('result.krSub', { pm: plusMinus(p, unit) })
        : p.method === 'midParental'
          ? t('result.mphSub', { pm: plusMinus(p, unit) })
          : t('result.projSub');
    return (
      <Row
        key={p.method}
        testID={`method-${p.method}`}
        title={title}
        subtitle={subtitle}
        value={methodValue(p, unit)}
        accessory="chevron"
        onPress={() => {
          analytics.track('method_sheet_opened', { method: p.method });
          router.push('/method');
        }}
      />
    );
  };

  let leadNote = t(`result.lead.${summary.fallback}`);
  if (summary.estimatedParent) leadNote += t('result.lead.estimated', { parent: t(`result.lead.${summary.estimatedParent}`) });

  const lockedRow = (key: 'curve' | 'plan' | 'spurt' | 'pdf', icon: 'chart' | 'list' | 'bolt' | 'doc') => (
    <Row
      testID={`locked-${key}`}
      icon={icon}
      iconTone="soft"
      title={t(`result.locked.${key}`)}
      subtitle={t(`result.locked.${key}Sub`)}
      accessory="lock"
      accessibilityHint={t('common.locked')}
      onPress={() => {
        analytics.track('locked_card_tapped', { card: key });
        openPaywall(key, 'locked_row');
      }}
    />
  );

  const puberty = pubertyKey(child.pubertySigns ?? [], summary.ageYears);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen
        options={{
          title: t('result.title'),
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerBlurEffect: 'systemChromeMaterial',
          headerLargeStyle: { backgroundColor: c.bg },
          headerStyle: { backgroundColor: Platform.OS === 'ios' ? undefined : c.bg },
          headerBackVisible: !reveal,
          gestureEnabled: !reveal,
          headerRight: () => (
            <Pressable
              testID="result-share"
              onPress={() => router.push('/share')}
              accessibilityRole="button"
              accessibilityLabel={t('result.shareA11y')}
              hitSlop={8}
              style={styles.navBtn}
            >
              <Icon name="share" size={22} color={c.tint} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 24 }} testID="result-scroll">
        <Text variant="body" color="label2" style={styles.subtitle}>
          {t('result.subtitle')}
        </Text>

        <ResultHero summary={summary} todayCm={model.latest.heightCm} unit={unit} animate={reveal} />

        <View style={styles.notes}>
          {summary.today ? (
            <Text variant="footnote" color="label2" accessibilityLabel={t('result.percentileA11y', { ordinal: percentileOrdinal(summary.today.percentile), ref: summary.today.reference.toUpperCase() })}>
              {t('result.percentileToday', { ordinal: percentileOrdinal(summary.today.percentile), ref: summary.today.reference.toUpperCase() })}
            </Text>
          ) : null}
          <Text variant="footnote" color="label2">
            {t(`result.puberty.${puberty}`)}
          </Text>
        </View>

        <Section header={t('result.methodsHeader')} footer={leadNote}>
          {summary.predictions.map(methodRow)}
        </Section>

        <Section header={t('result.inputsHeader')}>
          <Row title={t('result.inAge')} value={t('result.ageValue', { years: ym.years, months: ym.months })} accessory="chevron" onPress={() => editStep('birth')} />
          <Row title={t('result.inHeight')} value={formatHeight(model.latest.heightCm, unit)} accessory="chevron" onPress={() => editStep('height')} />
          <Row
            title={t('result.inWeight')}
            value={model.weightKg != null ? formatWeight(model.weightKg, weightUnit) : t('result.skipped')}
            accessory="chevron"
            onPress={() => editStep('weight')}
          />
          <Row
            title={t('result.inMother')}
            value={child.motherHeightCm != null ? formatHeight(child.motherHeightCm, unit) : t('result.estimated', { height: formatHeight(populationAdultHeightCm.mother, unit) })}
            accessory="chevron"
            onPress={() => editStep('parents')}
          />
          <Row
            title={t('result.inFather')}
            value={child.fatherHeightCm != null ? formatHeight(child.fatherHeightCm, unit) : t('result.estimated', { height: formatHeight(populationAdultHeightCm.father, unit) })}
            accessory="chevron"
            onPress={() => editStep('parents')}
          />
          <Row
            title={child.nickname ? child.nickname : t('result.addName')}
            tint={!child.nickname}
            accessory="chevron"
            onPress={() => router.push('/name')}
          />
        </Section>

        {role === 'teen' && !isPro ? (
          <Section>
            <Row
              testID="show-parent"
              icon="people"
              title={t('result.showParent')}
              subtitle={t('result.showParentSub')}
              accessory="chevron"
              onPress={() => {
                analytics.track('teen_share_to_parent');
                router.push({ pathname: '/share', params: { parent: '1' } });
              }}
            />
          </Section>
        ) : null}

        {!isPro ? (
          <Section header={t('result.proHeader')}>
            {lockedRow('curve', 'chart')}
            {lockedRow('plan', 'list')}
            {lockedRow('spurt', 'bolt')}
            {lockedRow('pdf', 'doc')}
          </Section>
        ) : null}

        {!isPro && preview.length ? (
          <Section header={t('result.todayPlanHeader')} footer={t('result.todayPlanFooter')}>
            {preview.map((h) => {
              const vars = planVars(summary.ageYears, child.bedtime);
              return (
                <Row
                  key={h.key}
                  icon={h.icon}
                  iconTone="soft"
                  title={resolveCopy(h.title, audience, vars)}
                  subtitle={resolveCopy(h.subtitle, audience, vars)}
                />
              );
            })}
          </Section>
        ) : null}

        <Section
          header={t('result.improveHeader')}
          footer={t('result.improveFooter')}
        >
          <Row
            title={t('result.improveMeasured')}
            subtitle={t('result.improveMeasuredSub')}
            switchValue={!child.parentHeightsSelfReported}
            onSwitch={(v) => void childrenRepo.update(child.id, { parentHeightsSelfReported: !v })}
          />
          <Row title={t('result.improveRemeasure')} subtitle={t('result.improveRemeasureSub')} accessory="chevron" onPress={() => editStep('height')} />
          {!isPro ? (
            <Row
              title={t('result.remind')}
              subtitle={t('result.remindSub')}
              accessory={remeasureAt ? 'check' : 'chevron'}
              checked={!!remeasureAt}
              disabled={!!remeasureAt}
              onPress={async () => {
                const ok = await scheduleRemeasureReminder();
                if (ok) await refreshReminders();
                if (ok) showBanner({ title: t('result.remindSet'), subtitle: t('result.remindSetSub'), icon: 'bell' });
              }}
            />
          ) : (
            <Row title={t('result.improveSecond')} subtitle={t('result.improveSecondSub')} accessory="chevron" onPress={() => router.push('/log')} />
          )}
        </Section>

        <View style={styles.caveat}>
          <Text variant="footnote" color="label2">
            {t('result.caveat')}{' '}
            <Text variant="footnote" color="tint" onPress={() => router.push('/legal/disclaimer')} accessibilityRole="link" suppressHighlighting>
              {t('result.fullDisclaimer')}
            </Text>
          </Text>
        </View>

        {!isPro ? (
          <Text variant="title3" align="center" style={styles.bridge}>
            {t('result.bridge')}
          </Text>
        ) : null}
      </ScrollView>

      {!isPro ? (
        <BottomBar hairline>
          <Button testID="get-plan" title={t('result.cta')} onPress={() => openPaywall(undefined, 'result_cta')} />
          {reveal ? (
            <Button
              testID="maybe-later"
              variant="plain"
              title={t('result.maybeLater')}
              onPress={() => router.replace('/(tabs)/today')}
            />
          ) : null}
        </BottomBar>
      ) : null}

      {reveal ? <Celebrate /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navBtn: { minWidth: minTouch, minHeight: minTouch, alignItems: 'center', justifyContent: 'center' },
  subtitle: { paddingHorizontal: space.margin, marginTop: 2, marginBottom: 14 },
  notes: { paddingHorizontal: space.margin * 2, paddingTop: 10, gap: 6 },
  caveat: { paddingHorizontal: space.margin * 2, marginTop: space.sectionGap },
  bridge: { marginTop: 28, marginHorizontal: space.margin * 2 },
});
