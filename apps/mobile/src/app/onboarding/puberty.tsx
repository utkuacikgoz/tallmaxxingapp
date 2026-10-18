import { useDraft } from '@/features/onboarding/draft';
import { useStep } from '@/features/onboarding/flow';
import { StepScreen } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { Button } from '@/ui/Button';
import { Row, Section } from '@/ui/List';

const BOTH = ['grewALot', 'bodyOdor', 'underarmHair', 'acne'] as const;
const BOYS = ['voice', 'facialHair', 'shoulders'] as const;
const GIRLS = ['breast', 'period'] as const;
const EXCLUSIVE = ['none', 'unsure'] as const;

export default function PubertyStep() {
  const t = useT();
  const step = useStep('puberty');
  const sex = useDraft((s) => s.sex);
  const selected = useDraft((s) => s.pubertySigns);
  const signs = [...BOTH, ...(sex === 'female' ? GIRLS : BOYS)].sort((a, b) =>
    t(`onboarding.puberty.signs.${a}`).localeCompare(t(`onboarding.puberty.signs.${b}`)),
  );

  const toggle = (key: string) => {
    haptics.light();
    const isExclusive = (EXCLUSIVE as readonly string[]).includes(key);
    let next: string[];
    if (selected.includes(key)) next = selected.filter((k) => k !== key);
    // "None yet" and "Not sure" clear everything else; any sign clears them (brief §13.4).
    else if (isExclusive) next = [key];
    else next = [...selected.filter((k) => !(EXCLUSIVE as readonly string[]).includes(k)), key];
    useDraft.getState().patch({ pubertySigns: next });
  };

  return (
    <StepScreen
      title={t('onboarding.puberty.title')}
      helper={t('onboarding.puberty.helper')}
      progress={step.progress}
      backLabel={step.backLabel}
      bottom={
        <Button testID="puberty-continue" title={step.continueLabel} disabled={selected.length === 0} onPress={() => void step.advance()} />
      }
    >
      <Section style={{ marginTop: 28 }}>
        {signs.map((k) => (
          <Row
            key={k}
            testID={`puberty-${k}`}
            title={t(`onboarding.puberty.signs.${k}`)}
            accessory="check"
            accessibilityRole="checkbox"
            checked={selected.includes(k)}
            onPress={() => toggle(k)}
          />
        ))}
      </Section>
      <Section>
        {EXCLUSIVE.map((k) => (
          <Row
            key={k}
            testID={`puberty-${k}`}
            title={t(`onboarding.puberty.${k}`)}
            accessory="check"
            accessibilityRole="checkbox"
            checked={selected.includes(k)}
            onPress={() => toggle(k)}
          />
        ))}
      </Section>
    </StepScreen>
  );
}
