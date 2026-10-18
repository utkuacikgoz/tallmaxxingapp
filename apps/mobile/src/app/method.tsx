import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ageInYears,
  CITATIONS,
  displayPercentile,
  formatHeight,
  formatHeightRange,
  formatPlusMinus,
  khamisRocheWorked,
  lookupKhamisRoche,
  ordinal,
  toIsoDate,
  type MethodId,
  type Prediction,
  type PredictionSummary,
  type Sex,
} from '@tallsoon/engine';
import { populationAdultHeightCm } from '@tallsoon/reference';

import { AppConfig } from '@/config/app-config';
import { useActiveChild, useChildModel } from '@/features/child/useChild';
import { draft, draftBirthDate } from '@/features/onboarding/draft';
import { useT } from '@/i18n';
import { engine, krSourcesCount, predictOptions } from '@/lib/engine';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { monoFamily, radius, space, useTheme } from '@/theme';
import { Icon } from '@/ui/Icon';
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

interface MethodDefinition {
  id: MethodId;
  titleKey: string;
  descriptionKey: string;
  calculationIntroKey: string;
  formulaKey: string;
}

const METHODS: MethodDefinition[] = [
  {
    id: 'khamisRoche',
    titleKey: 'method.krHeader',
    descriptionKey: 'method.krDescription',
    calculationIntroKey: 'method.krIntro',
    formulaKey: 'method.krFormula',
  },
  {
    id: 'midParental',
    titleKey: 'method.mphHeader',
    descriptionKey: 'method.mphDescription',
    calculationIntroKey: 'method.mphIntro',
    formulaKey: 'method.mphFormula',
  },
  {
    id: 'percentileProjection',
    titleKey: 'method.projHeader',
    descriptionKey: 'method.projDescription',
    calculationIntroKey: 'method.projIntro',
    formulaKey: 'method.projFormula',
  },
];

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
    <View style={[styles.mono, { backgroundColor: c.fill }]}>
      <Text style={{ fontFamily: monoFamily, fontSize: 13, lineHeight: 20, color: c.label }} selectable>
        {children}
      </Text>
    </View>
  );
}

