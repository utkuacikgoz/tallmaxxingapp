import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { minTouch, space, useTheme } from '@/theme';
import { BottomBar, ProgressLine } from '@/ui/Layout';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

export interface StepScreenProps {
  title: string;
  helper?: string;
  progress?: { step: number; total: number };
  /** Back label: "Back" in the flow, "Result" when editing from the result (brief §13.1). */
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
  /** Bottom area (Continue, Skip, notes). Omit for auto-advance screens. */
  bottom?: ReactNode;
  scroll?: boolean;
  testID?: string;
}

/** One question per screen: Title 1, helper, one control, inline message, pinned Continue. */
export function StepScreen({ title, helper, progress, backLabel, onBack, children, bottom, testID }: StepScreenProps) {
  const { c } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const android = Platform.OS === 'android';
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : undefined));

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]} testID={testID}>
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.nav}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel ?? t('common.back')}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.4 }]}
          >
            <Icon name="back" size={android ? 24 : 22} color={android ? c.label : c.tint} weight="semibold" />
            {android ? null : (
              <Text variant="body" color="tint">
                {backLabel ?? t('common.back')}
              </Text>
            )}
          </Pressable>
        </View>
        {progress ? <ProgressLine step={progress.step} total={progress.total} /> : <View style={{ height: 2 }} />}
      </View>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title1" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {helper ? (
          <Text variant="body" color="label2" style={styles.helper}>
            {helper}
          </Text>
        ) : null}
        {children}
      </KeyboardAwareScrollView>
      {bottom ? (
        <KeyboardStickyView offset={{ opened: insets.bottom - 6 }}>
          <BottomBar>{bottom}</BottomBar>
        </KeyboardStickyView>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </View>
  );
}

/** Inline message under a field: error (red), warning (orange) or hint (secondary). */
export function FieldMessage({ kind, text }: { kind: 'error' | 'warning' | 'hint'; text?: string | null }) {
  if (!text) return <View style={styles.msgSpacer} />;
  return (
    <Text
      variant="footnote"
      color={kind === 'error' ? 'red' : kind === 'warning' ? 'orange' : 'label2'}
      style={styles.msg}
      accessibilityLiveRegion="polite"
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  nav: { height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: minTouch, paddingHorizontal: 8 },
  content: { paddingBottom: 32 },
  title: { paddingHorizontal: space.margin, marginTop: 18 },
  helper: { paddingHorizontal: space.margin, marginTop: 6 },
  msg: { paddingHorizontal: space.margin * 2, marginTop: 8 },
  msgSpacer: { height: 26 },
});
