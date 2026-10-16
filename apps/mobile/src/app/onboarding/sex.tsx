import type { Sex } from '@tallsoon/engine';

import { ChoiceList } from '@/features/onboarding/ChoiceList';
import { useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';

export default function SexStep() {
  const t = useT();
  const sex = useDraft((s) => s.sex);
  const step = useStep('sex');
  return (
    <StepScreen title={t('onboarding.sex.title')} helper={t('onboarding.sex.helper')} progress={step.progress} backLabel={step.backLabel}>
      <ChoiceList<Sex>
        testID="sex"
        value={sex}
        choices={[
          { value: 'male', title: t('onboarding.sex.boy') },
          { value: 'female', title: t('onboarding.sex.girl') },
        ]}
        onSelect={(v) => {
          const d = useDraft.getState();
          // Changing sex clears the puberty answers (brief §13.4).
          d.patch(d.sex && d.sex !== v ? { sex: v, pubertySigns: [] } : { sex: v });
        }}
        onAdvance={() => void step.advance()}
      />
    </StepScreen>
  );
}
