import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { haptics } from '@/services/haptics';
import { Button } from '@/ui/Button';
import { Row } from '@/ui/List';

jest.mock('@/services/haptics', () => ({
  haptics: { light: jest.fn(), selection: jest.fn() },
}));

describe('shared control haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gives enabled buttons subtle feedback, while disabled and opted-out buttons stay quiet', async () => {
    const ui = await render(
      <>
        <Button title="Continue" testID="continue" onPress={jest.fn()} />
        <Button title="Busy" testID="busy" disabled onPress={jest.fn()} />
        <Button title="Confirm" testID="confirm" haptic="none" onPress={jest.fn()} />
      </>,
    );

    await fireEvent.press(ui.getByTestId('continue'));
    await fireEvent.press(ui.getByTestId('busy'));
    await fireEvent.press(ui.getByTestId('confirm'));
    expect(haptics.light).toHaveBeenCalledTimes(1);
    expect(haptics.selection).not.toHaveBeenCalled();
  });

  it('keeps rows quiet by default and can add feedback to a row without an existing haptic', async () => {
    const ui = await render(
      <>
        <Row title="Quiet" testID="quiet" onPress={jest.fn()} />
        <Row title="Select" testID="select" haptic="selection" onPress={jest.fn()} />
      </>,
    );

    await fireEvent.press(ui.getByTestId('quiet'));
    await fireEvent.press(ui.getByTestId('select'));
    expect(haptics.selection).toHaveBeenCalledTimes(1);
    expect(haptics.light).not.toHaveBeenCalled();
  });
});
