import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/features/brand/AppIcon';
import { useDraft } from '@/features/onboarding/draft';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { openLegal } from '@/services/links';
import { space, useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import { Icon, type IconName } from '@/ui/Icon';
import { BottomBar } from '@/ui/Layout';
import { Text } from '@/ui/Text';

function Feature({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.feature} accessible accessibilityLabel={`${title}. ${body}`}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size={30} color={c.tint} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline">{title}</Text>
        <Text variant="subhead" color="label2">
          {body}
        </Text>
      </View>
    </View>
  );
}

export default function Welcome() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 48 }]} bounces={false}>
        <AppIcon size={76} />
        <Text variant="largeTitle" accessibilityRole="header" style={styles.title}>
          {t('welcome.titleStart')}
          <Text variant="largeTitle" color="tint">
            {t('welcome.titleEnd')}
          </Text>
        </Text>
        <Text variant="body" color="label2" style={styles.body}>
          {t('welcome.body')}
        </Text>
        <View style={styles.features}>
          <Feature icon="chartUp" title={t('welcome.f1Title')} body={t('welcome.f1Body')} />
          <Feature icon="function" title={t('welcome.f2Title')} body={t('welcome.f2Body')} />
          <Feature icon="shield" title={t('welcome.f3Title')} body={t('welcome.f3Body')} />
        </View>
      </ScrollView>
      <BottomBar>
        <Button
          testID="welcome-start"
          title={t('welcome.cta')}
          onPress={() => {
            useDraft.getState().reset({ mode: 'first' });
            analytics.track('onboarding_started');
            router.push('/onboarding/role');
          }}
        />
        <Text variant="footnote" color="label2" align="center" style={styles.legal}>
          {t('welcome.legal1')}
          {'\n'}
          {t('welcome.legal2')}
          <Text variant="footnote" color="tint" onPress={() => openLegal('terms')} accessibilityRole="link" suppressHighlighting>
            {t('welcome.terms')}
          </Text>
          {t('welcome.and')}
          <Text variant="footnote" color="tint" onPress={() => openLegal('privacy')} accessibilityRole="link" suppressHighlighting>
            {t('welcome.privacy')}
          </Text>
          .
        </Text>
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: space.margin * 2, paddingBottom: 24 },
  title: { marginTop: 28, fontSize: Platform.OS === 'android' ? 34 : 36, lineHeight: 42 },
  body: { marginTop: 10 },
  features: { marginTop: 36, gap: 26 },
  feature: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  featureIcon: { width: 40, alignItems: 'center', paddingTop: 2 },
  legal: { marginTop: 10, paddingHorizontal: 8 },
});
