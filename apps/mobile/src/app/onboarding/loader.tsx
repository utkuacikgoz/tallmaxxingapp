import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { draft, draftAgeYears } from '@/features/onboarding/draft';
import { commitDraft } from '@/features/onboarding/flow';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { showBanner } from '@/ui/Banner';
import { space, useTheme } from '@/theme';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

const TOTAL_MS = 3000;

/** 3 s loader with the real steps the engine runs (brief §13.5). No upsell here. */
export default function Loader() {
  const t = useT();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);
  const progress = useSharedValue(0);

  const steps = useMemo(() => {
    const d = draft();
    const age = draftAgeYears(d) ?? 10;
    const kr = !d.weightSkipped && d.weightKg != null && age >= 4 && age <= 17.5;
    return [
      t('onboarding.loader.s1'),
      kr ? t('onboarding.loader.s2') : t('onboarding.loader.s2Mph'),
      kr ? t('onboarding.loader.s3') : t('onboarding.loader.s3Curve'),
      t('onboarding.loader.s4'),
    ];
  }, [t]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: TOTAL_MS, easing: Easing.inOut(Easing.cubic) });
    const timers = steps.map((_, i) => setTimeout(() => setActive(i + 1), ((i + 1) * TOTAL_MS) / steps.length));
    let cancelled = false;
    const save = commitDraft();
    const done = setTimeout(async () => {
      try {
        await save;
        if (cancelled) return;
        analytics.track('onboarding_step_completed', { step: 'loader' });
        router.replace({ pathname: '/result', params: { reveal: '1' } });
      } catch {
        showBanner({ title: t('errors.genericTitle'), subtitle: t('errors.genericBody'), icon: 'info', tone: 'gray' });
        router.back();
      }
    }, TOTAL_MS + 150);
    // The loader can't be backed out of mid-way (Android back is swallowed).
    const sub = Platform.OS === 'android' ? BackHandler.addEventListener('hardwareBackPress', () => true) : null;
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearTimeout(done);
      sub?.remove();
    };
  }, [progress, steps, t]);

  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + 120 }]}>
      <Text variant="title1" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">
        {t('onboarding.loader.title')}
      </Text>
      <View style={[styles.track, { backgroundColor: c.fill }]}>
        <Animated.View style={[styles.fill, { backgroundColor: c.tint }, bar]} />
      </View>
      <View style={styles.list}>
        {steps.map((label, i) => {
          const done = i < active;
          const on = i === active;
          return (
            <Animated.View key={label} entering={FadeIn.delay(i * 60)} style={styles.row} accessible accessibilityLabel={label}>
              <View style={styles.status}>
                {done ? (
                  <Icon name="checkCircle" size={22} color={c.tint} />
                ) : on ? (
                  <ActivityIndicator size="small" color={c.tint} />
                ) : (
                  <Icon name="circle" size={22} color={c.label3} />
                )}
              </View>
              <Text variant="body" style={{ color: done || on ? c.label : c.label3 }}>
                {label}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.margin * 2 },
  track: { height: 6, borderRadius: 3, marginTop: 28, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  list: { marginTop: 36, gap: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  status: { width: 24, alignItems: 'center' },
});
