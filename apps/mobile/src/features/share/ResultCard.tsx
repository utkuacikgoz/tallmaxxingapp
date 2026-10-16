import { forwardRef, memo, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { formatFtIn, formatHeightRange, type HeightUnit, type PredictionSummary } from '@tallsoon/engine';

import { AppConfig } from '@/config/app-config';
import { AppIcon } from '@/features/brand/AppIcon';
import { percentileOrdinal } from '@/features/result/copy';
import { useT } from '@/i18n';
import { roundedFamily } from '@/theme';
import { Text } from '@/ui/Text';

export const CARD_W = 270;
export const CARD_H = 480;

/**
 * 9:16 story card (brief §9.3, §13.7 row 14). Nickname only: no full name, no birth date.
 * Built so a creator can screen-record it. Always says it's an estimate.
 */
export const ResultCard = memo(
  forwardRef<ComponentRef<typeof View>, { summary: PredictionSummary; unit: HeightUnit; nickname: string; sex: 'male' | 'female' }>(function ResultCard(
    { summary, unit, nickname, sex },
    ref,
  ) {
    const t = useT();
    const method = summary.lead.method === 'khamisRoche' ? 'Khamis–Roche' : summary.lead.method === 'midParental' ? 'Mid-parental height' : 'Growth curve';
    const big = unit === 'cm' ? String(Math.round(summary.estimateCm)) : formatFtIn(summary.estimateCm);
    const alt = unit === 'cm' ? formatHeightRange(summary.lowCm, summary.highCm, 'ftin') : formatHeightRange(summary.lowCm, summary.highCm, 'cm');
    const white = { color: '#FFFFFF' };
    const soft = { color: 'rgba(255,255,255,0.78)' };
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
              <Stop offset="0" stopColor="#3A9783" />
              <Stop offset="1" stopColor="#1F5A4D" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />
        </Svg>
        <View style={styles.top}>
          <AppIcon size={28} />
          <Text variant="subhead" weight="700" style={white}>
            {AppConfig.appName}
          </Text>
        </View>
        <View style={styles.mid}>
          <Text variant="subhead" style={soft}>
            {nickname ? `${nickname} · ` : ''}
            {t('share.cardLabel')}
          </Text>
          <Text style={[styles.big, { fontFamily: roundedFamily }]} adjustsFontSizeToFit numberOfLines={1}>
            {big}
            {unit === 'cm' ? <Text style={[styles.unit, { fontFamily: roundedFamily }]}> cm</Text> : null}
          </Text>
          <Text variant="headline" style={white}>
            {t('share.cardLikely', { range: formatHeightRange(summary.lowCm, summary.highCm, unit) })}
          </Text>
          <Text variant="footnote" style={soft}>
            {alt}
          </Text>
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text variant="caption" weight="700" style={white}>
                {method}
              </Text>
            </View>
            {summary.today ? (
              <View style={styles.chip}>
                <Text variant="caption" weight="700" style={white}>
                  {t('share.cardPercentile', { ordinal: percentileOrdinal(summary.today.percentile) })}
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="caption" style={[soft, { marginTop: 10 }]}>
            {t('share.cardFormula', { sign: sex === 'male' ? '+' : '−' })}
          </Text>
        </View>
        <View style={styles.bottom}>
          <Text variant="title3" style={white}>
            {t('share.cardTagline')}
          </Text>
          <Text variant="caption" style={soft}>
            {t('share.cardEstimate')}
          </Text>
          <Text variant="caption" weight="700" style={white}>
            {AppConfig.websiteHost}
          </Text>
        </View>
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  card: { width: CARD_W, height: CARD_H, borderRadius: 22, overflow: 'hidden', padding: 22, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mid: { gap: 4 },
  big: { fontSize: 76, lineHeight: 84, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  unit: { fontSize: 30, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  chip: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  bottom: { gap: 3 },
});
