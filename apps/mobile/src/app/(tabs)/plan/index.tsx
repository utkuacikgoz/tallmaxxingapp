import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, UIManager, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { ageInYears, daysBetween } from '@tallsoon/engine';
import { ageBandFor, focusTargets, resolveCopy, routines, weekOnePlan } from '@tallsoon/content';

import { todayIso, useActiveChild } from '@/features/child/useChild';
import { openPaywall } from '@/features/paywall/open';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { useEntitlement } from '@/services/entitlements';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { radius, space, useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import { Icon, IconTile } from '@/ui/Icon';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

function DayRow({
  day,
  open,
  isToday,
  onToggle,
  focus,
  tasks,
  endsWith,
}: {
  day: number;
  open: boolean;
  isToday: boolean;
  onToggle: () => void;
  focus: string;
  tasks: string[];
  endsWith: string;
}) {
  const { c } = useTheme();
  const t = useT();
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: withTiming(open ? '90deg' : '0deg', { duration: 200 }) }] }), [open]);
  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Day ${day}, ${focus}${isToday ? `, ${t('plan.todayTag')}` : ''}`}
        android_ripple={{ color: c.fill }}
        style={({ pressed }) => [styles.dayRow, pressed && Platform.OS === 'ios' && { backgroundColor: c.fill }]}
      >
        <View style={[styles.dayTile, { backgroundColor: isToday ? c.tint : c.tintFill }]}>
          <Text variant="subhead" weight="700" style={{ color: isToday ? c.onTint : c.tint }}>
            {day}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="body">{focus}</Text>
            {isToday ? (
              <View style={[styles.tag, { backgroundColor: c.tintFill }]}>
                <Text variant="caption" weight="700" color="tint">
                  {t('plan.todayTag').toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="subhead" color="label2">
            {endsWith}
          </Text>
        </View>
        <Animated.View style={chevron}>
          <Icon name="chevronRight" size={14} color={c.label3} weight="semibold" />
        </Animated.View>
      </Pressable>
      {open ? (
        <View style={styles.tasks}>
          {tasks.map((task) => (
            <View key={task} style={styles.task}>
              <View style={[styles.bullet, { backgroundColor: c.tint }]} />
              <Text variant="subhead" style={{ flex: 1 }}>
                {task}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function PlanScreen() {
  const t = useT();
  const { c } = useTheme();
  const child = useActiveChild();
  const ent = useEntitlement();
  const role = useSettings((s) => s.role);
  const started = useSettings((s) => s.planStartedOn);
  const audience = role === 'teen' ? 'teen' : 'parent';
  const today = todayIso();
  const age = child ? ageInYears(child.birthDate, today) : 12;
  const band = ageBandFor(age);
  const dayIndex = started ? Math.max(0, daysBetween(started, today)) : 0;
  const week = Math.floor(dayIndex / 7) + 1;
  const todayDay = (dayIndex % 7) + 1;
  const [openDay, setOpenDay] = useState<number | null>(todayDay);
  const pro = ent.isPro;

  const bandRoutines = routines.filter((r) => r.bands.includes(band));

  return (
    <>
      <Stack.Screen options={{ title: t('plan.title') }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }} testID="plan">
        {pro ? (
          <Text variant="footnote" color="label2" weight="600" style={styles.kicker}>
            {t('plan.kicker', { n: week }).toUpperCase()}
          </Text>
        ) : null}

        <Section header={t('plan.focusHeader')} style={{ marginTop: pro ? 4 : 8 }}>
          {focusTargets.map((f) => (
            <Row key={f.key} icon={f.icon} iconTone="soft" title={f.label} value={`${f.value[band]} ${f.per}`} />
          ))}
        </Section>

        {pro ? (
          <Section header={t('plan.weekHeader')} separatorInset={60}>
            {weekOnePlan.map((d) => (
              <DayRow
                key={d.day}
                day={d.day}
                open={openDay === d.day}
                isToday={week === 1 && d.day === todayDay}
                focus={d.focus}
                endsWith={d.endsWith}
                tasks={d.tasks.map((task) => resolveCopy(task, audience))}
                onToggle={() => {
                  haptics.selection();
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpenDay((o) => (o === d.day ? null : d.day));
                }}
              />
            ))}
          </Section>
        ) : (
          <View style={[styles.locked, { backgroundColor: c.card }]}>
            <IconTile name="calendar" tone="soft" size={40} />
            <Text variant="subhead" color="label2" align="center">
              {t('plan.lockedBody')}
            </Text>
            <Button variant="tinted" title={t('growth.lockedCta')} onPress={() => openPaywall('plan', 'plan_locked')} fullWidth={false} />
          </View>
        )}

        <Section>
          <Row
            icon="cart"
            title={t('plan.groceries')}
            subtitle={t('plan.groceriesSub')}
            accessory={pro ? 'chevron' : 'lock'}
            onPress={() => {
              if (!pro) return openPaywall('plan', 'grocery');
              analytics.track('grocery_list_opened');
              router.push('/grocery');
            }}
          />
          <Row
            icon="book"
            title={t('plan.puberty')}
            subtitle={t('plan.pubertySub')}
            accessory={pro ? 'chevron' : 'lock'}
            onPress={() => (pro ? router.push('/guide/puberty') : openPaywall('spurt', 'puberty_guide'))}
          />
          <Row icon="ruler" title={t('plan.measure')} subtitle={t('plan.measureSub')} accessory="chevron" onPress={() => router.push('/guide/measure')} />
          {pro ? (
            <Row icon="gear" iconTone="gray" title={t('plan.personalize')} subtitle={t('plan.personalizeSub')} accessory="chevron" onPress={() => router.push('/personalize')} />
          ) : null}
        </Section>

        {pro && bandRoutines.length ? (
          <Section header={t('plan.routines')} footer={t('plan.routinesSub')}>
            {bandRoutines.map((r) => (
              <Row
                key={r.key}
                icon="stretch"
                iconTone="soft"
                title={r.title}
                subtitle={t('today.routineMinutes', { count: r.minutes })}
                accessory="chevron"
                onPress={() => router.push(`/routine/${r.key}`)}
              />
            ))}
          </Section>
        ) : null}

        <Text variant="footnote" color="label2" style={styles.footer}>
          {t('plan.sourcesFooter')} {t('plan.disclaimer')}
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  kicker: { paddingHorizontal: space.margin * 2, marginBottom: 2, letterSpacing: 0.4 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: space.margin, paddingVertical: 11, minHeight: 56 },
  dayTile: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  tasks: { paddingLeft: 60, paddingRight: space.margin, paddingBottom: 12, gap: 8 },
  task: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  locked: { marginHorizontal: space.margin, marginTop: space.sectionGap, borderRadius: radius.list, padding: 24, alignItems: 'center', gap: 10 },
  footer: { paddingHorizontal: space.margin * 2, marginTop: space.sectionGap },
});
