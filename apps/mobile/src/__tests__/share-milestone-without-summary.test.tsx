import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { expect, it, jest } from '@jest/globals';

jest.mock('expo-media-library', () => ({ Asset: { create: jest.fn() }, requestPermissionsAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: () => ({ milestone: '7' }) }));
jest.mock('@/features/child/useChild', () => ({
  useActiveChild: () => ({ nickname: 'Sam', sexAtBirth: 'male' }),
  useChildModel: () => ({ summary: null }),
}));
jest.mock('@/state/settings', () => {
  const state = { role: 'parent', heightUnit: 'cm' };
  const useSettings = (selector: (value: typeof state) => unknown) => selector(state);
  useSettings.getState = () => state;
  return { useSettings };
});
jest.mock('@/i18n', () => ({
  useT: () => (key: string) => ({
    'retention.shareTitle': 'Share milestone',
    'retention.milestone.7': '7-day streak',
    'retention.cardBody': 'Small steps add up.',
    'retention.cardFooter': 'TallSoon',
    'retention.story': 'Story',
    'retention.square': 'Square post',
    'share.saveImage': 'Save image',
    'share.more': 'More options',
    'common.close': 'Close',
  })[key] ?? key,
}));
jest.mock('@/features/brand/AppIcon', () => ({ AppIcon: () => null }));
jest.mock('@/ui/Icon', () => ({ Icon: () => null }));
jest.mock('@/ui/Text', () => {
  const ReactModule = require('react');
  const NativeText = require('react-native').Text;
  return { Text: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => ReactModule.createElement(NativeText, props, children) };
});
jest.mock('@/features/share/ResultCard', () => ({ ResultCard: () => null }));
jest.mock('@/ui/Button', () => ({
  Button: ({ title, testID }: { title: string; testID?: string }) => {
    const ReactModule = require('react');
    const { Pressable: NativePressable, Text: NativeText } = require('react-native');
    return ReactModule.createElement(NativePressable, { testID, accessibilityRole: 'button' }, ReactModule.createElement(NativeText, null, title));
  },
}));
jest.mock('@/ui/List', () => {
  const ReactModule = require('react');
  const { Text: NativeText, View: NativeView } = require('react-native');
  return {
    Section: ({ children }: { children: React.ReactNode }) => ReactModule.createElement(NativeView, null, children),
    Row: ({ title }: { title: string }) => ReactModule.createElement(NativeText, null, title),
  };
});

import ShareSheet from '@/app/share';

it('renders a milestone share card and square action when the child has no measurement summary', async () => {
  await render(<ShareSheet />);

  expect(screen.getByText('Share milestone')).toBeTruthy();
  expect(screen.getByTestId('milestone-card')).toBeTruthy();
  expect(screen.getByText('7-day streak')).toBeTruthy();
  expect(screen.getByTestId('milestone-square')).toBeTruthy();
});
