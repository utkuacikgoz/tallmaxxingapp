import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ageInYears, toIsoDate } from '@tallsoon/engine';

import { childrenRepo } from '@/db/repo';
import { refreshReminders } from '@/features/app/lifecycle';
import { useActiveChild } from '@/features/child/useChild';
import { useT } from '@/i18n';
import { formatClock } from '@/lib/time';
import { haptics } from '@/services/haptics';
import { requestNotificationPermission } from '@/services/notifications';
import { useSettings } from '@/state/settings';
import { space, useTheme } from '@/theme';
import { showBanner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { BottomBar } from '@/ui/Layout';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

/** Lights-out options by age band (brief §13.7 row 18 lists the teen set). */
function bedtimeOptions(age: number): string[] {
  if (age < 9) return ['19:30', '20:00', '20:30', '21:00'];
  if (age < 13) return ['20:30', '21:00', '21:30', '22:00'];
  return ['21:00', '21:30', '22:00', '22:30'];
}

/** "You're in!": bedtime + reminder, then the in-context notification ask (brief §12.4). */
export default function Success() {
  const t = useT();
  const { c } = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const child = useActiveChild();
  const [bedtime, setBedtime] = useState<string | null>(null);
  const [remind, setRemind] = useState(true);
  const [busy, setBusy] = useState(false);
  const age = child ? ageInYears(child.birthDate, toIsoDate(new Date())) : 13;

  const start = async () => {
    if (!bedtime || !child) return;
    setBusy(true);
    await childrenRepo.update(child.id, { bedtime });
    const s = useSettings.getState();
    if (!s.planStartedOn) s.set({ planStartedOn: toIsoDate(new Date()) });
    if (remind) {
      const result = await requestNotificationPermission();
      const granted = result === 'granted';
      s.set({ reminders: { ...s.reminders, bedtime: granted, morning: granted, checkin: granted } });
      if (granted) {
        await refreshReminders();
        showBanner({ title: t('success.reminderSet'), subtitle: t('success.reminderSetSub', { time: formatClock(bedtime) }), icon: 'moon' });
      }
    } else {
      s.set({ reminders: { ...s.reminders, bedtime: false, morning: false, checkin: false } });
    }
    haptics.success();
    router.replace('/(tabs)/today');
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]} testID="success">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: 24 }}>
        <Animated.View entering={reducedMotion ? undefined : ZoomIn.springify().damping(14)} style={styles.check}>
          <Icon name="checkCircle" size={64} color={c.tint} />
        </Animated.View>
        <Text variant="title1" align="center" accessibilityRole="header" style={styles.title}>
          {t('success.title')}
        </Text>
        <Text variant="body" color="label2" align="center" style={styles.body}>
          {t('success.body')}
        </Text>

        <Section header={t('success.bedtimeHeader')} footer={t('success.bedtimeFooter')}>
          {bedtimeOptions(age).map((time) => (
            <Row
              key={time}
              testID={`bedtime-${time}`}
              title={formatClock(time)}
              accessory="check"
              checked={bedtime === time}
              onPress={() => {
                haptics.light();
                setBedtime(time);
              }}
            />
          ))}
        </Section>

        <Section footer={t('success.remindFooter')}>
          <Row title={t('success.remind')} switchValue={remind} onSwitch={setRemind} />
        </Section>

        <Text variant="footnote" color="label2" style={styles.framing}>
          {t('personalize.framing')}
        </Text>
      </ScrollView>
      <BottomBar>
        <Button testID="start-plan" title={t('success.cta')} disabled={!bedtime} loading={busy} onPress={() => void start()} />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  check: { alignItems: 'center' },
  title: { marginTop: 16 },
  body: { marginTop: 8, paddingHorizontal: space.margin * 2 },
  framing: { paddingHorizontal: space.margin * 2, marginTop: space.sectionGap },
});
