import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light impact on selection, wheel detents and habit ticks; success on result reveal and purchase
 * (brief §13.1). Android stays subtler: selection clicks only.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  selection() {
    if (!enabled) return;
    void Haptics.selectionAsync().catch(() => undefined);
  },
  light() {
    if (!enabled) return;
    if (Platform.OS === 'android') return void Haptics.selectionAsync().catch(() => undefined);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
  success() {
    if (!enabled) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  },
  warning() {
    if (!enabled) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  },
};
