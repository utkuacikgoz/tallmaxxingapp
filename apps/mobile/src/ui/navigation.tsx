import type { NativeStackNavigationOptions } from 'expo-router/native-stack';
import { Platform } from 'react-native';

import { useT } from '@/i18n';
import { useTheme } from '@/theme';

/** Large title that collapses into an inline title over a translucent bar (brief §13.1). */
export function useLargeTitleOptions(): NativeStackNavigationOptions {
  const { c } = useTheme();
  const t = useT();
  const ios = Platform.OS === 'ios';
  return {
    headerLargeTitle: true,
    headerLargeTitleShadowVisible: false,
    headerShadowVisible: !ios,
    headerStyle: ios ? undefined : { backgroundColor: c.bg },
    headerTintColor: c.tint,
    headerTitleStyle: { color: c.label },
    headerLargeTitleStyle: { color: c.label },
    headerBackTitle: t('common.back'),
    contentStyle: { backgroundColor: c.bg },
  };
}
