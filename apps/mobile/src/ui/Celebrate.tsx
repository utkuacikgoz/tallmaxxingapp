import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Confetti } from 'react-native-fast-confetti';
import { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '@/theme';

/**
 * One short confetti burst, teal + apricot (brief §13.7). Celebrates finishing, never the number:
 * it fires the same way for every result. Skipped under Reduce Motion.
 */
export const Celebrate = memo(function Celebrate({ onEnd }: { onEnd?: () => void }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Confetti
        count={90}
        colors={[c.tint, c.accent, '#9FD8CB', '#F8D2A6']}
        fadeOutOnEnd
        reduceMotion="system"
        onAnimationEnd={onEnd}
      />
    </View>
  );
});
