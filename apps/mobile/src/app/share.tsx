import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef, useState, type ComponentRef } from 'react';
import { Alert, Platform, Share, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { formatHeightRange } from '@tallsoon/engine';

import { AppConfig } from '@/config/app-config';
import { useActiveChild, useChildModel } from '@/features/child/useChild';
import { ResultCard } from '@/features/share/ResultCard';
import { MilestoneCard } from '@/features/share/MilestoneCard';
import { milestoneKeys } from '@/features/retention/model';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { moveToTemp } from '@/services/files';
import { haptics } from '@/services/haptics';
import { openSystemSettings } from '@/services/links';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme';
import { showBanner } from '@/ui/Banner';
import { Row, Section } from '@/ui/List';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';

export default function ShareSheet() {
  const t = useT();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ parent?: string; milestone?: string }>();
  const role = useSettings((s) => s.role);
  const unit = useSettings((s) => s.heightUnit);
  const child = useActiveChild();
  const model = useChildModel(child);
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState(false);
  const [square, setSquare] = useState(false);
  const milestone = milestoneKeys.find((key) => key === params.milestone);
  const summary = model?.summary;

  if (!child || (!milestone && !summary)) return (
    <View style={{ flex: 1, backgroundColor: c.sheetBg }}>
      <SheetHeader title={t(milestone ? 'retention.shareTitle' : 'share.title')} close />
    </View>
  );

  const range = summary ? formatHeightRange(summary.lowCm, summary.highCm, unit) : '';
  const method = summary?.lead.method === 'khamisRoche' ? 'Khamis–Roche' : summary?.lead.method === 'midParental' ? 'mid-parental height' : 'growth curve';

  const capture = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    const tmp = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: milestone && square ? 1080 : 1920 });
    return Platform.OS === 'web' ? tmp : moveToTemp(tmp, `${AppConfig.appName}-result.png`);
  };

  const shareImage = async (message: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await capture();
      if (uri && Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('share.title'), UTI: 'public.png' });
      } else {
        await Share.share({ message });
      }
    } catch {
      await Share.share({ message }).catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  const saveImage = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const perm = await requestPermissionsAsync(true);
      if (!perm.granted) {
        Alert.alert(t('share.saveFailed'), t('share.saveFailedBody'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('success.openSettings'), onPress: openSystemSettings },
        ]);
        return;
      }
      const uri = await capture();
      if (!uri) throw new Error('capture failed');
      await Asset.create(uri);
      haptics.success();
      showBanner({ title: t('share.saved'), subtitle: t('share.savedSub'), icon: 'download' });
      router.back();
    } catch {
      Alert.alert(t('share.saveFailed'), t('errors.genericBody'));
    } finally {
      setBusy(false);
    }
  };

  const parentMessage = t('share.parentMessage', { range, url: AppConfig.websiteUrl });
  const shareMessage = milestone
    ? t('retention.shareMessage', { title: t(`retention.milestone.${milestone}`) })
    : t('share.shareMessage', { range, method, url: AppConfig.websiteUrl });
  const showParent = !milestone && (role === 'teen' || params.parent === '1');

  return (
    <View style={{ flex: 1 }} testID="share-sheet">
      <SheetHeader title={t(milestone ? 'retention.shareTitle' : 'share.title')} close />
      <SheetScroll>
        <View style={styles.preview}>
          <View style={styles.shadow}>
            {milestone ? <MilestoneCard ref={cardRef} milestone={milestone} nickname={child.nickname} square={square} />
              : summary ? <ResultCard ref={cardRef} summary={summary} unit={unit} nickname={child.nickname} sex={child.sexAtBirth} /> : null}
          </View>
        </View>
        {milestone ? (
          <View style={{ padding: 16, gap: 8 }}>
            <Button testID="milestone-story" title={t('retention.story')} variant={square ? 'plain' : 'tinted'} onPress={() => setSquare(false)} />
            <Button testID="milestone-square" title={t('retention.square')} variant={square ? 'tinted' : 'plain'} onPress={() => setSquare(true)} />
          </View>
        ) : null}
        <Section>
          {showParent ? (
            <Row
              icon="people"
              title={t('share.sendParent')}
              accessory="chevron"
              disabled={busy}
              onPress={() => {
                analytics.track('teen_share_to_parent');
                void shareImage(parentMessage);
              }}
            />
          ) : null}
          <Row icon="download" iconTone="soft" title={t('share.saveImage')} accessory="chevron" disabled={busy} onPress={() => void saveImage()} />
          <Row icon="share" iconTone="soft" title={t('share.more')} accessory="chevron" disabled={busy} onPress={() => void shareImage(shareMessage)} />
        </Section>
      </SheetScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', paddingTop: 8 },
  shadow: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
