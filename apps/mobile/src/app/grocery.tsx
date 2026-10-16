import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet } from 'react-native';

import { ageInYears, weekKey } from '@tallsoon/engine';
import { ageBandFor, groceryList, mealsForWeek } from '@tallsoon/content';

import { todayIso, useActiveChild } from '@/features/child/useChild';
import { useT } from '@/i18n';
import { formatDayMonth } from '@/lib/time';
import { useSettings } from '@/state/settings';
import { minTouch, space, useTheme } from '@/theme';
import { Icon } from '@/ui/Icon';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

/** Weekly grocery list grouped by aisle, from the week's meal ideas (brief §2 P13). */
export default function GroceryScreen() {
  const t = useT();
  const { c } = useTheme();
  const child = useActiveChild();
  const diet = useSettings((s) => s.diet);
  const today = todayIso();
  const monday = weekKey(today);
  const band = ageBandFor(child ? ageInYears(child.birthDate, today) : 12);
  const meals = useMemo(() => mealsForWeek(band, monday, diet), [band, monday, diet]);
  const list = useMemo(() => groceryList(meals), [meals]);

  const share = () => {
    const text = [
      t('grocery.shareTitle', { date: formatDayMonth(monday) }),
      ...list.map((g) => `\n${t(`grocery.aisles.${g.aisle}`)}\n${g.items.map((i) => `• ${i.item}`).join('\n')}`),
    ].join('\n');
    void Share.share({ message: text });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('grocery.title'),
          headerRight: () => (
            <Pressable onPress={share} accessibilityRole="button" accessibilityLabel={t('grocery.share')} hitSlop={6} style={styles.nav}>
              <Icon name="share" size={21} color={c.tint} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="subhead" color="label2" style={styles.sub}>
          {t('grocery.subtitle')} · {formatDayMonth(monday)}
        </Text>
        <Section>
          <Row
            title={t('grocery.vegetarian')}
            switchValue={diet.vegetarian}
            onSwitch={(v) => useSettings.getState().set({ diet: { ...diet, vegetarian: v } })}
          />
          <Row
            title={t('grocery.dairyFree')}
            switchValue={diet.dairyFree}
            onSwitch={(v) => useSettings.getState().set({ diet: { ...diet, dairyFree: v } })}
          />
        </Section>
        {list.map((g) => (
          <Section key={g.aisle} header={t(`grocery.aisles.${g.aisle}`)}>
            {g.items.map((i) => (
              <Row key={i.item} title={i.item} value={i.count > 1 ? `×${i.count}` : undefined} />
            ))}
          </Section>
        ))}
        <Section header={t('grocery.mealsHeader')}>
          {meals.map((m, i) => (
            <Row key={`${m.key}-${i}`} title={m.name} subtitle={m.why} value={`${m.minutes} min`} />
          ))}
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  nav: { minWidth: minTouch, minHeight: minTouch, alignItems: 'center', justifyContent: 'center' },
  sub: { paddingHorizontal: space.margin * 2, marginTop: 8 },
});
