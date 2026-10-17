import { jest } from '@jest/globals';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  let reducedMotion = false;
  return {
    __esModule: true,
    default: { View },
    Easing: { linear: jest.fn() },
    cancelAnimation: jest.fn(),
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useReducedMotion: () => reducedMotion,
    __setReducedMotion: (value: boolean) => { reducedMotion = value; },
    useSharedValue: (value: unknown) => ({ value }),
    withRepeat: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
