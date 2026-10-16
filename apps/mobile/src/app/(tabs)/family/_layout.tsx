import { Stack } from 'expo-router';

import { useLargeTitleOptions } from '@/ui/navigation';

export default function TabStack() {
  const options = useLargeTitleOptions();
  return <Stack screenOptions={options} />;
}
