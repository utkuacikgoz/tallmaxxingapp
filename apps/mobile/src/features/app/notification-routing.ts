import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { childrenRepo } from '@/db/repo';
import { reminderRoute } from '@/services/reminder-plan';
import { useSettings } from '@/state/settings';

/** Handles both a cold launch and taps while running, after navigation and local data are ready. */
export function useNotificationRouting(ready: boolean) {
  const navigation = useRootNavigationState();
  useEffect(() => {
    if (!ready || !navigation?.key || Platform.OS === 'web') return;
    let disposed = false;
    const handled = new Set<string>();
    async function route(response: Notifications.NotificationResponse) {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const notification = response.notification;
      const key = `${notification.request.identifier}:${notification.date}`;
      if (handled.has(key)) return;
      handled.add(key);
      const target = reminderRoute(notification.request.identifier, notification.request.content.data?.url);
      if (!target || !useSettings.getState().hasCompletedOnboarding) return;
      const children = await childrenRepo.list();
      if (disposed || children.length === 0) return;
      Notifications.clearLastNotificationResponse();
      if (target === '/log' || target === '/score') router.push(target);
      else router.replace(target);
    }
    const receive = (response: Notifications.NotificationResponse) => { void route(response).catch(() => undefined); };
    const subscription = Notifications.addNotificationResponseReceivedListener(receive);
    const initial = Notifications.getLastNotificationResponse();
    if (initial) receive(initial);
    return () => { disposed = true; subscription.remove(); };
  }, [ready, navigation?.key]);
}
