import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ageInYears,
  CITATIONS,
  displayPercentile,
  formatHeight,
  khamisRocheWorked,
  lookupKhamisRoche,
  ordinal,
  toIsoDate,
  type PredictionSummary,
  type Sex,
} from '@tallsoon/engine';
import { populationAdultHeightCm } from '@tallsoon/reference';

import { AppConfig } from '@/config/app-config';
import { useActiveChild, useChildModel } from '@/features/child/useChild';
import { draft, draftBirthDate } from '@/features/onboarding/draft';
import { useT } from '@/i18n';
import { engine, krSourcesCount, predictOptions } from '@/lib/engine';
import { useSettings } from '@/state/settings';
import { monoFamily, radius, space, useTheme } from '@/theme';
import { Row, Section } from '@/ui/List';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';
import { Text } from '@/ui/Text';

interface Inputs {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number | null;
  motherCm: number;
  fatherCm: number;
}

/** Uses the saved child, or the onboarding answers when opened from the research screen. */
function useMethodData(): { summary: PredictionSummary | null; inputs: Inputs | null } {
  const child = useActiveChild();
  const model = useChildModel(child);
  const onboardingDone = useSettings((s) => s.hasCompletedOnboarding);
  return useMemo(() => {
    if (onboardingDone && model?.summary && model.latest) {
      const s = model.summary;
      return {
        summary: s,
        inputs: {
          sex: model.child.sexAtBirth,
          ageYears: s.ageYears,
          heightCm: model.latest.heightCm,
          weightKg: model.weightKg,
          motherCm: model.child.motherHeightCm ?? populationAdultHeightCm.mother,
          fatherCm: model.child.fatherHeightCm ?? populationAdultHeightCm.father,
        },
      };
    }
    const d = draft();
    const birth = draftBirthDate(d);
    if (!d.sex || !birth || d.heightCm == null || (d.motherCm == null && d.fatherCm == null && !d.unknownParent)) {
      return { summary: null, inputs: null };
    }
    try {
      const today = toIsoDate(new Date());
      const mother = d.unknownParent === 'mother' ? null : d.motherCm;
      const father = d.unknownParent === 'father' ? null : d.fatherCm;
      const summary = engine.predict(
        { sex: d.sex, birthDate: birth, measuredOn: today, heightCm: d.heightCm, weightKg: d.weightSkipped ? null : d.weightKg, motherHeightCm: mother, fatherHeightCm: father },
        predictOptions(),
      );
      return {
        summary,
        inputs: {
          sex: d.sex,
          ageYears: ageInYears(birth, today),
          heightCm: d.heightCm,
          weightKg: d.weightSkipped ? null : d.weightKg,
          motherCm: mother ?? populationAdultHeightCm.mother,
          fatherCm: father ?? populationAdultHeightCm.father,
        },
      };
    } catch {
      return { summary: null, inputs: null };
    }
  }, [model, onboardingDone]);
}

function Mono({ children }: { children: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.mono, { backgroundColor: c.card }]}>
      <Text style={{ fontFamily: monoFamily, fontSize: 13, lineHeight: 20, color: c.label }} selectable>
        {children}
      </Text>
    </View>
  );
}

const n = (v: number, d = 1) => v.toFixed(d);
const signed = (coef: number, value: string, label: string) => `${coef < 0 ? '−' : '+'} ${Math.abs(coef)} × ${value} (${label})`;

