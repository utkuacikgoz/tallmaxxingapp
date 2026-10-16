import { useColorScheme } from 'react-native';

import { dark, light, type Palette } from './tokens';

export * from './tokens';
export * from './typography';

export interface Theme {
  c: Palette;
  isDark: boolean;
}

const LIGHT: Theme = { c: light, isDark: false };
const DARK: Theme = { c: dark, isDark: true };

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK : LIGHT;
}
