import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { addDays, ageInYears, weekKey } from '@tallsoon/engine';
import { ageBandFor, currentSeasonalPack, habitsForDay, resolveCopy, tipForDay, type Habit } from '@tallsoon/content';

import { ChildSwitcher } from '@/features/child/ChildSwitcher';
import { todayIso, useActiveChild } from '@/features/child/useChild';
import { openPaywall } from '@/features/paywall/open';
import { rememberBest, setHabit, useHabits } from '@/features/plan/useHabits';
import { planVars } from '@/features/plan/vars';
import { useT } from '@/i18n';
import { useEntitlement } from '@/services/entitlements';
import { haptics } from '@/services/haptics';
import { openUrl } from '@/services/links';
import { useSettings } from '@/state/settings';
import { minTouch, radius, space, useTheme } from '@/theme';
import { showBanner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Celebrate } from '@/ui/Celebrate';
import { Icon, IconTile } from '@/ui/Icon';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function StreakCard({ count, best, week, today }: { count: number; best: number; week: Array<'done' | 'rest' | 'open'>; today: number }) {
  const t = useT();
  const { c } = useTheme();
  return (
    <View style={[styles.card, styles.streak, { backgroundColor: c.card }]}>
      <IconTile name="flame" tone="accent" size={40} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline" style={{ fontSize: 20 }}>
          {count > 0 ? t('today.streak', { count }) : t('today.streakZero')}
        </Text>
        <Text variant="subhead" color="label2">
          {best > count ? t('today.streakBest', { count: best }) : t('today.streakSub')}
        </Text>
      </View>
      <View style={styles.dots} accessibilityRole="text">
        {week.map((state, i) => (
          <View
            key={i}
            style={styles.dotCol}
            accessible
            accessibilityLabel={t('today.weekdayA11y', {
              day: WEEKDAY_NAMES[i],
              state: t(state === 'done' ? 'today.weekdayDone' : state === 'rest' ? 'today.weekdayRest' : 'today.weekdayOpen'),
            })}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: state === 'done' ? c.accent : c.fill },
                i === today && { borderWidth: 2, borderColor: state === 'done' ? c.accentText : c.label3 },
              ]}
            >
              {state === 'done' ? <Icon name="check" size={11} color="#FFFFFF" weight="bold" /> : null}
              {state === 'rest' ? <Icon name="moon" size={10} color={c.label2} /> : null}
            </View>
            <Text variant="caption" color="label2">
              {WEEKDAYS[i]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function HabitRow({
  habit,
  done,
  vars,
  audience,
  disabled,
  onToggle,
}: {
  habit: Habit;
  done: boolean;
  vars: Record<string, string>;
  audience: 'parent' | 'teen';
  disabled?: boolean;
  onToggle: () => void;
}) {
  const { c } = useTheme();
  const title = resolveCopy(habit.title, audience, vars);
  const subtitle = resolveCopy(habit.subtitle, audience, vars);
  return (
    <Pressable
      testID={`habit-${habit.key}`}
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done, disabled: !!disabled }}
      accessibilityLabel={`${title}. ${subtitle}`}
      android_ripple={{ color: c.fill }}
      style={({ pressed }) => [styles.habit, pressed && { backgroundColor: c.fill }]}
    >
      <IconTile name={habit.icon} tone="tint" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" style={{ color: done ? c.label2 : c.label }}>
          {title}
        </Text>
        <Text variant="subhead" color="label2">
          {subtitle}
        </Text>
      </View>
      <View style={styles.checkHit}>
        {done ? <Icon name="checkCircle" size={28} color={c.tint} /> : <Icon name="circle" size={28} color={c.label3} weight="light" />}
      </View>
    </Pressable>
  );
}

export default function TodayScreen() {
  const t = useT();
  const { c } = useTheme();
  const child = useActiveChild();
  const ent = useEntitlement();
  const role = useSettings((s) => s.role);
  const audience = role === 'teen' ? 'teen' : 'parent';
  const today = todayIso();
  const yesterday = addDays(today, -1);
  const habitsModel = useHabits(child?.id, today);
  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const [celebrate, setCelebrate] = useState(0);

  const age = child ? ageInYears(child.birthDate, today) : 12;
  const vars = useMemo(() => planVars(age, child?.bedtime ?? null), [age, child?.bedtime]);
  const activeDay = day === 'today' ? today : yesterday;
  const dayHabits = useMemo(() => habitsForDay(ageBandFor(age), activeDay), [age, activeDay]);
  const tip = tipForDay(today);
  const pack = currentSeasonalPack(today);

  const readOnly = !ent.isPro && ent.hadPro;
  const visible = ent.isPro || readOnly ? dayHabits : dayHabits.slice(0, 3);
  const ticked = habitsModel.byDay.get(activeDay) ?? new Set<string>();
  const doneCount = visible.filter((h) => ticked.has(h.key)).length;

  // Streak repair: tick yesterday's habits before noon (brief §12.4).
  const yesterdayCount = (habitsModel.byDay.get(yesterday)?.size ?? 0);
  const canRepair = ent.isPro && new Date().getHours() < 12 && yesterdayCount < 3 && !habitsModel.streak.restDays.includes(yesterday);

  useEffect(() => {
    if (child) rememberBest(child.id, habitsModel.streak.best);
  }, [child, habitsModel.streak.best]);

  // This week's dots, Monday first.
  const monday = weekKey(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    if ((habitsModel.byDay.get(d)?.size ?? 0) >= 3) return 'done' as const;
    if (habitsModel.streak.restDays.includes(d)) return 'rest' as const;
    return 'open' as const;
  });
  const todayIndex = (new Date().getDay() + 6) % 7;

  const toggle = async (h: Habit) => {
    if (!child || readOnly) return;
    const done = !ticked.has(h.key);
    haptics.light();
    const outcome = await setHabit(child.id, activeDay, h.key, done, doneCount, visible.length);
    if (!ent.isPro) return;
    if (outcome === 'streak' && day === 'today') {
      haptics.success();
      setCelebrate((n) => n + 1);
      showBanner({ title: t('today.streakBanner', { count: habitsModel.streak.current + 1 }), subtitle: t('today.streakBannerSub'), icon: 'flame', tone: 'accent' });
    } else if (outcome === 'allDone') {
      showBanner({ title: t('today.allDone'), subtitle: t('today.allDoneSub'), icon: 'sparkles' });
    }
  };

  const dateKicker = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const routineHabit = dayHabits.find((h) => h.routineKey);

  return (
    <>
      <Stack.Screen options={{ title: t('today.title'), headerRight: () => <ChildSwitcher /> }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }} testID="today">
        <Text variant="footnote" color="label2" weight="600" style={styles.kicker}>
          {dateKicker}
        </Text>

        {readOnly ? (
          <View style={[styles.card, { backgroundColor: c.card, gap: 10, marginBottom: 12 }]}>
            <Text variant="subhead" color="label2">
              {t('today.readOnly')}
            </Text>
            <Button variant="tinted" title={t('today.resume')} onPress={() => openPaywall('plan', 'lapsed')} />
          </View>
        ) : null}

        {ent.isPro || readOnly ? (
          <StreakCard count={habitsModel.streak.current} best={habitsModel.streak.best} week={week} today={todayIndex} />
        ) : null}

        {canRepair ? (
          <View style={{ paddingHorizontal: space.margin, marginTop: 16, gap: 8 }}>
            <Text variant="footnote" color="label2" style={{ paddingHorizontal: space.margin }}>
              {t('today.repair')}
            </Text>
            <View style={[styles.toggle, { backgroundColor: c.fill2 }]}>
              {(['today', 'yesterday'] as const).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDay(d)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: day === d }}
                  style={[styles.toggleSeg, day === d && { backgroundColor: c.cardElevated }]}
                >
                  <Text variant="subhead" weight={day === d ? '600' : '400'}>
                    {d === 'today' ? t('common.today') : t('today.yesterday')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Section
          header={ent.isPro || readOnly ? t('today.habitsHeader') : t('today.previewHeader')}
          headerRight={t('today.habitsCount', { done: doneCount, total: visible.length })}
          footer={ent.isPro ? t('today.habitsFooter') : readOnly ? undefined : t('today.previewFooter')}
          separatorInset={60}
        >
          {visible.map((h) => (
            <HabitRow
              key={h.key}
              habit={h}
              done={ticked.has(h.key)}
              vars={vars}
              audience={audience}
              disabled={readOnly}
              onToggle={() => void toggle(h)}
            />
          ))}
        </Section>

        {!ent.isPro && !readOnly ? (
          <View style={[styles.card, { backgroundColor: c.card, marginTop: 16, gap: 12 }]}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <IconTile name="leaf" tone="tint" size={36} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{t('today.planReady')}</Text>
                <Text variant="subhead" color="label2">
                  {t('today.planReadySub')}
                </Text>
              </View>
            </View>
            <Button title={t('today.unlockPlan')} onPress={() => openPaywall('plan', 'today_card')} testID="today-unlock" />
          </View>
        ) : null}

        {ent.isPro && routineHabit?.routineKey ? (
          <Section>
            <Row
              icon="stretch"
              iconTone="soft"
              title={t('today.startRoutine')}
              subtitle={resolveCopy(routineHabit.subtitle, audience, vars)}
              accessory="chevron"
              onPress={() => router.push(`/routine/${routineHabit.routineKey}`)}
            />
            <Row
              icon="chart"
              iconTone="soft"
              title={t('today.score')}
              subtitle={t('today.scoreSub')}
              value={String(habitsModel.score.score)}
              accessory="chevron"
              onPress={() => router.push('/score')}
            />
          </Section>
        ) : null}

        <Section header={t('today.whyHeader')}>
          <View style={styles.tip}>
            <Text variant="headline">{tip.title}</Text>
            <Text variant="subhead" color="label2">
              {resolveCopy(tip.body, audience, vars)}
            </Text>
            <Pressable onPress={() => void openUrl(tip.source.url)} accessibilityRole="link" hitSlop={6} style={{ minHeight: minTouch, justifyContent: 'center' }}>
              <Text variant="footnote" color="tint">
                {tip.source.label}
              </Text>
            </Pressable>
          </View>
        </Section>

        {pack && ent.isPro ? (
          <Section header={`${t('today.seasonal')} · ${pack.title}`} footer={pack.subtitle}>
            {pack.tips.map((p) => (
              <Row key={p.key} title={p.title} subtitle={resolveCopy(p.body, audience, vars)} />
            ))}
          </Section>
        ) : null}
      </ScrollView>
      {celebrate ? <Celebrate key={celebrate} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  kicker: { paddingHorizontal: space.margin * 2, marginBottom: 10, letterSpacing: 0.4 },
  card: { marginHorizontal: space.margin, borderRadius: radius.list, borderCurve: 'continuous', padding: 16 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dots: { flexDirection: 'row', gap: 5 },
  dotCol: { alignItems: 'center', gap: 4 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  habit: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: space.margin, paddingVertical: 11, minHeight: 60 },
  checkHit: { width: minTouch, height: minTouch, alignItems: 'flex-end', justifyContent: 'center' },
  tip: { padding: space.margin, gap: 6 },
  toggle: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  toggleSeg: { flex: 1, minHeight: 32, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});
