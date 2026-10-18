import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { minTouch, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

export interface SheetAction {
  label: string;
  onPress: () => void;
  bold?: boolean;
  disabled?: boolean;
  testID?: string;
}

/** 3-part sheet nav bar: left action, centered title, right "Done"/"Add" or a gray close ✕ (brief §13.1). */
export function SheetHeader({ title, left, right, close }: { title?: string; left?: SheetAction; right?: SheetAction; close?: boolean }) {
  const t = useT();
  const { c } = useTheme();
  const action = (a: SheetAction | undefined, align: 'flex-start' | 'flex-end') =>
    a ? (
      <Pressable
        testID={a.testID}
        onPress={a.onPress}
        disabled={a.disabled}
        accessibilityRole="button"
        accessibilityLabel={a.label}
        accessibilityState={{ disabled: !!a.disabled }}
        hitSlop={8}
        style={[styles.action, { alignItems: align }]}
      >
        <Text variant="body" weight={a.bold ? '600' : '400'} style={{ color: a.disabled ? c.label3 : c.tint }}>
          {a.label}
        </Text>
      </Pressable>
    ) : (
      <View style={styles.action} />
    );
  return (
    <View style={[styles.bar, { backgroundColor: c.sheetBg }]}>
      {action(left, 'flex-start')}
      <Text variant="headline" align="center" style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {close ? (
        <View style={[styles.action, { alignItems: 'flex-end' }]}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={8} style={styles.closeHit}>
            <View style={[styles.closeCircle, { backgroundColor: c.fill }]}>
              <Icon name="close" size={12} color={c.label2} weight="bold" />
            </View>
          </Pressable>
        </View>
      ) : (
        action(right, 'flex-end')
      )}
    </View>
  );
}

/** Scrollable sheet body with the standard grouped background. */
export function SheetScroll({ children, ...rest }: ScrollViewProps & { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollView
      {...rest}
      style={[styles.scroll, rest.style]}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      bottomOffset={16}
      keyboardDismissMode="interactive"
      contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }, rest.contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexShrink: 0,
    zIndex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: 8,
    minHeight: 64,
  },
  scroll: { flex: 1 },
  title: { flex: 1, flexShrink: 1, marginHorizontal: 4, paddingVertical: 4 },
  action: { width: 84, minHeight: minTouch, justifyContent: 'center' },
  closeHit: { minWidth: minTouch, minHeight: minTouch, alignItems: 'flex-end', justifyContent: 'center' },
  closeCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
