import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light impact on selection, wheel detents and habit ticks; success on result reveal and purchase
 * (brief §13.1). Android stays subtler: selection clicks only.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function run(effect: () => Promise<void>) {
  if (!enabled) return;
  void Promise.resolve().then(effect).catch(() => undefined);
}

export const haptics = {
  selection() {
    if (Platform.OS === 'android') {
      run(() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick));
      return;
    }
    run(() => Haptics.selectionAsync());
  },
  light() {
    if (Platform.OS === 'android') {
      run(() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key));
      return;
    }
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  success() {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
  warning() {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  },
};
