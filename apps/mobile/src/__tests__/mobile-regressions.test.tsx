import React, { useState } from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Pressable, Text as NativeText, View } from 'react-native';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  let focused = true;
  return {
    __setFocused: (value: boolean) => { focused = value; },
    router: { canGoBack: jest.fn(() => true), back: jest.fn(), replace: jest.fn(), push: jest.fn() },
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: (callback: () => void) => require('react').useEffect(() => focused ? callback() : undefined, [callback, focused]),
  };
});

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('@/features/paywall/BubbleBackground', () => ({ BubbleBackground: () => null }));
jest.mock('@/features/brand/AppIcon', () => ({ AppIcon: () => null }));
jest.mock('@/services/haptics', () => ({ haptics: { light: jest.fn(), warning: jest.fn(), success: jest.fn() } }));
jest.mock('@/services/analytics', () => ({ analytics: { track: jest.fn() } }));
jest.mock('@/services/links', () => ({ openLegal: jest.fn() }));
jest.mock('@/services/entitlements/revenuecat', () => ({ createRevenueCatService: jest.fn() }));
jest.mock('@/state/settings', () => {
  const state = { role: 'parent', heightUnit: 'cm', proHint: false, set: jest.fn() };
  const useSettings = (selector: (s: typeof state) => unknown) => selector(state);
  useSettings.getState = () => state;
  return { useSettings };
});
jest.mock('@/state/storage', () => ({ kv: { getString: () => undefined, set: jest.fn(), delete: jest.fn() }, zustandStorage: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn() } }));
jest.mock('@/ui/List', () => ({
  Section: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
  Row: (props: { title: string; onPress?: () => void; checked?: boolean; testID?: string; accessibilityRole?: string }) => {
    const { Pressable, Text } = require('react-native');
    return <Pressable testID={props.testID} accessibilityRole={props.accessibilityRole} accessibilityState={{ checked: props.checked }} onPress={props.onPress}><Text>{props.title}</Text></Pressable>;
  },
}));
jest.mock('@/features/onboarding/StepScreen', () => ({
  StepScreen: ({ children, bottom }: { children: React.ReactNode; bottom: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}{bottom}</View>;
  },
  FieldMessage: () => null,
}));
jest.mock('@/features/onboarding/flow', () => ({
  useStep: () => ({ progress: { step: 1, total: 8 }, backLabel: 'Back', continueLabel: 'Continue', advance: jest.fn() }),
}));

import { ChoiceList } from '@/features/onboarding/ChoiceList';
import { useDraft } from '@/features/onboarding/draft';
import ParentsStep from '@/app/onboarding/parents';
import PubertyStep from '@/app/onboarding/puberty';
import Paywall from '@/app/paywall';
import { MeasureField } from '@/ui/MeasureField';
import { entitlements, savePercent, type Offering } from '@/services/entitlements';

const offer: Offering = {
  annual: { plan: 'annual', priceString: '$39.99', price: 39.99, currencyCode: 'USD', ref: 'annual' },
  annualTrial: { plan: 'annual', priceString: '$39.99', price: 39.99, currencyCode: 'USD', ref: 'trial' },
  weekly: { plan: 'weekly', priceString: '$4.99', price: 4.99, currencyCode: 'USD', ref: 'weekly' },
  isExample: false,
};

