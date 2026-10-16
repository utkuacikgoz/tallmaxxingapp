import { View } from 'react-native';

import type { WeightUnit } from '@tallsoon/engine';

import { useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { useMeasure, useMeasureCopy } from '@/features/onboarding/measure';
import { FieldMessage, StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { useSettings } from '@/state/settings';
import { space } from '@/theme';
import { Button } from '@/ui/Button';
import { MeasureField } from '@/ui/MeasureField';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Text } from '@/ui/Text';

export default function WeightStep() {
  const t = useT();
  const step = useStep('weight');
  const unit = useSettings((s) => s.weightUnit);
  const initial = useDraft((s) => s.weightKg);
  const field = useMeasure('weightKg', initial);
  const copy = useMeasureCopy();

  const submit = () => {
    field.touch();
    if (!field.valid || field.value == null) return;
    useDraft.getState().patch({ weightKg: field.value, weightSkipped: false });
    void step.advance();
  };

  const skip = () => {
    useDraft.getState().patch({ weightKg: null, weightSkipped: true });
    analytics.track('onboarding_step_skipped', { step: 'weight' });
    void step.advance();
  };

  return (
    <StepScreen
      title={t('onboarding.weight.title')}
      helper={t('onboarding.weight.helper')}
      progress={step.progress}
      backLabel={step.backLabel}
      bottom={
        <>
          <Button testID="weight-continue" title={step.continueLabel} disabled={!field.valid} onPress={submit} />
          <Button testID="weight-skip" variant="plain" title={t('common.skip')} onPress={skip} />
          <Text variant="footnote" color="label2" align="center" style={{ paddingHorizontal: 8 }}>
            {t('onboarding.weight.skipNote')}
          </Text>
        </>
      }
    >
      <View style={{ paddingHorizontal: space.margin, marginTop: 28, gap: 16 }}>
        <SegmentedControl<WeightUnit>
          testID="weight-unit"
          options={[
            { value: 'kg', label: t('common.kg'), accessibilityLabel: 'kilograms' },
            { value: 'lb', label: t('common.lb'), accessibilityLabel: 'pounds' },
          ]}
          value={unit}
          onChange={(u) => useSettings.getState().set({ weightUnit: u })}
        />
        <MeasureField
          testID="weight-field"
          unit={unit}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          onSubmitEditing={submit}
          returnKeyType="done"
          invalid={field.showError}
          autoFocus
          placeholder={unit === 'kg' ? 'e.g. 45' : 'e.g. 99'}
          accessibilityLabel={t('onboarding.weight.a11y', { unit: unit === 'kg' ? 'kilograms' : 'pounds' })}
        />
      </View>
      {field.showError ? (
        <FieldMessage kind="error" text={copy.error('weightKg', unit, false)} />
      ) : (
        <FieldMessage kind="hint" text={field.valid && field.value != null ? copy.hint('weightKg', unit, field.value) : null} />
      )}
    </StepScreen>
  );
}
