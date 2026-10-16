import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet } from 'react-native';

import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { minTouch, useTheme } from '@/theme';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useActiveChild, useChildren } from './useChild';

/** Nav-bar child menu, shown only with more than one child (brief §13.8). */
export function ChildSwitcher() {
  const t = useT();
  const { c } = useTheme();
  const kids = useChildren();
  const active = useActiveChild();
  if (kids.length < 2 || !active) return null;
  const name = (k: (typeof kids)[number], i: number) => k.nickname || `${t('family.unnamed')} ${i + 1}`;

  const open = () => {
    haptics.light();
    const options = kids.map(name);
    const pick = (i: number) => {
      const k = kids[i];
      if (k) useSettings.getState().set({ activeChildId: k.id });
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...options, t('common.cancel')], cancelButtonIndex: options.length, title: t('family.switchChild') },
        (i) => i < options.length && pick(i),
      );
    } else {
      Alert.alert(t('family.switchChild'), undefined, [...options.map((o, i) => ({ text: o, onPress: () => pick(i) })), { text: t('common.cancel'), style: 'cancel' as const }]);
    }
  };

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${t('family.switchChild')}: ${name(active, kids.indexOf(active))}`} hitSlop={6} style={styles.btn}>
      <Text variant="body" color="tint" numberOfLines={1} style={{ maxWidth: 140 }}>
        {name(active, kids.indexOf(active))}
      </Text>
      <Icon name="chevronDown" size={13} color={c.tint} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: minTouch, paddingHorizontal: 4 },
});