describe('paywall purchase disclosure', () => {
  beforeEach(() => {
    jest.spyOn(entitlements, 'getOffering').mockResolvedValue(offer);
  });

  it('computes savings from actual prices and shows annual CTA and renewal terms by default', async () => {
    expect(savePercent(39.99, 4.99)).toBe(84);
    expect(savePercent(0, 4.99)).toBeNull();
    expect(savePercent(500, 4.99)).toBeNull();
    const ui = await render(<Paywall />);
    expect(await ui.findByText(/Save 84%/)).toBeTruthy();
    expect(ui.getByTestId('paywall-cta').props.accessibilityLabel).toBe('Start My Growth Plan · $39.99/year');
    expect(ui.getByTestId('paywall-terms').props.children).toContain('Billed $39.99 per year. Renews every year until you cancel.');
    expect(ui.getByTestId('trial-toggle').props.value).toBe(false);
  });

  it('uses weekly price and renewal terms after selecting weekly; trial is annual-only', async () => {
    const ui = await render(<Paywall />);
    await ui.findByTestId('plan-weekly');
    await fireEvent.press(ui.getByTestId('plan-weekly'));
    expect(ui.getByTestId('paywall-cta').props.accessibilityLabel).toBe('Start My Growth Plan · $4.99/week');
    expect(ui.getByTestId('paywall-terms').props.children).toContain('Billed $4.99 every week. Renews every week until you cancel.');
    expect(ui.queryByTestId('trial-toggle')).toBeNull();
  });

  it('shows trial CTA and conversion terms only when the annual trial is available and opted in', async () => {
    const ui = await render(<Paywall />);
    await ui.findByTestId('trial-toggle');
    await fireEvent(ui.getByTestId('trial-toggle'), 'valueChange', true);
    expect(ui.getByTestId('paywall-cta').props.accessibilityLabel).toBe('Start 7-Day Free Trial');
    expect(ui.getByTestId('paywall-terms').props.children).toContain('Free for 7 days, then $39.99 per year.');
    expect(ui.getByTestId('paywall-terms').props.children).toContain('Cancel at least 24 hours before the trial ends');
  });

  it('does not offer a trial when the store package has no trial eligibility', async () => {
    jest.spyOn(entitlements, 'getOffering').mockResolvedValue({ ...offer, annualTrial: null });
    const ui = await render(<Paywall />);
    await ui.findByTestId('plan-annual');
    expect(ui.queryByTestId('trial-toggle')).toBeNull();
    expect(ui.getByTestId('paywall-cta').props.accessibilityLabel).toBe('Start My Growth Plan · $39.99/year');
  });

  it('uses the store localized prices and hides savings when plan currencies differ', async () => {
    const euroOffer: Offering = {
      annual: { ...offer.annual, priceString: '€35,99', price: 35.99, currencyCode: 'EUR' },
      annualTrial: { ...offer.annualTrial!, priceString: '€42,99', price: 42.99, currencyCode: 'EUR' },
      weekly: { ...offer.weekly, priceString: '€4,49', price: 4.49, currencyCode: 'EUR' },
      isExample: false,
    };
    jest.spyOn(entitlements, 'getOffering').mockResolvedValue(euroOffer);
    const ui = await render(<Paywall />);
    await ui.findByTestId('trial-toggle');
    expect(ui.getByTestId('paywall-cta').props.accessibilityLabel).toBe('Start My Growth Plan · €35,99/year');
    expect(ui.getByTestId('paywall-terms').props.children).toContain('Billed €35,99 per year.');
    expect(ui.getByTestId('plan-annual').props.accessibilityLabel).toContain('€35,99/year');

    await fireEvent(ui.getByTestId('trial-toggle'), 'valueChange', true);
    expect(ui.getByTestId('paywall-terms').props.children).toContain('Free for 7 days, then €42,99 per year.');

    jest.spyOn(entitlements, 'getOffering').mockResolvedValue({ ...euroOffer, weekly: { ...euroOffer.weekly, currencyCode: 'USD' } });
    const mismatched = await render(<Paywall />);
    await mismatched.findByTestId('plan-annual');
    expect(mismatched.queryByText(/Save \d+%/)).toBeNull();
  });
});

