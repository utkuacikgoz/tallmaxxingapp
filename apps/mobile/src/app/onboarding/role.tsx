import { ChoiceList } from '@/features/onboarding/ChoiceList';
import { useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { useSettings, type Role } from '@/state/settings';

export default function RoleStep() {
  const t = useT();
  const role = useDraft((s) => s.role);
  const step = useStep('role');
  return (
    <StepScreen title={t('onboarding.role.title')} helper={t('onboarding.role.helper')} progress={step.progress} backLabel={step.backLabel}>
      <ChoiceList<Role>
        testID="role"
        value={role}
        choices={[
          { value: 'teen', title: t('onboarding.role.teen'), subtitle: t('onboarding.role.teenSub'), icon: 'person' },
          { value: 'parent', title: t('onboarding.role.parent'), subtitle: t('onboarding.role.parentSub'), icon: 'people' },
        ]}
        onSelect={(v) => {
          useDraft.getState().patch({ role: v });
          useSettings.getState().set({ role: v });
        }}
        onAdvance={() => void step.advance()}
      />
    </StepScreen>
  );
}
