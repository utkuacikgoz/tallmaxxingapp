import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { measureGuide, pubertyGuide } from '@tallsoon/content';

import { useT } from '@/i18n';
import { openUrl } from '@/services/links';
import { space } from '@/theme';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

/** Static, sourced guides. No self-staging, no photos (brief §2 P4). */
export default function GuideScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = id === 'measure' ? measureGuide : pubertyGuide;
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.head}>
          <Text variant="largeTitle" accessibilityRole="header">
            {guide.title}
          </Text>
          <Text variant="body" color="label2">
            {guide.subtitle}
          </Text>
          <Text variant="footnote" color="label2" style={{ marginTop: 8 }}>
            {t('legal.disclaimer')}
          </Text>
        </View>
        {guide.sections.map((s) => (
          <View key={s.id} style={styles.section}>
            <Text variant="title3" accessibilityRole="header">
              {s.title}
            </Text>
            {s.paragraphs.map((p) => (
              <Text key={p} variant="body" style={p.startsWith('• ') ? styles.bullet : undefined}>
                {p}
              </Text>
            ))}
          </View>
        ))}
        <Section header={t('method.sourcesHeader')}>
          {guide.sources.map((src) => (
            <Row key={src.url} title={src.label} accessory="external" accessibilityRole="link" onPress={() => void openUrl(src.url)} />
          ))}
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.margin * 2, gap: 4, paddingTop: 8 },
  section: { paddingHorizontal: space.margin * 2, marginTop: 24, gap: 8 },
  bullet: { paddingLeft: 8 },
});
