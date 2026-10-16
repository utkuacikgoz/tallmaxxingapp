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
    headerTransparent: ios,
    headerBlurEffect: ios ? 'systemChromeMaterial' : undefined,
    headerLargeTitleShadowVisible: false,
    headerShadowVisible: !ios,
    headerLargeStyle: { backgroundColor: c.bg },
    headerStyle: ios ? undefined : { backgroundColor: c.bg },
    headerTintColor: c.tint,
    headerTitleStyle: { color: c.label },
    headerBackTitle: t('common.back'),
    contentStyle: { backgroundColor: c.bg },
  };
}
