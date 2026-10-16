import WheelPicker, { type PickerItem } from '@quidone/react-native-wheel-picker';
import { memo, useMemo } from 'react';
import { AccessibilityActionEvent, StyleSheet, View } from 'react-native';

import { haptics } from '@/services/haptics';
import { radius, typeScale, useTheme } from '@/theme';

export interface MonthYear {
  month: number; // 1–12
  year: number;
}

export interface MonthYearWheelProps {
  value: MonthYear;
  minYear: number;
  maxYear: number;
  monthNames: string[];
  onChange: (next: MonthYear) => void;
  monthA11y: string;
  yearA11y: string;
}

const ITEM_HEIGHT = 36;
const VISIBLE = 6; // ≈ 216 pt tall (brief §13.4)

/**
 * Inline two-column wheel: Month (right-aligned) | Year (left-aligned), 3D fade, a light haptic per
 * detent, tap an item to select it. Each column is "adjustable" for VoiceOver / TalkBack.
 */
export const MonthYearWheel = memo(function MonthYearWheel({
  value,
  minYear,
  maxYear,
  monthNames,
  onChange,
  monthA11y,
  yearA11y,
}: MonthYearWheelProps) {
  const { c } = useTheme();
  const months = useMemo<PickerItem<number>[]>(() => monthNames.map((label, i) => ({ value: i + 1, label })), [monthNames]);
  const years = useMemo<PickerItem<number>[]>(() => {
    const out: PickerItem<number>[] = [];
    for (let y = minYear; y <= maxYear; y += 1) out.push({ value: y, label: String(y) });
    return out;
  }, [minYear, maxYear]);

  const textStyle = { ...typeScale.title3, fontWeight: '400' as const, color: c.label };

  const adjust = (column: 'month' | 'year') => (e: AccessibilityActionEvent) => {
    const step = e.nativeEvent.actionName === 'increment' ? 1 : -1;
    if (column === 'month') {
      const m = Math.min(12, Math.max(1, value.month + step));
      onChange({ ...value, month: m });
    } else {
      const y = Math.min(maxYear, Math.max(minYear, value.year + step));
      onChange({ ...value, year: y });
    }
    haptics.selection();
  };

  const overlay = () => (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: 'center', paddingHorizontal: 8 },
      ]}
    >
      <View style={{ height: ITEM_HEIGHT, borderRadius: 8, backgroundColor: c.fill2 }} />
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      {overlay()}
      <View style={styles.columns}>
        <View
          style={styles.col}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={monthA11y}
          accessibilityValue={{ text: monthNames[value.month - 1] }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={adjust('month')}
        >
          <WheelPicker
            data={months}
            value={value.month}
            itemHeight={ITEM_HEIGHT}
            visibleItemCount={VISIBLE}
            enableScrollByTapOnItem
            renderOverlay={null}
            itemTextStyle={[textStyle, { textAlign: 'right', paddingRight: 14 }]}
            onValueChanging={() => haptics.selection()}
            onValueChanged={({ item }) => onChange({ ...value, month: item.value })}
            width="100%"
          />
        </View>
        <View
          style={styles.col}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={yearA11y}
          accessibilityValue={{ text: String(value.year) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={adjust('year')}
        >
          <WheelPicker
            data={years}
            value={value.year}
            itemHeight={ITEM_HEIGHT}
            visibleItemCount={VISIBLE}
            enableScrollByTapOnItem
            renderOverlay={null}
            itemTextStyle={[textStyle, { textAlign: 'left', paddingLeft: 14, fontVariant: ['tabular-nums'] }]}
            onValueChanging={() => haptics.selection()}
            onValueChanged={({ item }) => onChange({ ...value, year: item.value })}
            width="100%"
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: radius.list,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  columns: { flexDirection: 'row' },
  col: { flex: 1 },
});
