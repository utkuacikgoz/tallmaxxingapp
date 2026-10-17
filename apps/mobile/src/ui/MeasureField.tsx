import type React from 'react';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type ReturnKeyTypeOptions } from 'react-native';

import {
  cmToFtIn,
  ftInToCm,
  kgToLb,
  lbToKg,
  parseDecimal,
  sanitizeDecimal,
  type HeightUnit,
  type WeightUnit,
} from '@tallsoon/engine';

import { radius, roundedFamily, useTheme } from '@/theme';
import { Text } from './Text';

export type MeasureUnit = HeightUnit | WeightUnit;

export interface MeasureChangeInfo {
  /** ft/in mode with inches outside 0–11. */
  inchesInvalid: boolean;
  /** Raw value entered in the active unit (for "far out of range" checks). */
  rawInUnit: number | null;
}

export interface MeasureFieldHandle {
  focus: () => void;
}

export interface MeasureFieldProps {
  unit: MeasureUnit;
  /** Metric value (cm or kg) owned by the parent. */
  value: number | null;
  onChange: (metric: number | null, info: MeasureChangeInfo) => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  invalid?: boolean;
  size?: 'large' | 'compact';
  autoFocus?: boolean;
  accessibilityLabel: string;
  placeholder?: string;
  testID?: string;
}

