import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { ageYearsMonths, birthDateFromMonthYear, checkAge, KR_MAX_AGE, toIsoDate } from '@tallsoon/engine';

import { draftAgeYears, useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { FieldMessage, StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { radius, roundedFamily, space, useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import { Row, Section } from '@/ui/List';
import { MonthYearWheel, type MonthYear } from '@/ui/MonthYearWheel';
import { Text } from '@/ui/Text';

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, i, 1))),
);

function formatTyped(digits: string): string {
  const d = digits.slice(0, 6);
  return d.length <= 2 ? d : `${d.slice(0, 2)} / ${d.slice(2)}`;
}

export default function BirthStep() {
  const t = useT();
  const { c } = useTheme();
  const step = useStep('birth');
  const stored = useDraft((s) => s.birth);
  const role = useSettings((s) => s.role);

  const now = new Date();
  const maxYear = now.getFullYear() - 2;
  const minYear = now.getFullYear() - 21;
  const [wheel, setWheel] = useState<MonthYear>(stored ?? { month: now.getMonth() + 1, year: now.getFullYear() - 12 });
  // The wheel counts as unanswered until it is moved or tapped (brief §13.4).
  const [touched, setTouched] = useState(stored != null);
  const [typedMode, setTypedMode] = useState(false);
  const [typed, setTyped] = useState(stored ? `${String(stored.month).padStart(2, '0')}${stored.year}` : '');

  const typedValue = useMemo<MonthYear | null>(() => {
    if (typed.length !== 6) return null;
    const month = Number(typed.slice(0, 2));
    const year = Number(typed.slice(2));
    if (month < 1 || month > 12 || year < 1900) return null;
    return { month, year };
  }, [typed]);

  const value: MonthYear | null = typedMode ? typedValue : touched ? wheel : null;
  const today = toIsoDate(now);
  const age = value ? draftAgeYears({ birth: value }, today) : null;
  const ageStatus = age == null ? null : checkAge(age);
  const ym = value ? ageYearsMonths(birthDateFromMonthYear(value.year, value.month), today) : null;
  const valid = ageStatus === 'valid';

  const commit = (v: MonthYear) => {
    setWheel(v);
    if (!touched) setTouched(true);
  };

  let message: { kind: 'error' | 'warning' | 'hint'; text: string } | null = null;
  if (typedMode && typed.length === 6 && !typedValue) message = { kind: 'error', text: t('onboarding.birth.typedInvalid') };
  else if (ageStatus === 'tooYoung') message = { kind: 'error', text: t('onboarding.birth.tooYoung') };
  else if (ageStatus === 'tooOld') message = { kind: 'error', text: t('onboarding.birth.tooOld') };
  else if (ym && age != null) {
    const ageLine = ym.months === 0 ? t('onboarding.birth.ageYearsOnly', { years: ym.years }) : t('onboarding.birth.age', { years: ym.years, count: ym.months });
    const extra = age < 4 ? ` ${t('onboarding.birth.underFour')}` : age > KR_MAX_AGE ? ` ${t('onboarding.birth.overKr')}` : '';
    message = { kind: 'hint', text: ageLine + extra };
  }

  const onContinue = () => {
    if (!value || !valid) return;
    useDraft.getState().patch({ birth: value });
    // Under-13s on the teen path hand over to a parent (brief §6.2b).
    if (role === 'teen' && age != null && age < 13) {
      haptics.warning();
      Alert.alert(t('onboarding.birth.under13Title'), t('onboarding.birth.under13Body'), [
        {
          text: t('onboarding.birth.under13Cta'),
          style: 'default',
          onPress: () => {
            useSettings.getState().set({ role: 'parent' });
            useDraft.getState().patch({ role: 'parent' });
            void step.advance();
          },
        },
      ]);
      return;
    }
    void step.advance();
  };

  const pill = value ? `${MONTHS[value.month - 1]} ${value.year}` : t('onboarding.birth.select');

  return (
    <StepScreen
      title={t('onboarding.birth.title')}
      helper={t('onboarding.birth.helper')}
      progress={step.progress}
      backLabel={step.backLabel}
      bottom={<Button testID="birth-continue" title={step.continueLabel} disabled={!valid} onPress={onContinue} />}
    >
      <Section style={{ marginTop: 28 }}>
        <Row
          title={t('onboarding.birth.rowLabel')}
          trailing={
            <View style={[styles.pill, { backgroundColor: c.fill2 }]}>
              <Text variant="body" style={{ color: value ? c.tint : c.label2 }} tabular>
                {pill}
              </Text>
            </View>
          }
        />
      </Section>

      <View style={{ marginTop: 10 }}>
        {typedMode ? (
          <View style={[styles.typedCard, { backgroundColor: c.card }]}>
            <Text variant="footnote" color="label2">
              {t('onboarding.birth.typedLabel')}
            </Text>
            <TextInput
              testID="birth-typed"
              value={formatTyped(typed)}
              onChangeText={(raw) => setTyped(raw.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder={t('onboarding.birth.typedPlaceholder')}
              placeholderTextColor={c.label3}
              selectionColor={c.tint}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onContinue}
              accessibilityLabel={t('onboarding.birth.typedLabel')}
              style={[styles.typedInput, { color: c.label, fontFamily: roundedFamily }]}
            />
          </View>
        ) : (
          <MonthYearWheel
            value={wheel}
            minYear={minYear}
            maxYear={maxYear}
            monthNames={MONTHS}
            onChange={commit}
            monthA11y={t('onboarding.birth.monthA11y')}
            yearA11y={t('onboarding.birth.yearA11y')}
          />
        )}
      </View>

      <FieldMessage kind={message?.kind ?? 'hint'} text={message?.text} />

      <Button
        variant="plain"
        title={typedMode ? t('onboarding.birth.useWheel') : t('onboarding.birth.useKeyboard')}
        onPress={() => {
          if (!typedMode && touched) setTyped(`${String(wheel.month).padStart(2, '0')}${wheel.year}`);
          if (typedMode && typedValue) {
            setWheel(typedValue);
            setTouched(true);
          }
          setTypedMode((m) => !m);
        }}
        style={{ marginTop: 8 }}
      />
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8, borderCurve: 'continuous' },
  typedCard: {
    marginHorizontal: space.margin,
    borderRadius: radius.list,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  typedInput: { fontSize: 34, fontWeight: '700', paddingVertical: 8, fontVariant: ['tabular-nums'] },
});
