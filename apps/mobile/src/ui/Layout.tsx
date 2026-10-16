import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, useTheme } from '@/theme';

/** Pinned bottom bar for the one primary action, above the home indicator (brief §13.1). */
export function BottomBar({ children, hairline, style }: { children: ReactNode; hairline?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bottom,
        { paddingBottom: Math.max(insets.bottom, 16) + (Platform.OS === 'android' ? 8 : 0), backgroundColor: c.bg },
        hairline && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Thin 2 pt tint line showing step n of N (brief §13.1). */
export function ProgressLine({ step, total }: { step: number; total: number }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(1, step / total));
  const style = useAnimatedStyle(() => ({ width: withTiming(`${pct * 100}%`, { duration: reduced ? 0 : 300 }) }), [pct, reduced]);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: step }}
      accessibilityLabel={`Step ${step} of ${total}`}
    >
      <Animated.View style={[styles.fill, { backgroundColor: c.tint }, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: { paddingHorizontal: space.margin, paddingTop: 10, gap: 4 },
  track: { height: 2, width: '100%' },
  fill: { height: 2, borderTopRightRadius: 1, borderBottomRightRadius: 1 },
});
