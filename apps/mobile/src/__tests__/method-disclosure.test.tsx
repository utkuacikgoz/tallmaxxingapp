import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { expect, it, jest } from '@jest/globals';

jest.mock('@/i18n', () => ({
  useT: () => (key: string, options?: { method?: string }) => {
    if (key === 'method.viewCalculation') return `View ${options?.method} calculation`;
    if (key === 'method.hideCalculation') return `Hide ${options?.method} calculation`;
    return key;
  },
}));
jest.mock('@/features/child/useChild', () => ({ useActiveChild: () => null, useChildModel: () => null }));
jest.mock('@/features/onboarding/draft', () => ({ draft: () => ({}), draftBirthDate: () => null }));
jest.mock('@/state/settings', () => ({ useSettings: () => 'cm' }));
jest.mock('@/services/haptics', () => ({ haptics: { selection: jest.fn() } }));
jest.mock('@/theme', () => ({
  useTheme: () => ({ c: { fill: '#eeeeee', tint: '#267060', label2: '#555555' } }),
  monoFamily: 'monospace',
  radius: { field: 12, list: 12 },
  space: { margin: 16, sectionGap: 24, rowMinHeight: 44 },
}));
jest.mock('@/ui/List', () => ({ Section: () => null, Row: () => null }));
jest.mock('@/ui/Sheet', () => ({ SheetHeader: () => null, SheetScroll: () => null }));
jest.mock('@/ui/Icon', () => ({ Icon: () => null }));
jest.mock('@/ui/Text', () => {
  const ReactModule = require('react');
  const { Text: NativeText } = require('react-native');
  return {
    Text: ({ children, variant: _variant, color: _color, uppercase: _uppercase, tabular: _tabular, ...props }: Record<string, unknown>) =>
      ReactModule.createElement(NativeText, props, children),
  };
});

import { CalculationDisclosure } from '@/app/method';

const mockSelection = (jest.requireMock('@/services/haptics') as { haptics: { selection: jest.Mock } }).haptics.selection;

it('starts collapsed and exposes expanded state while showing the actual calculation', async () => {
  const formula = 'PAS = intercept + coefficients × measurements';
  await render(
    <CalculationDisclosure
      method="khamisRoche"
      title="Khamis–Roche"
      intro="This equation uses current measurements."
      formula={formula}
    />,
  );

  const button = screen.getByTestId('method-calculation-khamisRoche');
  expect(button.props.accessibilityState.expanded).toBe(false);
  expect(screen.queryByText(formula)).toBeNull();

  await act(async () => { fireEvent.press(button); });
  expect(screen.getByTestId('method-calculation-khamisRoche').props.accessibilityState.expanded).toBe(true);
  expect(screen.getByText(formula)).toBeTruthy();
  expect(screen.getByText('This equation uses current measurements.')).toBeTruthy();
  expect(mockSelection).toHaveBeenCalledTimes(1);

  await act(async () => { fireEvent.press(screen.getByTestId('method-calculation-khamisRoche')); });
  expect(screen.getByTestId('method-calculation-khamisRoche').props.accessibilityState.expanded).toBe(false);
  expect(screen.queryByText(formula)).toBeNull();
  expect(mockSelection).toHaveBeenCalledTimes(2);
});
