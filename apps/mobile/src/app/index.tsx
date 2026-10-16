import { Redirect } from 'expo-router';

import { useChildren } from '@/features/child/useChild';
import { useSettings } from '@/state/settings';

/** First launch → onboarding. Otherwise straight to the app. */
export default function Index() {
  const done = useSettings((s) => s.hasCompletedOnboarding);
  const kids = useChildren();
  if (!done) return <Redirect href="/onboarding" />;
  if (kids.length === 0) return null;
  return <Redirect href="/(tabs)/today" />;
}
