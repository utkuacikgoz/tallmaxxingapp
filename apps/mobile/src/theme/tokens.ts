import { Platform } from 'react-native';

/** Design tokens (brief §13.2). iOS system grouped colours with one sage-teal tint. */
export interface Palette {
  bg: string;
  card: string;
  cardElevated: string;
  sheetBg: string;
  label: string;
  label2: string;
  label3: string;
  separator: string;
  fill: string;
  fill2: string;
  tint: string;
  onTint: string;
  tintFill: string;
  tintPressed: string;
  accent: string;
  accentText: string;
  accentFill: string;
  red: string;
  orange: string;
  gray: string;
  /** Paywall cover is always dark. */
  cover: string;
  scrim: string;
}

export const light: Palette = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  sheetBg: '#F2F2F7',
  label: '#000000',
  // Darkened from system secondaryLabel to meet 4.5:1 on grouped backgrounds.
  label2: 'rgba(60,60,67,0.75)',
  label3: 'rgba(60,60,67,0.3)',
  separator: 'rgba(60,60,67,0.29)',
  fill: 'rgba(120,120,128,0.12)',
  fill2: 'rgba(118,118,128,0.12)',
  tint: '#2F7D6D',
  onTint: '#FFFFFF',
  tintFill: 'rgba(47,125,109,0.14)',
  tintPressed: '#276959',
  accent: '#F2A65A',
  accentText: '#8A490D',
  accentFill: 'rgba(242,166,90,0.18)',
  red: '#C52D25',
  orange: '#A95100',
  gray: '#8E8E93',
  cover: '#0B1412',
  scrim: 'rgba(0,0,0,0.4)',
};

export const dark: Palette = {
  bg: '#000000',
  card: '#1C1C1E',
  cardElevated: '#2C2C2E',
  sheetBg: '#1C1C1E',
  label: '#FFFFFF',
  label2: 'rgba(235,235,245,0.6)',
  label3: 'rgba(235,235,245,0.3)',
  separator: 'rgba(84,84,88,0.65)',
  fill: 'rgba(120,120,128,0.36)',
  fill2: 'rgba(118,118,128,0.24)',
  tint: '#5FB8A5',
  onTint: '#03231C',
  tintFill: 'rgba(95,184,165,0.20)',
  tintPressed: '#4FA390',
  accent: '#F4B677',
  accentText: '#F4B677',
  accentFill: 'rgba(244,182,119,0.18)',
  red: '#FF453A',
  orange: '#FF9F0A',
  gray: '#8E8E93',
  cover: '#0B1412',
  scrim: 'rgba(0,0,0,0.6)',
};

export const radius = { list: 12, button: 14, sheet: 16, field: 12, tile: 7, pill: 999 } as const;

export const space = {
  margin: 16,
  sectionGap: 28,
  rowMinHeight: Platform.OS === 'android' ? 48 : 44,
  hitSlop: 8,
} as const;

/** 44 pt on iOS, 48 dp on Android. */
export const minTouch = Platform.OS === 'android' ? 48 : 44;

/** Light haptic/auto-advance delay (brief §13.4). */
export const autoAdvanceMs = { normal: 350, reducedMotion: 150 } as const;
