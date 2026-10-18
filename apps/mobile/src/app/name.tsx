import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { childrenRepo } from '@/db/repo';
import { useActiveChild } from '@/features/child/useChild';
import { useT } from '@/i18n';
import { radius, space, typeScale, useTheme } from '@/theme';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';
import { Text } from '@/ui/Text';

/** Optional nickname (brief §3.1): a nickname or initial is plenty. */
export default function NameSheet() {
  const t = useT();
  const { c } = useTheme();
  const child = useActiveChild();
  const [name, setName] = useState(child?.nickname ?? '');
  const save = async () => {
    if (child) await childrenRepo.update(child.id, { nickname: name.trim().slice(0, 40) });
    router.back();
  };
  return (
    <View style={{ flex: 1 }}>
      <SheetHeader
        title={t('result.nameTitle')}
        left={{ label: t('common.cancel'), onPress: () => router.back() }}
        right={{ label: t('common.save'), bold: true, onPress: () => void save(), testID: 'name-save' }}
      />
      <SheetScroll contentContainerStyle={{ paddingHorizontal: space.margin, paddingTop: 12, gap: 10 }}>
        <TextInput
          testID="name-input"
          value={name}
          onChangeText={setName}
          placeholder={t('result.namePlaceholder')}
          placeholderTextColor={c.label3}
          selectionColor={c.tint}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={() => void save()}
          accessibilityLabel={t('result.namePlaceholder')}
          style={[styles.input, typeScale.body, { backgroundColor: c.card, color: c.label }]}
        />
        <Text variant="footnote" color="label2" style={{ paddingHorizontal: space.margin }}>
          {t('result.nameBody')}
        </Text>
      </SheetScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48, borderRadius: radius.list, borderCurve: 'continuous', paddingHorizontal: 16 },
});
