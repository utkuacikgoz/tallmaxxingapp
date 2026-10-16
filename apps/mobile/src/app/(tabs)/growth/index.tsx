import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  ageInYears,
  buildGrowthChart,
  displayPercentile,
  formatHeight,
  formatHeightRange,
  ordinal,
  type HistoryPoint,
  type ReferenceId,
} from '@tallsoon/engine';

import { ChildSwitcher } from '@/features/child/ChildSwitcher';
import { useActiveChild, useChildModel } from '@/features/child/useChild';
import { GrowthChart } from '@/features/growth/GrowthChart';
import { openPaywall } from '@/features/paywall/open';
import { useT } from '@/i18n';
import { engine } from '@/lib/engine';
import { formatShortDate } from '@/lib/time';
import { analytics } from '@/services/analytics';
import { useEntitlement } from '@/services/entitlements';
import { exportPdf } from '@/services/pdf';
import { useSettings } from '@/state/settings';
import { minTouch, radius, space, useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import { Icon, IconTile } from '@/ui/Icon';
import { Row, Section } from '@/ui/List';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Text } from '@/ui/Text';

function methodName(m: string) {
  return m === 'khamisRoche' ? 'Khamis–Roche' : m === 'midParental' ? 'Mid-parental' : 'Growth curve';
}

