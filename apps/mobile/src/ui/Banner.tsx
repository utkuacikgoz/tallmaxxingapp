import { useEffect } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideInUp, SlideOutDown, SlideOutUp, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { useTheme } from '@/theme';
import { IconTile, type IconName, type TileTone } from './Icon';
import { Text } from './Text';

export interface BannerSpec {
  title: string;
  subtitle?: string;
  icon?: IconName;
  tone?: TileTone;
}

interface BannerState {
  current: (BannerSpec & { id: number }) | null;
  show: (b: BannerSpec) => void;
  hide: () => void;
}

let seq = 0;
const useBannerStore = create<BannerState>((set) => ({
  current: null,
  show: (b) => set({ current: { ...b, id: ++seq } }),
  hide: () => set({ current: null }),
}));

/** Confirmations use a banner, never a toast (brief §13.1). Android shows it as a Snackbar. */
export function showBanner(b: BannerSpec) {
  useBannerStore.getState().show(b);
  AccessibilityInfo.announceForAccessibility([b.title, b.subtitle].filter(Boolean).join('. '));
}

export function BannerHost() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const current = useBannerStore((s) => s.current);
  const hide = useBannerStore((s) => s.hide);

  useEffect(() => {
    if (!current) return;
    const id = setTimeout(hide, 3200);
    return () => clearTimeout(id);
  }, [current, hide]);

  if (!current) return null;
  const android = Platform.OS === 'android';

  const entering = reduced ? FadeIn.duration(150) : android ? SlideInDown.springify().damping(18) : SlideInUp.springify().damping(18);
  const exiting = reduced ? FadeOut.duration(150) : android ? SlideOutDown.duration(220) : SlideOutUp.duration(220);

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { justifyContent: android ? 'flex-end' : 'flex-start' }]}
    >
      <Animated.View
        key={current.id}
        entering={entering}
        exiting={exiting}
        style={[
          android
            ? { marginHorizontal: 12, marginBottom: insets.bottom + 92 }
            : { marginHorizontal: 8, marginTop: insets.top + 4 },
        ]}
      >
        <Pressable
          onPress={hide}
          accessibilityRole="alert"
          accessibilityLabel={[current.title, current.subtitle].filter(Boolean).join('. ')}
          style={[
            styles.banner,
            android
              ? { backgroundColor: isDark ? '#E6E1E5' : '#313033', borderRadius: 8 }
              : { backgroundColor: isDark ? '#2C2C2E' : 'rgba(255,255,255,0.97)', borderRadius: 22 },
          ]}
        >
          {current.icon && !android ? <IconTile name={current.icon} tone={current.tone ?? 'tint'} size={38} /> : null}
          <View style={{ flex: 1 }}>
            <Text variant="headline" style={android ? { color: isDark ? '#313033' : '#F4EFF4' } : undefined}>
              {current.title}
            </Text>
            {current.subtitle ? (
              <Text variant="subhead" color="label2" style={android ? { color: isDark ? '#49454F' : '#CAC4D0' } : undefined}>
                {current.subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

