import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { formatHeight, type HeightUnit, type PredictionSummary } from '@tallsoon/engine';

import { useT } from '@/i18n';
import { radius, roundedFamily, space, useTheme } from '@/theme';
import { Text } from '@/ui/Text';
import { heroAlt, heroNumber, rangeText } from './copy';

/** Counts from today's height up to the prediction (~1.1 s, ease-out). Instant under Reduce Motion. */
function useCountUp(from: number, to: number, animate: boolean): number {
  const reduced = useReducedMotion();
  const [v, setV] = useState(animate && !reduced ? from : to);
  useEffect(() => {
    if (!animate || reduced) return;
    const start = Date.now();
    const duration = 1100;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, animate, reduced]);
  return !animate || reduced ? to : v;
}

export const ResultHero = memo(function ResultHero({
  summary,
  todayCm,
  unit,
  animate,
}: {
  summary: PredictionSummary;
  todayCm: number;
  unit: HeightUnit;
  animate: boolean;
}) {
  const { c } = useTheme();
  const t = useT();
  const shown = useCountUp(todayCm, summary.estimateCm, animate);
  const num = heroNumber(shown, unit);
  const range = rangeText(summary, unit);

  // Range bar scale: a little room around today's height and the range.
  const lo = Math.min(todayCm, summary.lowCm) - 6;
  const hi = summary.highCm + 6;
  const pos = (cm: number) => `${((cm - lo) / (hi - lo)) * 100}%` as const;

  const a11y = t('result.heroA11y', {
    value: formatHeight(summary.estimateCm, unit).replace('cm', 'centimeters'),
    low: formatHeight(summary.lowCm, unit).replace('cm', ''),
    high: formatHeight(summary.highCm, unit).replace('cm', 'centimeters'),
  });

  return (
    <View style={[styles.card, { backgroundColor: c.card }]} accessible accessibilityLabel={a11y} testID="result-hero">
      <Text variant="subhead" color="label2">
        {t('result.heroLabel')}
      </Text>
      <View style={styles.numberRow}>
        <Text
          style={[styles.number, { color: c.tint, fontFamily: roundedFamily }]}
          maxFontSizeMultiplier={1.3}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {num.value}
        </Text>
        {num.suffix ? (
          <Text style={[styles.suffix, { color: c.label2, fontFamily: roundedFamily }]} maxFontSizeMultiplier={1.3}>
            {num.suffix}
          </Text>
        ) : null}
      </View>
      <Text variant="body" color="label2" tabular>
        {t('result.heroSub', { alt: heroAlt(summary.estimateCm, unit), range })}
      </Text>

      <View style={styles.barWrap}>
        <View style={[styles.track, { backgroundColor: c.fill }]} />
        <View style={[styles.band, { backgroundColor: c.tint, opacity: 0.35, left: pos(summary.lowCm), right: `${100 - parseFloat(pos(summary.highCm))}%` }]} />
        <View style={[styles.today, { backgroundColor: c.label3, left: pos(todayCm) }]} />
        <View style={[styles.marker, { backgroundColor: c.tint, borderColor: c.card, left: pos(summary.estimateCm) }]} />
      </View>
      <View style={styles.barLabels}>
        <Text variant="footnote" color="label2" tabular>
          {t('result.rangeToday', { height: formatHeight(todayCm, unit) })}
        </Text>
        <Text variant="footnote" color="label2">
          {t('result.rangeLikely')}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.margin,
    borderRadius: radius.list,
    borderCurve: 'continuous',
    padding: 20,
    paddingBottom: 16,
  },
  numberRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 },
  number: { fontSize: 72, lineHeight: 80, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  suffix: { fontSize: 32, lineHeight: 40, fontWeight: '700', marginLeft: 6, marginBottom: 6 },
  barWrap: { height: 22, marginTop: 18, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 4 },
  band: { position: 'absolute', height: 8, borderRadius: 4 },
  today: { position: 'absolute', width: 2, height: 14, marginLeft: -1, borderRadius: 1 },
  marker: { position: 'absolute', width: 22, height: 22, marginLeft: -11, borderRadius: 11, borderWidth: 3 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
