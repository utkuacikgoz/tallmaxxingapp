import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { CITATIONS } from '@tallsoon/engine';

import { useT } from '@/i18n';
import { openUrl } from '@/services/links';
import { space } from '@/theme';
import { Row, Section } from '@/ui/List';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';
import { Text } from '@/ui/Text';

const SOURCES: Array<{ label: string; url: string }> = [
  { label: 'CDC growth charts (2000)', url: 'https://www.cdc.gov/growthcharts/' },
  { label: 'WHO growth reference 5–19 years (2007)', url: 'https://www.who.int/tools/growth-reference-data-for-5to19-years' },
  { label: 'WHO physical activity guidelines (2020)', url: 'https://www.who.int/publications/i/item/9789240015128' },
  { label: 'AASM pediatric sleep recommendations', url: 'https://aasm.org/resources/pdf/pediatricsleepdurationconsensus.pdf' },
  { label: 'NIH ODS: calcium', url: 'https://ods.od.nih.gov/factsheets/Calcium-Consumer/' },
  { label: 'NIH ODS: vitamin D', url: 'https://ods.od.nih.gov/factsheets/VitaminD-Consumer/' },
];

/** Medical disclaimer and Methods & Sources (brief §6.3). */
export default function LegalSheet() {
  const t = useT();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const methods = doc === 'methods';
  return (
    <View style={{ flex: 1 }}>
      <SheetHeader
        title={methods ? t('legal.methodsTitle') : t('legal.disclaimerTitle')}
        right={{ label: t('common.done'), bold: true, onPress: () => router.back() }}
      />
      <SheetScroll>
        {methods ? (
          <>
            <Section header={t('method.sourcesHeader')}>
              {[CITATIONS.khamisRoche, CITATIONS.midParental, CITATIONS.cdc, CITATIONS.who].map((c) => (
                <View key={c} style={{ paddingHorizontal: space.margin, paddingVertical: 10 }}>
                  <Text variant="footnote" color="label2" selectable>
                    {c}
                  </Text>
                </View>
              ))}
            </Section>
            <Section header={t('plan.title')} footer={t('plan.sourcesFooter')}>
              {SOURCES.map((s) => (
                <Row key={s.url} title={s.label} accessory="external" accessibilityRole="link" onPress={() => void openUrl(s.url)} />
              ))}
            </Section>
            <Section>
              <Row title={t('method.title')} accessory="chevron" onPress={() => router.push('/method')} />
            </Section>
          </>
        ) : (
          <View style={{ paddingHorizontal: space.margin * 2, paddingTop: 12, gap: 14 }}>
            <Text variant="body">{t('legal.disclaimer')}</Text>
            <Text variant="subhead" color="label2">
              {t('method.framing')}
            </Text>
          </View>
        )}
      </SheetScroll>
    </View>
  );
}
