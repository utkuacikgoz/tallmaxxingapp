import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useT } from '@/i18n';
import { useTheme } from '@/theme';
import { Text } from '@/ui/Text';
import { consentedTestimonials, MIN_REAL_TESTIMONIALS } from './testimonials';

interface Bubble {
  text: string;
  me: boolean;
}

function Column({ bubbles, speed, offset }: { bubbles: Bubble[]; speed: number; offset: number }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const [h, setH] = useState(0);
  const y = useSharedValue(-offset);

  useEffect(() => {
    if (!h || reduced) return;
    // Content is rendered twice; scrolling by one copy's height loops seamlessly.
    y.value = -offset;
    y.value = withRepeat(withTiming(-h / 2 - offset, { duration: (h / 2) * speed, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(y);
  }, [h, reduced, speed, offset, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const onLayout = (e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height);

  return (
    <View style={styles.column}>
      <Animated.View style={style} onLayout={onLayout}>
        {[0, 1].map((copy) => (
          <View key={copy}>
            {bubbles.map((b, i) => (
              <View
                key={`${copy}-${i}`}
                style={[
                  styles.bubble,
                  b.me
                    ? { backgroundColor: c.tint, alignSelf: 'flex-end', borderBottomRightRadius: 6 }
                    : { backgroundColor: '#2C2C2E', alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
                ]}
              >
                <Text variant="subhead" style={{ color: b.me ? '#03231C' : '#F2F2F7' }}>
                  {b.text}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * Two columns of slowly rising chat bubbles behind the paywall sheet (brief §13.6). Until there are
 * enough real, consented testimonials it shows clearly-labelled Q&A placeholders, never fake quotes.
 * Static under Reduce Motion. Decorative: hidden from screen readers.
 */
export const BubbleBackground = memo(function BubbleBackground({ top }: { top: number }) {
  const t = useT();
  const { c } = useTheme();
  const real = consentedTestimonials();
  const useReal = real.length >= MIN_REAL_TESTIMONIALS;

  const [left, right] = useMemo(() => {
    if (useReal) {
      const items = real.map((r) => ({ text: `“${r.text}” · ${r.attribution}`, me: false }));
      return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];
    }
    const qa = (n: number): Bubble[] => [
      { text: t(`paywall.bubbles.q${n}`), me: true },
      { text: t(`paywall.bubbles.a${n}`), me: false },
    ];
    return [[...qa(1), ...qa(3), ...qa(5), ...qa(7)], [...qa(2), ...qa(4), ...qa(6)]];
  }, [t, useReal, real]);

  return (
    <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.columns, { paddingTop: top + 56 }]}>
        <Column bubbles={left} speed={38} offset={0} />
        <Column bubbles={right} speed={46} offset={60} />
      </View>
      <Svg style={[styles.fade, { height: top + 96 }]} pointerEvents="none">
        <Defs>
          <LinearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.cover} stopOpacity={1} />
            <Stop offset="0.55" stopColor={c.cover} stopOpacity={0.92} />
            <Stop offset="1" stopColor={c.cover} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#fadeTop)" />
      </Svg>
      {!useReal ? (
        <View style={[styles.pill, { top: top + 10 }]}>
          <Text variant="footnote" weight="600" style={{ color: '#F2F2F7' }}>
            {t('paywall.pill')}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, flex: 1, overflow: 'hidden' },
  column: { flex: 1, overflow: 'hidden' },
  bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, marginBottom: 10, maxWidth: '96%', borderCurve: 'continuous' },
  fade: { position: 'absolute', left: 0, right: 0, top: 0 },
  pill: {
    position: 'absolute',
    left: 16,
    top: 0,
    backgroundColor: 'rgba(118,118,128,0.36)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
});
