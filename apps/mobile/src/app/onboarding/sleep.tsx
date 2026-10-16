import { ChoiceList } from '@/features/onboarding/ChoiceList';
import { useDraft, type SleepBand } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';

const BANDS: SleepBand[] = ['lt7', '7-8', '8-9', '9+'];

export default function SleepStep() {
  const t = useT();
  const value = useDraft((s) => s.sleepBand);
  const step = useStep('sleep');
  return (
    <StepScreen title={t('onboarding.sleep.title')} helper={t('onboarding.sleep.helper')} progress={step.progress} backLabel={step.backLabel}>
      <ChoiceList<SleepBand>
        testID="sleep"
        value={value}
        choices={BANDS.map((b) => ({ value: b, title: t(`onboarding.sleep.${b}`) }))}
        onSelect={(v) => useDraft.getState().patch({ sleepBand: v })}
        onAdvance={() => void step.advance()}
      />
    </StepScreen>
  );
}
