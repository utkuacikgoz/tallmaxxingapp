import RNSegmented from '@react-native-segmented-control/segmented-control';
import type { ComponentType } from 'react';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptics } from '@/services/haptics';
import { minTouch, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

// The package's class typings predate React 19; its runtime is fine.
const NativeSegmented = RNSegmented as unknown as ComponentType<{
  testID?: string;
  values: string[];
  selectedIndex: number;
  onChange: (e: { nativeEvent: { selectedSegmentIndex: number } }) => void;
  appearance?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}>;

export interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string; accessibilityLabel?: string }>;
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Native UISegmentedControl on iOS; M3 SegmentedButton on Android; iOS look on web. */
function SegmentedControlInner<T extends string>({ options, value, onChange, style, testID }: SegmentedProps<T>) {
  const { c, isDark } = useTheme();
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  if (Platform.OS === 'ios') {
    return (
      <NativeSegmented
        testID={testID}
        values={options.map((o) => o.label)}
        selectedIndex={index}
        onChange={(e) => {
          const next = options[e.nativeEvent.selectedSegmentIndex];
          if (next) onChange(next.value);
        }}
        appearance={isDark ? 'dark' : 'light'}
        style={[{ height: 36 }, style]}
      />
    );
  }

  const android = Platform.OS === 'android';
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      style={[
        styles.track,
        android
          ? { borderColor: c.separator, borderWidth: 1, borderRadius: 20, padding: 0, backgroundColor: 'transparent' }
          : { backgroundColor: c.fill2 },
        style,
      ]}
    >
      {options.map((o, i) => {
        const selected = i === index;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!selected) {
                haptics.selection();
                onChange(o.value);
              }
            }}
            accessibilityRole="radio"
            accessibilityLabel={o.accessibilityLabel ?? o.label}
            accessibilityState={{ selected, checked: selected }}
            android_ripple={{ color: c.tintFill }}
            style={[
              styles.segment,
              android
                ? [
                    { minHeight: 40, borderRadius: 0 },
                    i > 0 && { borderLeftWidth: 1, borderLeftColor: c.separator },
                    selected && { backgroundColor: c.tintFill },
                  ]
                : selected && [styles.selectedIos, { backgroundColor: isDark ? c.cardElevated : '#FFFFFF' }],
            ]}
          >
            {android && selected ? <Icon name="check" size={16} color={c.label} /> : null}
            <Text variant="subhead" weight={selected ? '600' : '500'} style={{ color: c.label }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SegmentedControl = memo(SegmentedControlInner) as typeof SegmentedControlInner;

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 9, padding: 2, overflow: 'hidden', minHeight: 36 },
  segment: {
    flex: 1,
    minHeight: Math.min(minTouch, 32),
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  selectedIos: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