describe('onboarding input regressions', () => {
  beforeEach(() => useDraft.getState().reset());

  it('locks ChoiceList through auto-advance until focus returns', async () => {
    jest.useFakeTimers();
    (jest.requireMock('expo-router') as { __setFocused: (focused: boolean) => void }).__setFocused(true);
    const onSelect = jest.fn();
    const onAdvance = jest.fn();
    const view = await render(<ChoiceList choices={[{ value: 'parent', title: 'Parent' }, { value: 'teen', title: 'Teen' }]} value={null} onSelect={onSelect} onAdvance={onAdvance} />);
    await fireEvent.press(view.getByText('Parent'));
    await fireEvent.press(view.getByText('Teen'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onAdvance).toHaveBeenCalledWith('parent');

    await fireEvent.press(view.getByText('Teen'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await view.unmount();
    await act(async () => { jest.runOnlyPendingTimers(); });
    expect(onAdvance).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('cancels pending auto-advance on blur and resets the lock when focused again', async () => {
    jest.useFakeTimers();
    const routerMock = jest.requireMock('expo-router') as { __setFocused: (focused: boolean) => void };
    routerMock.__setFocused(true);
    const onAdvance = jest.fn();
    const props = { choices: [{ value: 'parent', title: 'Parent' }, { value: 'teen', title: 'Teen' }], value: null, onSelect: jest.fn(), onAdvance };
    const ui = await render(<ChoiceList {...props} />);
    await fireEvent.press(ui.getByText('Parent'));
    routerMock.__setFocused(false);
    await ui.rerender(<ChoiceList {...props} />);
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(onAdvance).not.toHaveBeenCalled();

    routerMock.__setFocused(true);
    await ui.rerender(<ChoiceList {...props} />);
    await fireEvent.press(ui.getByText('Teen'));
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onAdvance).toHaveBeenCalledWith('teen');
    await ui.unmount();
    jest.useRealTimers();
  });

  it('uses the shorter auto-advance delay with Reduce Motion enabled', async () => {
    jest.useFakeTimers();
    (jest.requireMock('react-native-reanimated') as { __setReducedMotion: (enabled: boolean) => void }).__setReducedMotion(true);
    const onAdvance = jest.fn();
    const ui = await render(<ChoiceList choices={[{ value: 'parent', title: 'Parent' }]} value={null} onSelect={jest.fn()} onAdvance={onAdvance} />);
    await fireEvent.press(ui.getByText('Parent'));
    await act(async () => { jest.advanceTimersByTime(149); });
    expect(onAdvance).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(onAdvance).toHaveBeenCalledWith('parent');
    await ui.unmount();
    (jest.requireMock('react-native-reanimated') as { __setReducedMotion: (enabled: boolean) => void }).__setReducedMotion(false);
    jest.useRealTimers();
  });

  it('switches 152 cm to feet/inches and back without rounding the stored metric value', async () => {
    function Harness() {
      const [unit, setUnit] = useState<'cm' | 'ftin'>('cm');
      const [value, setValue] = useState<number | null>(152);
      return <View>
        <MeasureField testID="height" unit={unit} value={value} onChange={(next) => setValue(next)} accessibilityLabel="Height" />
        <Pressable testID="switch-units" onPress={() => setUnit((u) => u === 'cm' ? 'ftin' : 'cm')}><NativeText>Switch</NativeText></Pressable>
        <NativeText testID="metric-value">{String(value)}</NativeText>
      </View>;
    }
    const ui = await render(<Harness />);
    await fireEvent.press(ui.getByTestId('switch-units'));
    await waitFor(() => expect(ui.getByTestId('height-ft').props.value).not.toBe(''));
    await fireEvent.press(ui.getByTestId('switch-units'));
    await waitFor(() => expect(ui.getByTestId('height').props.value).toBe('152'));
    expect(ui.getByTestId('metric-value').props.children).toBe('152');
  });

  it('rounds feet/inches across the inch carry and refreshes fields after an external reset', async () => {
    function Harness() {
      const [value, setValue] = useState<number | null>(182.8);
      return <View>
        <MeasureField testID="height" unit="ftin" value={value} onChange={setValue} accessibilityLabel="Height" />
        <Pressable testID="reset-height" onPress={() => setValue(190)}><NativeText>Reset</NativeText></Pressable>
      </View>;
    }
    const ui = await render(<Harness />);
    expect(ui.getByTestId('height-ft').props.value).toBe('6');
    expect(ui.getByTestId('height-in').props.value).toBe('0');
    await fireEvent.press(ui.getByTestId('reset-height'));
    await waitFor(() => expect(ui.getByTestId('height-ft').props.value).toBe('6'));
    expect(ui.getByTestId('height-in').props.value).toBe('3');
  });

  it('preserves kilogram precision when switching to rounded pounds and back', async () => {
    function Harness() {
      const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
      const [value, setValue] = useState<number | null>(63.7);
      return <View>
        <MeasureField testID="weight" unit={unit} value={value} onChange={(next) => setValue(next)} accessibilityLabel="Weight" />
        <Pressable testID="switch-weight" onPress={() => setUnit((u) => u === 'kg' ? 'lb' : 'kg')}><NativeText>Switch</NativeText></Pressable>
        <NativeText testID="weight-kg">{String(value)}</NativeText>
      </View>;
    }
    const ui = await render(<Harness />);
    await fireEvent.press(ui.getByTestId('switch-weight'));
    await waitFor(() => expect(ui.getByTestId('weight').props.value).toBe('140'));
    await fireEvent.press(ui.getByTestId('switch-weight'));
    await waitFor(() => expect(ui.getByTestId('weight').props.value).toBe('63.7'));
    expect(ui.getByTestId('weight-kg').props.children).toBe('63.7');
  });

  it('allows only one unknown parent', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const ui = await render(<ParentsStep />);
    await fireEvent.press(ui.getByLabelText(/Don’t know, Mother/));
    expect(useDraft.getState().unknownParent).toBe('mother');
    await fireEvent.press(ui.getByLabelText(/Don’t know, Father/));
    expect(useDraft.getState().unknownParent).toBe('mother');
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  it.each(['male', 'female'] as const)('shows %s puberty signs alphabetically and keeps exclusive choices separate', async (sex) => {
    useDraft.getState().patch({ sex, pubertySigns: [] });
    const ui = await render(<PubertyStep />);
    const rows = ui.getAllByRole('checkbox');
    const signRows = rows.filter((row) => !['puberty-none', 'puberty-unsure'].includes(row.props.testID));
    const labels = signRows.map((row) => within(row).getByText(/.+/).props.children as string);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    expect(rows.slice(-2).map((row) => row.props.testID)).toEqual(['puberty-none', 'puberty-unsure']);
  });

  it('keeps puberty exclusive options exclusive in both directions', async () => {
    useDraft.getState().patch({ sex: 'male', pubertySigns: [] });
    const ui = await render(<PubertyStep />);
    await fireEvent.press(ui.getByTestId('puberty-none'));
    expect(useDraft.getState().pubertySigns).toEqual(['none']);
    await fireEvent.press(ui.getByTestId('puberty-acne'));
    expect(useDraft.getState().pubertySigns).toEqual(['acne']);
    await fireEvent.press(ui.getByTestId('puberty-unsure'));
    expect(useDraft.getState().pubertySigns).toEqual(['unsure']);
    await fireEvent.press(ui.getByTestId('puberty-unsure'));
    expect(useDraft.getState().pubertySigns).toEqual([]);
  });
});
