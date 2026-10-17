import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { haptics } from '@/services/haptics';
import { autoAdvanceMs } from '@/theme';
import type { IconName } from '@/ui/Icon';
import { Row, Section } from '@/ui/List';

export interface Choice<T extends string> {
  value: T;
  title: string;
  subtitle?: string;
  icon?: IconName;
}

/**
 * Single choice with auto-advance (brief §13.4): tap shows a trailing check, a light haptic, then
 * advances after 0.35 s (0.15 s with Reduce Motion). Input is locked during the delay so a
 * double-tap can't skip a step. Coming back shows the choice still checked.
 */
export function ChoiceList<T extends string>({
  choices,
  value,
  onSelect,
  onAdvance,
  footer,
  testID,
}: {
  choices: Choice<T>[];
  value: T | null;
  onSelect: (v: T) => void;
  onAdvance: (v: T) => void;
  footer?: string;
  testID?: string;
}) {
  const reduced = useReducedMotion();
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Unlock when the screen is shown again after Back.
  useFocusEffect(
    useCallback(() => {
      lockedRef.current = false;
      setLocked(false);
      return () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        lockedRef.current = false;
      };
    }, []),
  );

  return (
    <View accessibilityRole="radiogroup">
      <Section footer={footer} style={{ marginTop: 28 }}>
        {choices.map((ch) => (
          <Row
            key={ch.value}
            testID={testID ? `${testID}-${ch.value}` : undefined}
            title={ch.title}
            subtitle={ch.subtitle}
            icon={ch.icon}
            accessory="check"
            checked={value === ch.value}
            accessibilityRole="radio"
            onPress={() => {
              if (lockedRef.current || locked) return;
              lockedRef.current = true;
              setLocked(true);
              haptics.light();
              onSelect(ch.value);
              timer.current = setTimeout(
                () => {
                  timer.current = null;
                  // Focus resets the lock after navigation or a later Back action.
                  onAdvance(ch.value);
                },
                reduced ? autoAdvanceMs.reducedMotion : autoAdvanceMs.normal,
              );
            }}
          />
        ))}
      </Section>
    </View>
  );
}
