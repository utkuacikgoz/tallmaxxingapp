import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { todayIso, useActiveChild } from '@/features/child/useChild';
import { useHabits } from '@/features/plan/useHabits';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { radius, roundedFamily, space, useTheme } from '@/theme';
import { Section } from '@/ui/List';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';
import { Text } from '@/ui/Text';

/** Growth Habits Score: habits only, never a height claim (brief §12.3). */
export default function ScoreSheet() {
  const t = useT();
  const { c } = useTheme();
  const child = useActiveChild();
  const { score, lastWeekScore } = useHabits(child?.id, todayIso());
  useEffect(() => analytics.track('habit_score_viewed'), []);

  const bars: Array<[keyof typeof score.parts, string]> = [
    ['sleep', t('score.sleep')],
    ['activity', t('score.activity')],
    ['nutrition', t('score.nutrition')],
    ['consistency', t('score.consistency')],
  ];

  return (
    <View style={{ flex: 1 }}>
      <SheetHeader title={t('score.title')} right={{ label: t('common.done'), bold: true, onPress: () => router.back() }} />
      <SheetScroll>
        <View style={styles.hero} accessible accessibilityLabel={`${t('score.title')}: ${score.score} of 100`}>
          <Text style={[styles.big, { color: c.tint, fontFamily: roundedFamily }]}>{score.score}</Text>
          <Text variant="subhead" color="label2">
            {t('score.lastWeek', { score: lastWeekScore.score })}
          </Text>
        </View>
        <Text variant="footnote" color="label2" align="center" style={{ paddingHorizontal: space.margin * 2 }}>
          {t('score.explainer')}
        </Text>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          {bars.map(([k, label]) => (
            <View key={k} style={{ gap: 6 }} accessible accessibilityLabel={`${label}: ${Math.round(score.parts[k] * 100)}%`}>
              <View style={styles.barHead}>
                <Text variant="subhead">{label}</Text>
                <Text variant="subhead" color="label2" tabular>
                  {Math.round(score.parts[k] * 100)}%
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: c.fill }]}>
                <View style={[styles.fill, { backgroundColor: c.tint, width: `${Math.round(score.parts[k] * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>
        <Section header={t('score.tipHeader')}>
          <View style={{ padding: space.margin }}>
            <Text variant="body">{t(`score.weakest.${score.weakest}`)}</Text>
          </View>
        </Section>
      </SheetScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 12 },
  big: { fontSize: 64, lineHeight: 72, fontWeight: '700' },
  card: { marginHorizontal: space.margin, marginTop: 20, borderRadius: radius.list, padding: space.margin, gap: 16 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