function metricToText(value: number | null, unit: MeasureUnit): string {
  if (value == null) return '';
  if (unit === 'lb') return String(Math.round(kgToLb(value)));
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function metricToFtIn(value: number | null): { ft: string; inch: string } {
  if (value == null) return { ft: '', inch: '' };
  const { feet, inches } = cmToFtIn(value, 1);
  return { ft: String(feet), inch: String(Math.round(inches)) };
}

/**
 * Large numeric field(s) with the unit inside (brief §13.4). Starts empty with a placeholder,
 * decimal keypad, "." or "," accepted. ft / in shows two fields; a digit in ft jumps to in.
 * Switching units re-derives the text without calling onChange, so an untouched converted value
 * keeps full precision (152 cm → 5′ 0″ → 152 cm).
 */
export const MeasureField = memo(
  forwardRef<MeasureFieldHandle, MeasureFieldProps>(function MeasureField(
    {
      unit,
      value,
      onChange,
      onBlur,
      onSubmitEditing,
      returnKeyType = 'next',
      invalid,
      size = 'large',
      autoFocus,
      accessibilityLabel,
      placeholder,
      testID,
    },
    ref,
  ) {
    const { c } = useTheme();
    const isFtIn = unit === 'ftin';
    const [text, setText] = useState(() => (isFtIn ? '' : metricToText(value, unit)));
    const [ftIn, setFtIn] = useState(() => (isFtIn ? metricToFtIn(value) : { ft: '', inch: '' }));
    const [focused, setFocused] = useState<null | 'a' | 'b'>(null);
    const aRef = useRef<React.ComponentRef<typeof TextInput>>(null);
    const bRef = useRef<React.ComponentRef<typeof TextInput>>(null);
    const lastUnit = useRef(unit);
    const lastValue = useRef(value);
    const emittedValue = useRef<number | null | undefined>(undefined);

    useImperativeHandle(ref, () => ({ focus: () => aRef.current?.focus() }), []);

    // Re-derive on unit changes and external value resets. Values emitted by typing already have
    // matching local text, so don't round-trip those through a display conversion.
    useEffect(() => {
      const unitChanged = lastUnit.current !== unit;
      const valueChangedExternally = lastValue.current !== value && emittedValue.current !== value;
      if (unitChanged || valueChangedExternally) {
        lastUnit.current = unit;
        if (unit === 'ftin') setFtIn(metricToFtIn(value));
        else setText(metricToText(value, unit));
      }
      lastUnit.current = unit;
      lastValue.current = value;
      emittedValue.current = undefined;
    }, [unit, value]);

    useEffect(() => {
      if (!autoFocus) return;
      // After the push transition so the keypad comes up with the screen (brief §13.4).
      const id = setTimeout(() => aRef.current?.focus(), Platform.OS === 'android' ? 350 : 500);
      return () => clearTimeout(id);
    }, [autoFocus]);

    const emitSingle = (raw: string) => {
      const clean = sanitizeDecimal(raw, 1);
      setText(clean);
      const n = parseDecimal(clean);
      const metric = n == null ? null : unit === 'lb' ? lbToKg(n) : n;
      emittedValue.current = metric;
      onChange(metric, { inchesInvalid: false, rawInUnit: n });
    };

    const emitFtIn = (ft: string, inch: string) => {
      setFtIn({ ft, inch });
      const f = parseDecimal(ft);
      const i = inch === '' ? 0 : parseDecimal(inch);
      if (f == null) {
        emittedValue.current = null;
        return onChange(null, { inchesInvalid: false, rawInUnit: null });
      }
      const inchesInvalid = i == null || i < 0 || i > 11;
      if (inchesInvalid) {
        emittedValue.current = null;
        return onChange(null, { inchesInvalid: true, rawInUnit: null });
      }
      const cm = ftInToCm(f, i ?? 0);
      emittedValue.current = cm;
      onChange(cm, { inchesInvalid: false, rawInUnit: cm });
    };

    const large = size === 'large';
    const ringColor = invalid ? c.red : c.tint;
    const fieldBg = large ? c.card : c.fill;
    const digitSize = large ? 40 : 22;
    const unitLabel = (u: string) => (
      <Text variant={large ? 'title3' : 'body'} color="label2" weight={large ? '600' : '400'} style={styles.suffix}>
        {u}
      </Text>
    );

    const box = (which: 'a' | 'b', child: React.ReactNode, suffix: string, flex = 1) => (
      <Pressable
        onPress={() => (which === 'a' ? aRef : bRef).current?.focus()}
        accessible={false}
        style={[
          large ? styles.large : styles.compact,
          { backgroundColor: fieldBg, flex: large ? flex : undefined },
          (invalid || focused === which) && { borderColor: ringColor, borderWidth: 2 },
          !(invalid || focused === which) && { borderColor: 'transparent', borderWidth: 2 },
        ]}
      >
        {child}
        {unitLabel(suffix)}
      </Pressable>
    );

    const inputStyle = [
      styles.input,
      { color: c.label, fontSize: digitSize, fontFamily: roundedFamily, minWidth: large ? 40 : 44 },
      large ? styles.inputLarge : styles.inputCompact,
    ];

    const common = {
      keyboardType: 'decimal-pad' as const,
      placeholderTextColor: c.label3,
      selectionColor: c.tint,
      allowFontScaling: true,
      maxFontSizeMultiplier: 1.6,
      onBlur: () => {
        setFocused(null);
        onBlur?.();
      },
    };

    if (!isFtIn) {
      return (
        <View style={[styles.row, !large && { alignSelf: 'flex-start' }]}>
          {box(
            'a',
            <TextInput
              {...common}
              ref={aRef}
              testID={testID}
              value={text}
              onChangeText={emitSingle}
              onFocus={() => setFocused('a')}
              placeholder={placeholder}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              submitBehavior={returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'}
              accessibilityLabel={accessibilityLabel}
              accessibilityState={{ disabled: false }}
              aria-invalid={invalid}
              maxLength={5}
              style={inputStyle}
            />,
            unit,
          )}
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {box(
          'a',
          <TextInput
            {...common}
            ref={aRef}
            testID={testID ? `${testID}-ft` : undefined}
            value={ftIn.ft}
            keyboardType="number-pad"
            onChangeText={(raw) => {
              const ft = sanitizeDecimal(raw, 0).slice(0, 1);
              emitFtIn(ft, ftIn.inch);
              // A digit in ft jumps to in (brief §13.4).
              if (ft.length === 1) bRef.current?.focus();
            }}
            onFocus={() => setFocused('a')}
            placeholder={large ? '5' : '5'}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => bRef.current?.focus()}
            accessibilityLabel={`${accessibilityLabel}, feet`}
            maxLength={1}
            style={inputStyle}
          />,
          'ft',
        )}
        {box(
          'b',
          <TextInput
            {...common}
            ref={bRef}
            testID={testID ? `${testID}-in` : undefined}
            value={ftIn.inch}
            onChangeText={(raw) => emitFtIn(ftIn.ft, sanitizeDecimal(raw, 1).slice(0, 4))}
            onFocus={() => setFocused('b')}
            placeholder="0"
            returnKeyType={returnKeyType}
            submitBehavior={returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'}
            onSubmitEditing={onSubmitEditing}
            accessibilityLabel={`${accessibilityLabel}, inches`}
            style={inputStyle}
          />,
          'in',
        )}
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  large: {
    minHeight: 76,
    borderRadius: radius.field,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  compact: {
    minHeight: 48,
    minWidth: 112,
    borderRadius: 10,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: { padding: 0, margin: 0, fontWeight: '700', fontVariant: ['tabular-nums'] },
  inputLarge: { flex: 1, paddingVertical: 10 },
  inputCompact: { width: 64, flexShrink: 1, textAlign: 'right', paddingVertical: 8 },
  suffix: { marginLeft: 6 },
});
