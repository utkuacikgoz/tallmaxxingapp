import { memo, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { minTouch, radius, typeScale, useTheme } from '@/theme';
import { haptics } from '@/services/haptics';
import { Text } from './Text';

export type ButtonVariant = 'filled' | 'tinted' | 'bordered' | 'plain';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  destructive?: boolean;
  /** Plain buttons size to content by default. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  /** Selection feedback on an enabled tap; use none when the action already provides haptics. */
  haptic?: 'light' | 'selection' | 'none';
}

/** HIG button styles (brief §13.1): filled 50 pt / radius 14, tinted, bordered, plain. */
export const Button = memo(function Button({
  title,
  onPress,
  variant = 'filled',
  disabled,
  loading,
  leading,
  destructive,
  fullWidth = variant !== 'plain',
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
  haptic = 'light',
}: ButtonProps) {
  const { c, isDark } = useTheme();
  const inactive = disabled || loading;
  const fg = destructive ? c.red : isDark ? c.tint : c.tintPressed;

  const bg =
    variant === 'filled'
      ? inactive && !loading
        ? c.fill
        : c.tint
      : variant === 'tinted'
        ? c.tintFill
        : 'transparent';
  const textColor =
    variant === 'filled' ? (inactive && !loading ? c.label3 : c.onTint) : inactive ? c.label3 : fg;

  const isPlain = variant === 'plain';
  return (
    <Pressable
      onPress={() => {
        if (onPress && haptic === 'light') haptics.light();
        else if (onPress && haptic === 'selection') haptics.selection();
        onPress?.();
      }}
      disabled={inactive}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      android_ripple={isPlain ? { color: c.tintFill, borderless: true } : { color: 'rgba(255,255,255,0.18)' }}
      hitSlop={isPlain ? 6 : undefined}
      style={({ pressed }) => [
        isPlain ? styles.plain : styles.base,
        fullWidth && styles.full,
        !isPlain && { backgroundColor: bg },
        variant === 'bordered' && { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.separator },
        pressed && Platform.OS === 'ios' && { opacity: variant === 'filled' ? 0.82 : 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? c.onTint : c.tint} />
      ) : (
        <View style={styles.row}>
          {leading}
          <Text
            variant={isPlain ? 'body' : 'headline'}
            style={{ color: textColor, fontSize: isPlain ? typeScale.body.fontSize : typeScale.headline.fontSize }}
            weight={isPlain ? '400' : '600'}
            align="center"
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.button,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  full: { alignSelf: 'stretch' },
  plain: { minHeight: minTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
