import { router } from 'expo-router';

import { useStep } from '@/features/onboarding/flow';
import { StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { Button } from '@/ui/Button';
import { Row, Section } from '@/ui/List';

export default function ResearchStep() {
  const t = useT();
  const step = useStep('research');
  return (
    <StepScreen
      title={t('onboarding.research.title')}
      helper={t('onboarding.research.helper')}
      progress={step.progress}
      backLabel={step.backLabel}
      bottom={<Button testID="see-result" title={t('onboarding.research.cta')} onPress={() => void step.advance()} />}
    >
      <Section footer={t('onboarding.research.footer')} style={{ marginTop: 28 }}>
        <Row icon="function" iconTone="soft" title={t('onboarding.research.kr')} subtitle={t('onboarding.research.krSub')} />
        <Row icon="people" iconTone="soft" title={t('onboarding.research.mph')} subtitle={t('onboarding.research.mphSub')} />
        <Row icon="chartUp" iconTone="soft" title={t('onboarding.research.accuracy')} subtitle={t('onboarding.research.accuracySub')} />
        <Row
          icon="doc"
          iconTone="soft"
          title={t('onboarding.research.formulas')}
          tint
          accessory="chevron"
          onPress={() => router.push('/method')}
        />
      </Section>
    </StepScreen>
  );
}
