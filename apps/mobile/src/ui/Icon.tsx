import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { AndroidSymbol } from 'expo-symbols';
import { memo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import type { IconName as ContentIcon } from '@tallsoon/content';

import { useTheme } from '@/theme';

type Pair = { ios: SFSymbol; android: AndroidSymbol };

/** SF Symbols on iOS, Material Symbols on Android and web (brief §13.3), mapped one to one. */
const MAP = {
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  back: { ios: 'chevron.left', android: 'arrow_back' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more' },
  close: { ios: 'xmark', android: 'close' },
  check: { ios: 'checkmark', android: 'check' },
  checkCircle: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  circle: { ios: 'circle', android: 'radio_button_unchecked' },
  lock: { ios: 'lock.fill', android: 'lock' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  plus: { ios: 'plus', android: 'add' },
  info: { ios: 'info.circle', android: 'info' },
  ruler: { ios: 'ruler', android: 'straighten' },
  function: { ios: 'function', android: 'function' },
  shield: { ios: 'lock.shield', android: 'shield_lock' },
  chartUp: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up' },
  person: { ios: 'person.fill', android: 'person' },
  people: { ios: 'person.2.fill', android: 'group' },
  flame: { ios: 'flame.fill', android: 'local_fire_department' },
  doc: { ios: 'doc.text', android: 'description' },
  bell: { ios: 'bell.fill', android: 'notifications' },
  gear: { ios: 'gearshape.fill', android: 'settings' },
  trash: { ios: 'trash', android: 'delete' },
  mail: { ios: 'envelope', android: 'mail' },
  download: { ios: 'square.and.arrow.down', android: 'download' },
  external: { ios: 'arrow.up.right', android: 'open_in_new' },
  table: { ios: 'tablecells', android: 'table' },
  sparkles: { ios: 'sparkles', android: 'celebration' },
  rocket: { ios: 'arrow.up.forward', android: 'rocket_launch' },
  personAdd: { ios: 'person.badge.plus', android: 'person_add' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh' },
  scale: { ios: 'scalemass', android: 'scale' },
  cake: { ios: 'birthday.cake', android: 'cake' },
  science: { ios: 'flask', android: 'science' },
  height: { ios: 'arrow.up.and.down', android: 'height' },
  // Content icons (packages/content IconName)
  stretch: { ios: 'figure.flexibility', android: 'sports_gymnastics' },
  moon: { ios: 'moon.fill', android: 'bedtime' },
  meal: { ios: 'fork.knife', android: 'restaurant' },
  sun: { ios: 'sun.max.fill', android: 'wb_sunny' },
  water: { ios: 'drop.fill', android: 'water_drop' },
  jump: { ios: 'figure.jumprope', android: 'sports_handball' },
  run: { ios: 'figure.run', android: 'directions_run' },
  ball: { ios: 'soccerball', android: 'sports_soccer' },
  milk: { ios: 'cup.and.saucer.fill', android: 'local_cafe' },
  book: { ios: 'book.fill', android: 'menu_book' },
  bed: { ios: 'bed.double.fill', android: 'bed' },
  phoneOff: { ios: 'iphone.slash', android: 'mobile_off' },
  cart: { ios: 'cart.fill', android: 'shopping_cart' },
  heart: { ios: 'heart.fill', android: 'favorite' },
  bolt: { ios: 'bolt.fill', android: 'bolt' },
  leaf: { ios: 'leaf.fill', android: 'eco' },
  list: { ios: 'list.bullet', android: 'format_list_bulleted' },
  chart: { ios: 'chart.line.uptrend.xyaxis', android: 'monitoring' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  pill: { ios: 'pills.fill', android: 'medication' },
  egg: { ios: 'frying.pan.fill', android: 'egg' },
} satisfies Record<string, Pair>;

export type IconName = keyof typeof MAP;

// Every content icon must be renderable.
type _Check = ContentIcon extends IconName ? true : never;
const _ok: _Check = true;
void _ok;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: SymbolViewProps['weight'];
  style?: StyleProp<ViewStyle>;
}

export const Icon = memo(function Icon({ name, size = 22, color, weight, style }: IconProps) {
  const { c } = useTheme();
  const pair: Pair = MAP[name];
  return (
    <SymbolView
      name={{ ios: pair.ios, android: pair.android, web: pair.android }}
      size={size}
      tintColor={color ?? c.tint}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={[{ width: size, height: size }, style]}
      accessible={false}
      importantForAccessibility="no"
    />
  );
});

export type TileTone = 'tint' | 'soft' | 'gray' | 'accent' | 'red';

/** 30 pt rounded icon tile for list rows (brief §13.3). */
export const IconTile = memo(function IconTile({
  name,
  tone = 'tint',
  size = 30,
}: {
  name: IconName;
  tone?: TileTone;
  size?: number;
}) {
  const { c, isDark } = useTheme();
  const bg = { tint: c.tint, soft: c.tintFill, gray: '#8E8E93', accent: c.accent, red: c.red }[tone];
  const fg = tone === 'soft' ? c.tint : tone === 'tint' ? c.onTint : tone === 'accent' ? (isDark ? c.onTint : c.accentText) : '#FFFFFF';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.23),
        borderCurve: 'continuous',
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} size={Math.round(size * 0.58)} color={fg} />
    </View>
  );
});