function Sparkline({ points }: { points: HistoryPoint[] }) {
  const { c } = useTheme();
  const w = 120;
  const h = 34;
  const vals = points.flatMap((p) => [p.lowCm, p.highCm]);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const x = (i: number) => (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
  const y = (v: number) => h - ((v - lo) / Math.max(1, hi - lo)) * h;
  const est = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.estimateCm)}`).join(' ');
  const band = `${points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.highCm)}`).join(' ')} ${[...points]
    .reverse()
    .map((p, i) => `L${x(points.length - 1 - i)},${y(p.lowCm)}`)
    .join(' ')} Z`;
  return (
    <Svg width={w} height={h}>
      <Path d={band} fill={c.tintFill} />
      <Path d={est} stroke={c.tint} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export default function GrowthScreen() {
  const t = useT();
  const { c } = useTheme();
  const child = useActiveChild();
  const model = useChildModel(child);
  const ent = useEntitlement();
  const unit = useSettings((s) => s.heightUnit);
  const reference = useSettings((s) => s.reference);
  const [table, setTable] = useState(false);
  const [exporting, setExporting] = useState(false);
  const canView = ent.isPro || ent.hadPro;
  const canLog = ent.isPro;

  const chart = useMemo(
    () =>
      model && canView
        ? buildGrowthChart({
            engine,
            sex: model.child.sexAtBirth,
            birthDate: model.child.birthDate,
            reference,
            measurements: model.measurements,
            summary: model.summary,
          })
        : null,
    [model, canView, reference],
  );

  if (!child || !model) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  const s = model.summary;
  const latestPct = chart?.measurements[chart.measurements.length - 1]?.percentile;

  const doExport = async () => {
    if (!ent.isPro && !ent.hadPro) return openPaywall('pdf', 'growth_pdf');
    setExporting(true);
    try {
      await exportPdf(model);
      analytics.track('pdf_exported');
    } finally {
      setExporting(false);
    }
  };

  const headerRight = () => (
    <View style={styles.headerBtns}>
      <Pressable
        onPress={() => void doExport()}
        disabled={exporting}
        accessibilityRole="button"
        accessibilityLabel={t('growth.pdfA11y')}
        hitSlop={6}
        style={styles.navBtn}
      >
        <Icon name="doc" size={21} color={exporting ? c.label3 : c.tint} />
      </Pressable>
      <Pressable
        testID="growth-add"
        onPress={() => (canLog ? router.push('/log') : openPaywall('measure', 'growth_add'))}
        accessibilityRole="button"
        accessibilityLabel={t('growth.addA11y')}
        hitSlop={6}
        style={styles.navBtn}
      >
        <Icon name="plus" size={22} color={c.tint} weight="semibold" />
      </Pressable>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('growth.title'), headerRight, headerLeft: () => <ChildSwitcher /> }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }} testID="growth">
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Pressable
            onPress={() => router.push('/result')}
            accessibilityRole="button"
            accessibilityLabel={s ? `${t('growth.predicted')} ${formatHeight(s.estimateCm, unit)}, ${t('growth.predictedSub', { range: formatHeightRange(s.lowCm, s.highCm, unit), method: methodName(s.lead.method) })}` : undefined}
            style={({ pressed }) => [styles.predRow, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subhead" color="label2">
                {t('growth.predicted')}
              </Text>
              {s ? (
                <>
                  <Text variant="title2" color="tint" rounded tabular>
                    {formatHeight(s.estimateCm, unit)}
                  </Text>
                  <Text variant="subhead" color="label2">
                    {t('growth.predictedSub', { range: formatHeightRange(s.lowCm, s.highCm, unit), method: methodName(s.lead.method) })}
                  </Text>
                </>
              ) : null}
            </View>
            <Icon name="chevronRight" size={14} color={c.label3} weight="semibold" />
          </Pressable>

          {chart ? (
            <>
              <View style={[styles.sep, { backgroundColor: c.separator }]} />
              <View style={{ paddingHorizontal: 8, paddingTop: 10 }}>
                <SegmentedControl<ReferenceId>
                  options={[
                    { value: 'cdc', label: 'CDC' },
                    { value: 'who', label: 'WHO' },
                  ]}
                  value={reference}
                  onChange={(r) => useSettings.getState().set({ reference: r })}
                  style={{ marginHorizontal: 8, marginBottom: 6 }}
                />
                {table ? (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
                    <View style={styles.tableRow}>
                      {[t('growth.tableDate'), t('growth.tableAge'), t('growth.tableHeight'), t('growth.tablePercentile')].map((h) => (
                        <Text key={h} variant="footnote" color="label2" style={styles.tableCell}>
                          {h}
                        </Text>
                      ))}
                    </View>
                    {[...chart.measurements].reverse().map((m) => (
                      <View key={m.date} style={styles.tableRow}>
                        <Text variant="subhead" style={styles.tableCell}>
                          {formatShortDate(m.date)}
                        </Text>
                        <Text variant="subhead" style={styles.tableCell} tabular>
                          {m.ageYears.toFixed(1)}
                        </Text>
                        <Text variant="subhead" style={styles.tableCell} tabular>
                          {formatHeight(m.heightCm, unit)}
                        </Text>
                        <Text variant="subhead" style={styles.tableCell} tabular>
                          {m.percentile != null ? ordinal(displayPercentile(m.percentile)) : '–'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View
                    accessible
                    accessibilityRole="image"
                    accessibilityLabel={
                      latestPct != null
                        ? t('growth.chartA11y', { count: chart.measurements.length, ordinal: ordinal(displayPercentile(latestPct)) })
                        : t('growth.chartA11yNoPct', { count: chart.measurements.length })
                    }
                  >
                    <GrowthChart data={chart} unit={unit} />
                  </View>
                )}
                <View style={styles.legend}>
                  <Legend color={c.accent} label={t('growth.legendMeasurements')} dot />
                  <Legend color={c.tint} label={t('growth.legendProjection')} />
                  <Legend color={c.tintFill} label={t('growth.legendRange')} block />
                  <Legend color={c.label3} label={`${t('growth.legendPercentiles')} (${chart.reference.toUpperCase()})`} />
                </View>
                <Pressable onPress={() => setTable((v) => !v)} accessibilityRole="button" style={styles.tableToggle}>
                  <Icon name={table ? 'chart' : 'table'} size={15} color={c.tint} />
                  <Text variant="subhead" color="tint">
                    {table ? t('growth.showChart') : t('growth.showTable')}
                  </Text>
                </Pressable>
              </View>
              <View style={[styles.sep, { backgroundColor: c.separator }]} />
              <Row
                icon="bolt"
                iconTone="soft"
                title={t('growth.speed')}
                subtitle={model.velocity ? t('growth.speedSub', { date: formatShortDate(model.velocity.fromDate) }) : t('growth.speedNeedMore')}
                value={model.velocity ? t('growth.speedValue', { value: model.velocity.cmPerYear.toFixed(1) }) : undefined}
              />
            </>
          ) : null}
        </View>

        {canView && model.velocity && model.velocity.status !== 'typical' ? (
          <View style={[styles.alert, { backgroundColor: model.velocity.status === 'fast' ? c.tintFill : c.accentFill }]}>
            <Text variant="headline">{model.velocity.status === 'fast' ? t('growth.spurtTitle') : t('growth.slowTitle')}</Text>
            <Text variant="subhead" color="label2">
              {model.velocity.status === 'fast' ? t('growth.spurtBody') : t('growth.slowBody')}
            </Text>
            <Text variant="footnote" color="label2">
              {t('growth.speedTypical', { value: model.velocity.typicalCmPerYear.toFixed(1) })}
            </Text>
          </View>
        ) : null}

        {!canView ? (
          <View style={[styles.card, styles.locked, { backgroundColor: c.card }]}>
            <IconTile name="lock" tone="soft" size={40} />
            <Text variant="headline" align="center">
              {t('growth.lockedTitle')}
            </Text>
            <Text variant="subhead" color="label2" align="center">
              {t('growth.lockedBody')}
            </Text>
            <Button variant="tinted" title={t('growth.lockedCta')} onPress={() => openPaywall('curve', 'growth_locked')} fullWidth={false} />
          </View>
        ) : null}

        {canView && model.history.length > 1 ? (
          <Section header={t('growth.historyHeader')} footer={t('growth.historyFooter')}>
            <View style={styles.history}>
              <Sparkline points={model.history} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text variant="subhead" color="label2">
                  {formatShortDate(model.history[0]!.date)}: {formatHeight(model.history[0]!.estimateCm, unit)}
                </Text>
                <Text variant="subhead">
                  {formatShortDate(model.history[model.history.length - 1]!.date)}: {formatHeight(model.history[model.history.length - 1]!.estimateCm, unit)}
                </Text>
              </View>
            </View>
          </Section>
        ) : null}

        <Section header={t('growth.measurementsHeader')} footer={canLog ? t('growth.measurementsFooter') : !canView ? undefined : t('growth.readOnly')}>
          {model.measurements.map((m) => (
            <Row
              key={m.id}
              testID={`measurement-${m.date}`}
              title={formatShortDate(m.date)}
              subtitle={t('growth.ageAt', { age: ageInYears(child.birthDate, m.date).toFixed(1) })}
              value={formatHeight(m.heightCm, unit)}
              accessory={canLog ? 'chevron' : 'none'}
              onPress={canLog ? () => router.push({ pathname: '/log', params: { id: m.id } }) : undefined}
            />
          ))}
          {canLog ? (
            <Row testID="log-row" title={t('growth.logRow')} tint onPress={() => router.push('/log')} />
          ) : !canView ? (
            <Row
              title={t('growth.updateHeight')}
              subtitle={t('growth.updateHeightSub')}
              tint
              onPress={() => router.push({ pathname: '/log', params: { replace: '1' } })}
            />
          ) : null}
        </Section>
      </ScrollView>
    </>
  );
}

function Legend({ color, label, dot, block }: { color: string; label: string; dot?: boolean; block?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={
          dot
            ? { width: 9, height: 9, borderRadius: 5, backgroundColor: color }
            : block
              ? { width: 12, height: 10, borderRadius: 2, backgroundColor: color }
              : { width: 14, height: 2.5, borderRadius: 1, backgroundColor: color }
        }
      />
      <Text variant="caption" color="label2">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBtns: { flexDirection: 'row', gap: 4 },
  navBtn: { minWidth: minTouch - 8, minHeight: minTouch, alignItems: 'center', justifyContent: 'center' },
  card: { marginHorizontal: space.margin, borderRadius: radius.list, borderCurve: 'continuous', overflow: 'hidden' },
  predRow: { flexDirection: 'row', alignItems: 'center', padding: space.margin, gap: 8 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: space.margin },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 8, paddingTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tableToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: minTouch, paddingHorizontal: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 6 },
  tableCell: { flex: 1 },
  alert: { marginHorizontal: space.margin, marginTop: 16, borderRadius: radius.list, padding: space.margin, gap: 4 },
  locked: { marginTop: 16, padding: 24, alignItems: 'center', gap: 8 },
  history: { flexDirection: 'row', alignItems: 'center', padding: space.margin, gap: 12 },
});