export default function MethodSheet() {
  const t = useT();
  const unit = useSettings((s) => s.heightUnit);
  const { summary, inputs } = useMethodData();

  const kr = summary?.predictions.find((p) => p.method === 'khamisRoche');
  const mph = summary?.predictions.find((p) => p.method === 'midParental');
  const proj = summary?.predictions.find((p) => p.method === 'percentileProjection');
  const estimated = summary?.estimatedParent ?? null;

  let krText: string | null = null;
  if (kr && inputs && inputs.weightKg != null) {
    const look = lookupKhamisRoche(engine.khamisRocheRows, inputs.sex, inputs.ageYears);
    if (look.ok) {
      const w = khamisRocheWorked(look.row, inputs.heightCm, inputs.weightKg, inputs.motherCm, inputs.fatherCm);
      krText = [
        `${inputs.sex === 'male' ? 'boys' : 'girls'}, age ${look.row.age} row`,
        `PAS = ${look.row.intercept}`,
        `    ${signed(look.row.stature_coef, `${n(w.statureIn)} in`, 'height')}`,
        `    ${signed(look.row.weight_coef, `${n(w.weightLb)} lb`, 'weight')}`,
        `    ${signed(look.row.midparent_coef, `${n(w.midparentIn)} in`, 'midparent')}`,
        `    = ${n(w.resultIn)} in × 2.54 = ${n(w.resultCm)} cm`,
      ].join('\n');
    }
  }

  const sign = inputs?.sex === 'female' ? '−' : '+';
  const mphText = inputs
    ? `${inputs.sex === 'male' ? 'boys' : 'girls'}: (mother + father ${sign} 13) / 2\n= (${n(inputs.motherCm)} + ${n(inputs.fatherCm)} ${sign} 13) / 2\n= ${n(mph?.estimateCm ?? 0)} cm`
    : 'boys: (mother + father + 13) / 2\ngirls: (mother + father − 13) / 2';

  const generic = !summary;

  return (
    <View style={{ flex: 1 }} testID="method-sheet">
      <SheetHeader title={t('method.title')} right={{ label: t('common.done'), bold: true, onPress: () => router.back() }} />
      <SheetScroll>
        {kr || generic ? (
          <Section header={t('method.krHeader')} footer={t('method.verified', { n: krSourcesCount })}>
            <View style={styles.pad}>
              <Text variant="subhead" color="label2" style={{ marginBottom: 8 }}>
                {t('method.krIntro')}
              </Text>
              <Mono>{krText ?? 'PAS (in) = intercept\n    + a × height (in)\n    + b × weight (lb)\n    + c × midparent (in)\nresult × 2.54 = cm'}</Mono>
            </View>
            {kr ? <Row title={t('method.resultRow')} value={`${formatHeight(kr.estimateCm, unit)} ± ${n(kr.plusMinusCm)} cm`} /> : null}
          </Section>
        ) : null}
        {kr?.notes.includes('flooredAtCurrentHeight') ? (
          <Text variant="footnote" color="label2" style={styles.note}>
            {t('method.flooredNote')}
          </Text>
        ) : null}

        <Section header={t('method.mphHeader')}>
          <View style={styles.pad}>
            <Mono>{mphText}</Mono>
          </View>
          {mph ? <Row title={t('method.resultRow')} value={`${formatHeight(mph.estimateCm, unit)} ± ${n(mph.plusMinusCm)} cm`} /> : null}
        </Section>

        {estimated ? (
          <Text variant="footnote" color="label2" style={styles.note}>
            {t('method.estimatedNote', {
              parent: t(`result.lead.${estimated}`),
              height: formatHeight(populationAdultHeightCm[estimated], unit),
            })}
          </Text>
        ) : null}

        {proj && summary?.today ? (
          <Section header={t('method.projHeader')}>
            <View style={styles.pad}>
              <Text variant="subhead">
                {t('method.projBody', {
                  ordinal: ordinal(displayPercentile(summary.today.percentile)),
                  ref: summary.today.reference.toUpperCase(),
                  value: formatHeight(proj.estimateCm, unit),
                })}
              </Text>
            </View>
          </Section>
        ) : null}

        <Section header={t('method.limitsHeader')} footer={t('method.framing')}>
          <Row title={t('method.krAccuracy')} value={t('method.krAccuracyValue')} numberOfLines={2} />
          <Row title={t('method.mphAccuracy')} value={t('method.mphAccuracyValue')} />
          <Row title={t('method.validAges')} value={t('method.validAgesValue')} />
          <Row title={t('method.pubertySigns')} value={t('method.pubertySignsValue')} />
        </Section>

        <Section header={t('method.sourcesHeader')}>
          {[CITATIONS.khamisRoche, CITATIONS.midParental, CITATIONS.cdc, CITATIONS.who].map((cite) => (
            <View key={cite} style={styles.cite}>
              <Text variant="footnote" color="label2" selectable>
                {cite}
              </Text>
            </View>
          ))}
        </Section>
        <Text variant="footnote" color="label2" style={styles.note}>
          {t('legal.disclaimer', { app: AppConfig.appName })}
        </Text>
      </SheetScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.margin, paddingVertical: 12 },
  mono: { borderRadius: radius.field, padding: 0 },
  note: { paddingHorizontal: space.margin * 2, marginTop: 10 },
  cite: { paddingHorizontal: space.margin, paddingVertical: 10 },
});

