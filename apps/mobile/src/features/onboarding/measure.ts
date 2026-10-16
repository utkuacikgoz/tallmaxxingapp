import { useState } from 'react';

import {
  checkRange,
  formatFtIn,
  formatWeight,
  RANGES,
  shouldShowErrorWhileTyping,
  type HeightUnit,
  type WeightUnit,
} from '@tallsoon/engine';

import { useT } from '@/i18n';
import type { MeasureChangeInfo } from '@/ui/MeasureField';

export type MeasureKind = 'childHeightCm' | 'weightKg' | 'parentHeightCm';

export interface MeasureState {
  value: number | null;
  info: MeasureChangeInfo;
  touched: boolean;
}

/** Field state + the §13.4 message rules (error on blur/Return or when far out of range). */
export function useMeasure(kind: MeasureKind, initial: number | null) {
  const [state, setState] = useState<MeasureState>({
    value: initial,
    info: { inchesInvalid: false, rawInUnit: initial },
    touched: false,
  });
  const status = state.info.inchesInvalid ? 'tooHigh' : checkRange(state.value, kind);
  const valid = status === 'valid';
  const farOut = shouldShowErrorWhileTyping(state.value, kind);
  const showError = !valid && status !== 'empty' && (state.touched || farOut || state.info.inchesInvalid);
  return {
    ...state,
    valid,
    showError,
    onChange: (value: number | null, info: MeasureChangeInfo) => setState((s) => ({ ...s, value, info })),
    onBlur: () => setState((s) => ({ ...s, touched: true })),
    touch: () => setState((s) => ({ ...s, touched: true })),
    set: (value: number | null) => setState({ value, info: { inchesInvalid: false, rawInUnit: value }, touched: false }),
  };
}

export function useMeasureCopy() {
  const t = useT();
  return {
    error(kind: MeasureKind, unit: HeightUnit | WeightUnit, inchesInvalid: boolean, who?: 'mother' | 'father') {
      if (inchesInvalid) return t('validation.inches');
      if (kind === 'childHeightCm') return unit === 'ftin' ? t('validation.heightFt') : t('validation.heightCm');
      if (kind === 'weightKg') return unit === 'lb' ? t('validation.weightLb') : t('validation.weightKg');
      const whoLabel = t(`validation.${who ?? 'mother'}`);
      return unit === 'ftin' ? t('validation.parentFt', { who: whoLabel }) : t('validation.parentCm', { who: whoLabel });
    },
    /** Live conversion hint under a valid field: "= 5′ 0″", "= 152 cm", "= 95 lb". */
    hint(kind: MeasureKind, unit: HeightUnit | WeightUnit, value: number) {
      if (kind === 'weightKg') return t('validation.converted', { value: formatWeight(value, unit === 'kg' ? 'lb' : 'kg') });
      return t('validation.converted', { value: unit === 'cm' ? formatFtIn(value) : `${Math.round(value)} cm` });
    },
  };
}

export { RANGES };
