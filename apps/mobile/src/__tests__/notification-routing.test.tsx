import { it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { childrenRepo } from '@/db/repo';
import { useNotificationRouting } from '@/features/app/notification-routing';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useRootNavigationState: () => ({ key: 'mounted' }),
}));
jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'default',
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock('@/db/repo', () => ({ childrenRepo: { list: jest.fn(async () => [{ id: 'local' }]) } }));
jest.mock('@/state/settings', () => ({ useSettings: { getState: () => ({ hasCompletedOnboarding: true }) } }));

function response(id: string, url?: string): Notifications.NotificationResponse {
  return { actionIdentifier: 'default', notification: { date: 123, request: { identifier: id, trigger: null, content: { title: null, subtitle: null, body: null, sound: null, categoryIdentifier: null, threadIdentifier: null, data: { url } } } } };
}
beforeEach(() => {
  jest.mocked(Notifications.getLastNotificationResponse).mockReturnValue(null);
  jest.mocked(childrenRepo.list).mockResolvedValue([{ id: 'local' }] as Awaited<ReturnType<typeof childrenRepo.list>>);
});

it('routes a cold-launch measurement tap after data and navigation are ready, then clears it', async () => {
  jest.mocked(Notifications.getLastNotificationResponse).mockReturnValue(response('free.remeasure'));
  const ui = await renderHook(({ ready }: { ready: boolean }) => useNotificationRouting(ready), { initialProps: { ready: false } });
  expect(router.replace).not.toHaveBeenCalled();
  await ui.rerender({ ready: true });
  await waitFor(() => expect(router.push).toHaveBeenCalledWith('/log'));
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
});

it('routes a warm trial tap once and removes the listener on unmount', async () => {
  const remove = jest.fn();
  jest.mocked(Notifications.addNotificationResponseReceivedListener).mockReturnValue({ remove });
  const ui = await renderHook(() => useNotificationRouting(true));
  const receive = jest.mocked(Notifications.addNotificationResponseReceivedListener).mock.calls.at(-1)![0];
  await act(async () => { receive(response('sub.trial', 'tallsoon://family')); receive(response('sub.trial', 'tallsoon://family')); });
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith('/(tabs)/family');
  await ui.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});

it('ignores arbitrary external links and notifications for deleted local data', async () => {
  jest.mocked(Notifications.getLastNotificationResponse).mockReturnValue(response('unknown', 'https://example.com'));
  const ui = await renderHook(() => useNotificationRouting(true));
  expect(router.replace).not.toHaveBeenCalled();
  jest.mocked(childrenRepo.list).mockResolvedValue([]);
  const receive = jest.mocked(Notifications.addNotificationResponseReceivedListener).mock.calls.at(-1)![0];
  await act(async () => receive(response('plan.checkin')));
  expect(router.replace).not.toHaveBeenCalled();
  expect(router.push).not.toHaveBeenCalled();
  await ui.unmount();
});
