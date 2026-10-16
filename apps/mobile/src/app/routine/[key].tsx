import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ageInYears } from '@tallsoon/engine';
import { ageBandFor, habitsForDay, resolveCopy, routines } from '@tallsoon/content';

import { todayIso, useActiveChild } from '@/features/child/useChild';
import { setHabit, useHabits } from '@/features/plan/useHabits';
import { useT } from '@/i18n';
import { openUrl } from '@/services/links';
import { useSettings } from '@/state/settings';
import { radius, space, useTheme } from '@/theme';
import { showBanner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { BottomBar } from '@/ui/Layout';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';
import { Text } from '@/ui/Text';

/** Follow-along routine: fitness and posture, never "stretch to get taller" (brief §12.2). */
export default function RoutineSheet() {
  const t = useT();
  const { c } = useTheme();
  const { key } = useLocalSearchParams<{ key: string }>();
  const routine = routines.find((r) => r.key === key);
  const child = useActiveChild();
  const role = useSettings((s) => s.role);
  const today = todayIso();
  const habits = useHabits(child?.id, today);
  if (!routine) return null;

  const age = child ? ageInYears(child.birthDate, today) : 12;
  const habit = habitsForDay(ageBandFor(age), today).find((h) => h.routineKey === routine.key);
  const ticked = habits.byDay.get(today) ?? new Set<string>();
  const done = habit ? ticked.has(habit.key) : false;

  const finish = async () => {
    if (child && habit && !done) {
      await setHabit(child.id, today, habit.key, true, ticked.size, 5);
      showBanner({ title: routine.title, subtitle: t('today.routineDone'), icon: 'checkCircle' });
    }
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <SheetHeader title={routine.title} close />
      <SheetScroll>
        <Text variant="subhead" color="label2" style={styles.intro}>
          {t('today.routineMinutes', { count: routine.minutes })} · {resolveCopy(routine.intro, role === 'teen' ? 'teen' : 'parent')}
        </Text>
        <View style={{ gap: 10, paddingHorizontal: space.margin, marginTop: 12 }}>
          {routine.steps.map((s, i) => (
            <View key={s.title} style={[styles.step, { backgroundColor: c.card }]}>
              <View style={[styles.num, { backgroundColor: c.tintFill }]}>
                <Text variant="subhead" weight="700" color="tint">
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text variant="headline" style={{ flexShrink: 1 }}>
                    {s.title}
                  </Text>
                  <Text variant="subhead" color="tint" weight="600" tabular>
                    {s.amount}
                  </Text>
                </View>
                <Text variant="subhead" color="label2">
                  {s.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text variant="footnote" color="tint" style={styles.source} onPress={() => void openUrl(routine.source.url)} accessibilityRole="link">
          {routine.source.label}
        </Text>
        <Text variant="footnote" color="label2" style={styles.source}>
          {t('plan.disclaimer')}
        </Text>
      </SheetScroll>
      {habit ? (
        <BottomBar style={{ backgroundColor: c.sheetBg }}>
          <Button title={done ? t('common.done') : t('today.routineDone')} onPress={() => void finish()} />
        </BottomBar>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: space.margin * 2, marginTop: 4 },
  step: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.list, borderCurve: 'continuous' },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  source: { paddingHorizontal: space.margin * 2, marginTop: 14 },
});
