import { View } from 'react-native';

import { ageInMonths, isUnusualHeight, toIsoDate, typicalHeight, type HeightUnit } from '@tallsoon/engine';

import { draftBirthDate, useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { useMeasure, useMeasureCopy } from '@/features/onboarding/measure';
import { FieldMessage, StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { engine } from '@/lib/engine';
import { useSettings } from '@/state/settings';
import { space } from '@/theme';
import { Button } from '@/ui/Button';
import { MeasureField } from '@/ui/MeasureField';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Text } from '@/ui/Text';

export default function HeightStep() {
  const t = useT();
  const step = useStep('height');
  const unit = useSettings((s) => s.heightUnit);
  const d = useDraft();
  const field = useMeasure('childHeightCm', d.heightCm);
  const copy = useMeasureCopy();

  // Soft warning: more than 22% from the typical height for age and sex (brief §13.4).
  let unusual = false;
  const birth = draftBirthDate(d);
  if (field.valid && field.value != null && birth && d.sex) {
    const months = ageInMonths(birth, toIsoDate(new Date()));
    const ref = engine.referenceFor('cdc', months);
    unusual = isUnusualHeight(field.value, ref ? typicalHeight(ref, d.sex, months) : null);
  }

  const submit = () => {
    field.touch();
    if (!field.valid || field.value == null) return;
    useDraft.getState().patch({ heightCm: field.value });
    void step.advance();
  };

  return (
    <StepScreen
      title={t('onboarding.height.title')}
      helper={t('onboarding.height.helper')}
      progress={step.progress}
      backLabel={step.backLabel}
      bottom={<Button testID="height-continue" title={step.continueLabel} disabled={!field.valid} onPress={submit} />}
    >
      <View style={{ paddingHorizontal: space.margin, marginTop: 28, gap: 16 }}>
        <SegmentedControl<HeightUnit>
          testID="height-unit"
          options={[
            { value: 'cm', label: t('common.cm') },
            { value: 'ftin', label: t('common.ftIn'), accessibilityLabel: 'feet and inches' },
          ]}
          value={unit}
          onChange={(u) => useSettings.getState().set({ heightUnit: u })}
        />
        <MeasureField
          testID="height-field"
          unit={unit}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          onSubmitEditing={submit}
          returnKeyType="done"
          invalid={field.showError}
          autoFocus
          placeholder="e.g. 152"
          accessibilityLabel={t('onboarding.height.a11y', { unit: unit === 'cm' ? 'centimeters' : 'feet and inches' })}
        />
      </View>
      {field.showError ? (
        <FieldMessage kind="error" text={copy.error('childHeightCm', unit, field.info.inchesInvalid)} />
      ) : unusual ? (
        <FieldMessage kind="warning" text={t('onboarding.height.unusual')} />
      ) : (
        <FieldMessage kind="hint" text={field.valid && field.value != null ? copy.hint('childHeightCm', unit, field.value) : null} />
      )}
      <Text variant="footnote" color="label2" style={{ paddingHorizontal: space.margin * 2, marginTop: 4 }}>
        {t('onboarding.height.footer')}
      </Text>
    </StepScreen>
  );
}