export function CalculationDisclosure({
  method,
  title,
  intro,
  formula,
  footer,
}: {
  method: MethodId;
  title: string;
  intro: string;
  formula: string;
  footer?: string;
}) {
  const t = useT();
  const { c } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    haptics.selection();
    setExpanded((value) => !value);
  };

  return (
    <View>
      <Pressable
        testID={`method-calculation-${method}`}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={t(expanded ? 'method.hideCalculation' : 'method.viewCalculation', { method: title })}
        accessibilityState={{ expanded }}
        android_ripple={{ color: c.fill }}
        style={({ pressed }) => [styles.disclosure, pressed && { backgroundColor: c.fill }]}
      >
        <Text variant="body" color="tint" style={styles.disclosureText}>
          {t(expanded ? 'method.hideCalculation' : 'method.viewCalculation', { method: title })}
        </Text>
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={16} color={c.label2} />
      </Pressable>
      {expanded ? (
        <View style={styles.expanded}>
          <Text variant="subhead" color="label2">{intro}</Text>
          <Mono>{formula}</Mono>
          {footer ? <Text variant="footnote" color="label2">{footer}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function unavailableMessage(method: MethodId, summary: PredictionSummary | null, t: ReturnType<typeof useT>) {
  if (!summary) return t('method.resultsAfterSetup');
  if (method === 'khamisRoche') {
    if (summary.fallback === 'noWeight') return t('method.noWeight');
    if (summary.fallback === 'underFour') return t('method.underFour');
    if (summary.fallback === 'overKhamisRocheAge') return t('method.overAge');
    if (summary.fallback === 'coefficientsUnverified') return t('method.unverified');
    if (summary.fallback === 'parentUnknownDisabled') return t('method.parentRequired');
  }
  if (method === 'midParental' && summary.fallback === 'parentUnknownDisabled') return t('method.parentRequired');
  if (method === 'percentileProjection' && summary.ageYears < 4) return t('method.projectionUnderFour');
  return t('method.notAvailable');
}

function MethodCard({
  definition,
  prediction,
  summary,
  unit,
  formula,
  t,
  calculationFooter,
}: {
  definition: MethodDefinition;
  prediction?: Prediction;
  summary: PredictionSummary | null;
  unit: 'cm' | 'ftin';
  formula: string;
  t: ReturnType<typeof useT>;
  calculationFooter?: string;
}) {
  const title = t(definition.titleKey);
  const description =
    definition.id === 'percentileProjection' && summary?.today && prediction
      ? t('method.projBody', {
          ordinal: ordinal(displayPercentile(summary.today.percentile)),
          ref: summary.today.reference.toUpperCase(),
          value: formatHeight(prediction.estimateCm, unit),
        })
      : t(definition.descriptionKey);

  return (
    <Section header={title}>
      <View style={styles.cardBody}>
        <Text variant="body" color="label2">{description}</Text>
        {prediction ? (
          <View style={styles.range}>
            <Text variant="caption" color="label2">{t('method.methodEstimate')}</Text>
            <Text variant="title3" color="tint" tabular>{formatHeight(prediction.estimateCm, unit)}</Text>
            <Text variant="caption" color="label2" style={styles.rangeLabel}>{t('method.rangeShort')}</Text>
            <Text variant="headline" color="label" tabular>{formatHeightRange(prediction.lowCm, prediction.highCm, unit)}</Text>
          </View>
        ) : (
          summary ? (
            <Text variant="subhead" color="label2" style={styles.unavailable}>
              {unavailableMessage(definition.id, summary, t)}
            </Text>
          ) : null
        )}
      </View>
      <CalculationDisclosure
        method={definition.id}
        title={title}
        intro={t(definition.calculationIntroKey)}
        formula={formula}
        footer={calculationFooter}
      />
    </Section>
  );
}

function SourcesAndLimits({ t, unit }: { t: ReturnType<typeof useT>; unit: 'cm' | 'ftin' }) {
  const { c } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    haptics.selection();
    setExpanded((value) => !value);
  };
  const accuracy = t('method.krAccuracyValue', {
    boys: formatPlusMinus(5.3, unit),
    girls: formatPlusMinus(4.3, unit),
  });
  const familyAccuracy = t('method.mphAccuracyValue', { value: formatPlusMinus(8.5, unit) });

  return (
    <Section>
      <Pressable
        testID="method-limits-toggle"
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={t(expanded ? 'method.hideLimits' : 'method.viewLimits')}
        accessibilityState={{ expanded }}
        android_ripple={{ color: c.fill }}
        style={({ pressed }) => [styles.disclosure, pressed && { backgroundColor: c.fill }]}
      >
        <Text variant="body" color="tint" style={styles.disclosureText}>
          {t(expanded ? 'method.hideLimits' : 'method.viewLimits')}
        </Text>
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={16} color={c.label2} />
      </Pressable>
      {expanded ? (
        <View style={styles.limitsContent}>
          <Text variant="subhead" color="label2">{t('method.framing')}</Text>
          <Row title={t('method.krAccuracy')} value={accuracy} />
          <Row title={t('method.mphAccuracy')} value={familyAccuracy} />
          <Row title={t('method.validAges')} value={t('method.validAgesValue')} />
          <Row title={t('method.pubertySigns')} value={t('method.pubertySignsValue')} />
          <Text variant="caption" color="label2" uppercase style={styles.sourcesHeading}>{t('method.sourcesHeader')}</Text>
          {[CITATIONS.khamisRoche, CITATIONS.midParental, CITATIONS.cdc, CITATIONS.who].map((cite) => (
            <Text key={cite} variant="footnote" color="label2" selectable style={styles.citation}>{cite}</Text>
          ))}
          <Text variant="footnote" color="label2" style={styles.disclaimer}>
            {t('legal.disclaimer', { app: AppConfig.appName })}
          </Text>
        </View>
      ) : null}
    </Section>
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
  const estimated = summary?.estimatedParent ?? null;

  let krFormula = t('method.krFormula');
  let krSourcesNote: string | undefined;
  if (kr && inputs && inputs.weightKg != null) {
    const look = lookupKhamisRoche(engine.khamisRocheRows, inputs.sex, inputs.ageYears);
    if (look.ok) {
      const worked = khamisRocheWorked(look.row, inputs.heightCm, inputs.weightKg, inputs.motherCm, inputs.fatherCm);
      krFormula = [
        `${inputs.sex === 'male' ? 'boys' : 'girls'}, age ${look.row.age} row`,
        `PAS = ${look.row.intercept}`,
        `    ${signed(look.row.stature_coef, `${n(worked.statureIn)} in`, 'height')}`,
        `    ${signed(look.row.weight_coef, `${n(worked.weightLb)} lb`, 'weight')}`,
        `    ${signed(look.row.midparent_coef, `${n(worked.midparentIn)} in`, 'midparent')}`,
        `    = ${n(worked.resultIn)} in × 2.54 = ${n(worked.resultCm)} cm`,
      ].join('\n');
      krSourcesNote = t('method.verified', { n: krSourcesCount });
    }
  }

  const sign = inputs?.sex === 'female' ? '−' : '+';
  const mphFormula = inputs
    ? `${inputs.sex === 'male' ? 'boys' : 'girls'}: (mother + father ${sign} 13) / 2\n= (${n(inputs.motherCm)} + ${n(inputs.fatherCm)} ${sign} 13) / 2${mph ? `\n= ${n(mph.estimateCm)} cm` : ''}`
    : t('method.mphFormula');

  return (
    <View style={styles.screen} testID="method-sheet">
      <SheetHeader title={t('method.title')} right={{ label: t('common.done'), bold: true, onPress: () => router.back() }} />
      <SheetScroll>
        <Section header={summary ? t('method.currentEstimate') : t('method.estimateAfterSetup')}>
          <View style={styles.estimateCard}>
            {summary ? (
              <>
                <Text variant="largeTitle" color="tint" tabular>{formatHeight(summary.estimateCm, unit)}</Text>
                <Text variant="body" color="label2">{t('method.likelyRange')}: {formatHeightRange(summary.lowCm, summary.highCm, unit)}</Text>
                <Text variant="footnote" color="label2">{t('method.estimateNotGuarantee', { method: t(METHODS.find((item) => item.id === summary.lead.method)?.titleKey ?? 'method.krHeader') })}</Text>
              </>
            ) : (
              <Text variant="body" color="label2">{t('method.estimateAfterSetupBody')}</Text>
            )}
          </View>
          {estimated ? (
            <Text variant="footnote" color="label2" style={styles.inlineNote}>
              {t('method.estimatedNote', {
                parent: t(`result.lead.${estimated}`),
                height: formatHeight(populationAdultHeightCm[estimated], unit),
                sd: unit === 'cm'
                  ? `${engine.adultHeightSdCm[estimated].toFixed(1)} cm`
                  : `${(engine.adultHeightSdCm[estimated] / 2.54).toFixed(1)} in`,
              })}
            </Text>
          ) : null}
          {kr?.notes.includes('flooredAtCurrentHeight') ? (
            <Text variant="footnote" color="label2" style={styles.inlineNote}>{t('method.flooredNote')}</Text>
          ) : null}
        </Section>

        {METHODS.map((definition) => {
          const prediction = summary?.predictions.find((item) => item.method === definition.id);
          const formula = definition.id === 'khamisRoche'
            ? krFormula
            : definition.id === 'midParental'
              ? mphFormula
              : t(definition.formulaKey);
          return (
            <MethodCard
              key={definition.id}
              definition={definition}
              prediction={prediction}
              summary={summary}
              unit={unit}
              formula={formula}
              t={t}
              calculationFooter={definition.id === 'khamisRoche' ? krSourcesNote : undefined}
            />
          );
        })}

        <SourcesAndLimits t={t} unit={unit} />
      </SheetScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  estimateCard: { padding: space.margin, gap: 8 },
  inlineNote: { paddingHorizontal: space.margin * 2, paddingVertical: 8 },
  cardBody: { paddingHorizontal: space.margin, paddingTop: 14, paddingBottom: 4, gap: 12 },
  range: { gap: 4 },
  rangeLabel: { paddingTop: 4 },
  unavailable: { paddingTop: 2 },
  disclosure: {
    minHeight: space.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.margin,
    paddingVertical: 10,
    gap: 12,
  },
  disclosureText: { flex: 1 },
  expanded: { paddingHorizontal: space.margin, paddingBottom: 16, gap: 10 },
  mono: { borderRadius: radius.field, padding: space.margin },
  limitsContent: { paddingHorizontal: space.margin, paddingBottom: 16 },
  sourcesHeading: { paddingTop: 12, paddingBottom: 4 },
  citation: { paddingVertical: 7 },
  disclaimer: { paddingTop: 10 },
});
