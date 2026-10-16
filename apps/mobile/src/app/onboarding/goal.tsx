import { ChoiceList } from '@/features/onboarding/ChoiceList';
import { useDraft, type Goal } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';

const GOALS: Goal[] = ['adultHeight', 'fullHeight', 'track', 'onTrack'];

export default function GoalStep() {
  const t = useT();
  const value = useDraft((s) => s.goal);
  const step = useStep('goal');
  return (
    <StepScreen title={t('onboarding.goal.title')} helper={t('onboarding.goal.helper')} progress={step.progress} backLabel={step.backLabel}>
      <ChoiceList<Goal>
        testID="goal"
        value={value}
        choices={GOALS.map((g) => ({ value: g, title: t(`onboarding.goal.${g}`) }))}
        onSelect={(v) => useDraft.getState().patch({ goal: v })}
        onAdvance={() => void step.advance()}
      />
    </StepScreen>
  );
}
