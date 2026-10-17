import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { formatHeight, type HeightUnit, type ParentKey } from '@tallsoon/engine';
import { populationAdultHeightCm } from '@tallsoon/reference';

import { useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { useMeasure, useMeasureCopy } from '@/features/onboarding/measure';
import { FieldMessage, StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { minTouch, radius, space, useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import { MeasureField, type MeasureFieldHandle } from '@/ui/MeasureField';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Text } from '@/ui/Text';

export default function ParentsStep() {
  const t = useT();
  const { c } = useTheme();
  const step = useStep('parents');
  const unit = useSettings((s) => s.heightUnit);
  const d = useDraft();
  const mother = useMeasure('parentHeightCm', d.motherCm);
  const father = useMeasure('parentHeightCm', d.fatherCm);
  const copy = useMeasureCopy();
  const fatherRef = useRef<MeasureFieldHandle>(null);
  const unknown = d.unknownParent;

  const motherOk = unknown === 'mother' || mother.valid;
  const fatherOk = unknown === 'father' || father.valid;
  const valid = motherOk && fatherOk;

  const markUnknown = (who: ParentKey) => {
    if (unknown && unknown !== who) {
      haptics.warning();
      Alert.alert(t('onboarding.parents.bothUnknownTitle'), t('onboarding.parents.bothUnknownBody'), [{ text: t('common.ok') }]);
      return;
    }
    haptics.light();
    useDraft.getState().patch({ unknownParent: who });
    if (who === 'mother') fatherRef.current?.focus();
  };

  const submit = () => {
    mother.touch();
    father.touch();
    if (!valid) return;
    useDraft.getState().patch({
      motherCm: unknown === 'mother' ? null : mother.value,
      fatherCm: unknown === 'father' ? null : father.value,
    });
    void step.advance();
  };

  const parentRow = (who: ParentKey) => {
    const f = who === 'mother' ? mother : father;
    const label = t(`onboarding.parents.${who}`);
    return (
      <View style={styles.block}>
        <Text variant="footnote" color="label2" uppercase style={styles.header}>
          {label}
        </Text>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          {unknown === who ? (
            <>
              <Text variant="body" color="label2" style={{ flex: 1 }}>
                {t('onboarding.parents.unknownRow', { height: formatHeight(populationAdultHeightCm[who], unit) })}
              </Text>
              <Pressable
                onPress={() => {
                  haptics.light();
                  useDraft.getState().patch({ unknownParent: null });
                }}
                accessibilityRole="button"
                accessibilityLabel={`${t('common.undo')}, ${label}`}
                hitSlop={6}
                style={styles.link}
              >
                <Text variant="body" color="tint">
                  {t('common.undo')}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <MeasureField
                ref={who === 'father' ? fatherRef : undefined}
                testID={`parent-${who}`}
                size="compact"
                unit={unit}
                value={f.value}
                onChange={f.onChange}
                onBlur={f.onBlur}
                invalid={f.showError}
                autoFocus={who === 'mother' && unknown !== 'mother'}
                placeholder={who === 'mother' ? '163' : '178'}
                returnKeyType={who === 'mother' && unknown !== 'father' ? 'next' : 'done'}
                onSubmitEditing={() => (who === 'mother' && unknown !== 'father' ? fatherRef.current?.focus() : submit())}
                accessibilityLabel={t(who === 'mother' ? 'onboarding.parents.a11yMother' : 'onboarding.parents.a11yFather', {
                  unit: unit === 'cm' ? 'centimeters' : 'feet and inches',
                })}
              />
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => markUnknown(who)}
                accessibilityRole="button"
                accessibilityLabel={`${t('onboarding.parents.dontKnow')}, ${label}`}
                hitSlop={6}
                style={styles.link}
              >
                <Text variant="body" color="tint">
                  {t('onboarding.parents.dontKnow')}
                </Text>
              </Pressable>
            </>
          )}
        </View>
        {f.showError && unknown !== who ? (
          <FieldMessage kind="error" text={copy.error('parentHeightCm', unit, f.info.inchesInvalid, who)} />
        ) : null}
      </View>
    );
  };

  return (
    <StepScreen
      title={t('onboarding.parents.title')}
      helper={t('onboarding.parents.helper')}
      progress={step.progress}
      backLabel={step.backLabel}
      bottom={<Button testID="parents-continue" title={step.continueLabel} disabled={!valid} onPress={submit} />}
    >
      <View style={{ paddingHorizontal: space.margin, marginTop: 28 }}>
        <SegmentedControl<HeightUnit>
          options={[
            { value: 'cm', label: t('common.cm') },
            { value: 'ftin', label: t('common.ftIn'), accessibilityLabel: 'feet and inches' },
          ]}
          value={unit}
          onChange={(u) => useSettings.getState().set({ heightUnit: u })}
        />
      </View>
      {parentRow('mother')}
      {parentRow('father')}
      <Text variant="footnote" color="label2" style={styles.footer}>
        {unknown
          ? t('onboarding.parents.footerUnknown', { height: formatHeight(populationAdultHeightCm[unknown], unit) })
          : t('onboarding.parents.footer')}
      </Text>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 24 },
  header: { paddingHorizontal: space.margin * 2, paddingBottom: 7 },
  card: {
    marginHorizontal: space.margin,
    borderRadius: radius.list,
    borderCurve: 'continuous',
    minHeight: 72,
    paddingHorizontal: space.margin,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  link: { minHeight: minTouch, justifyContent: 'center', paddingHorizontal: 4 },
  footer: { paddingHorizontal: space.margin * 2, marginTop: 24 },
});
