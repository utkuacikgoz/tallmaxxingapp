import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '@/theme';

export default function OnboardingLayout() {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
        animation: reduced ? 'fade' : 'default',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="loader" options={{ gestureEnabled: false, animation: 'fade' }} />
    </Stack>
  );
}
