import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { ageYearsMonths, formatHeight, formatHeightRange, type HeightUnit, type ReferenceId } from '@tallsoon/engine';

import { AppConfig } from '@/config/app-config';
import { childrenRepo, deleteAllRows, exportAll, measurementsRepo } from '@/db/repo';
import type { Child } from '@/db/schema';
import { refreshReminders } from '@/features/app/lifecycle';
import { summarize, todayIso, useChildren, useActiveChild } from '@/features/child/useChild';
import { useDraft } from '@/features/onboarding/draft';
import { openPaywall } from '@/features/paywall/open';
import { useT } from '@/i18n';
import { formatShortDate } from '@/lib/time';
import { analytics } from '@/services/analytics';
import { entitlements, useEntitlement, useEntitlementStore } from '@/services/entitlements';
import { cleanupTempFiles, writeTempText } from '@/services/files';
import { haptics } from '@/services/haptics';
import { mailSupport, openLegal, openSystemSettings } from '@/services/links';
import { cancelAllNotifications, notificationPermission, requestNotificationPermission } from '@/services/notifications';
import { useSettings } from '@/state/settings';
import { kv } from '@/state/storage';
import { space, useTheme } from '@/theme';
import { Row, Section } from '@/ui/List';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Text } from '@/ui/Text';

function ChildCard({ child, unit, active, onPress, onLongPress }: { child: Child; unit: HeightUnit; active: boolean; onPress: () => void; onLongPress: () => void }) {
  const t = useT();
  const { c } = useTheme();
  const [line, setLine] = useState<{ sub: string; pred: string } | null>(null);
  useEffect(() => {
    void measurementsRepo.forChild(child.id).then((ms) => {
      const m = summarize(child, ms);
      if (!m.latest) return;
      const ym = ageYearsMonths(child.birthDate, todayIso());
      setLine({
        sub: t('family.childSub', { age: `${ym.years} y ${ym.months} m`, height: formatHeight(m.latest.heightCm, unit) }),
        pred: m.summary ? t('family.childPredicted', { range: formatHeightRange(m.summary.lowCm, m.summary.highCm, unit) }) : '',
      });
    });
  }, [child, unit, t]);
  const name = child.nickname || t('family.unnamed');
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={[name, line?.sub, line?.pred].filter(Boolean).join(', ')}
      accessibilityActions={[{ name: 'longpress', label: t('family.deleteChild') }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'longpress' && onLongPress()}
      android_ripple={{ color: c.fill }}
      style={({ pressed }) => [styles.childRow, pressed && Platform.OS === 'ios' && { backgroundColor: c.fill }]}
    >
      <View style={[styles.avatar, { backgroundColor: active ? c.tint : c.tintFill }]}>
        <Text variant="headline" style={{ color: active ? c.onTint : c.tint }}>
          {(child.nickname || name).slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline">{name}</Text>
        {line ? (
          <>
            <Text variant="subhead" color="label2">
              {line.sub}
            </Text>
            <Text variant="subhead" color="tint">
              {line.pred}
            </Text>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function FamilyScreen() {
  const t = useT();
  const { c } = useTheme();
  const kids = useChildren();
  const active = useActiveChild();
  const ent = useEntitlement();
  const s = useSettings();
  const [notifOk, setNotifOk] = useState(true);
  const teen = s.role === 'teen';
  const demoEnabled = __DEV__ && entitlements.kind === 'mock';
  const demoNickname = t('demo.nickname');
  const hasDemoChild = kids.some((kid) => kid.id === '00000000-0000-4000-8000-000000000101');

  useEffect(() => {
    void notificationPermission().then((p) => setNotifOk(p !== 'denied'));
  }, []);

  const addChild = () => {
    if (teen) {
      void Share.share({ message: t('family.inviteMessage', { url: AppConfig.websiteUrl }) });
      return;
    }
    if (!ent.isPro) return openPaywall('child', 'add_child');
    const max = ent.multiChild ? AppConfig.plans.annual.maxChildren : AppConfig.plans.weekly.maxChildren;
    if (kids.length >= max) {
      Alert.alert(t('family.limitTitle'), t('family.limitBody'), [
        { text: t('common.notNow'), style: 'cancel' },
        { text: t('family.switchAnnual'), onPress: () => openPaywall('child', 'child_limit') },
      ]);
      return;
    }
    useDraft.getState().reset({
      mode: 'addChild',
      role: 'parent',
      motherCm: active?.motherHeightCm ?? null,
      fatherCm: active?.fatherHeightCm ?? null,
      unknownParent: active?.parentHeightEstimated ?? null,
    });
    analytics.track('child_added');
    router.push('/onboarding/sex');
  };

  const childMenu = (child: Child) => {
    const del = () =>
      Alert.alert(t('family.deleteChildTitle', { name: child.nickname || t('family.unnamed') }), t('family.deleteChildBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await childrenRepo.remove(child.id);
            if (s.activeChildId === child.id) useSettings.getState().set({ activeChildId: null });
          },
        },
      ]);
    if (kids.length < 2) return;
    haptics.light();
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t('family.deleteChild'), t('common.cancel')], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
        (i) => i === 0 && del(),
      );
    } else del();
  };

  const toggleReminder = async (key: 'bedtime' | 'morning' | 'checkin', value: boolean) => {
    if (value) {
      const p = await requestNotificationPermission();
      if (p !== 'granted') {
        setNotifOk(false);
        return;
      }
    }
    useSettings.getState().set({ reminders: { ...s.reminders, [key]: value } });
    void refreshReminders();
  };

  const manage = async () => {
    analytics.track('manage_subscription_tapped');
    await entitlements.manageSubscriptions();
    useEntitlementStore.getState().set(await entitlements.getStatus());
  };

  const restore = async () => {
    analytics.track('restore_tapped');
    try {
      const st = await entitlements.restore();
      useEntitlementStore.getState().set(st);
      Alert.alert(t('paywall.restoredTitle'), st.isPro ? t('paywall.restoredBody') : t('paywall.restoreNoneBody'));
    } catch {
      Alert.alert(t('errors.genericTitle'), t('paywall.unavailableBody'));
    }
  };

  const refund = async () => {
    const r = await entitlements.requestRefund().catch(() => 'unsupported' as const);
    if (r === 'unsupported') {
      Alert.alert(t('family.refundAndroidTitle'), t('family.refundAndroidBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('family.emailUs'), onPress: () => mailSupport(`${AppConfig.appName} refund`) },
        { text: t('family.openPlay'), onPress: () => void Linking.openURL('https://support.google.com/googleplay/answer/2479637') },
      ]);
    }
  };

  const exportData = async () => {
    const data = await exportAll();
    const json = JSON.stringify(data, null, 2);
    if (Platform.OS === 'web') {
      await Share.share({ message: json });
      return;
    }
    const uri = writeTempText(`${AppConfig.appName}-data-${todayIso()}.json`, json);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json' });
  };

  const deleteAll = () => {
    haptics.warning();
    Alert.alert(t('family.deleteTitle'), t('family.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAllRows();
          await cancelAllNotifications();
          await cleanupTempFiles();
          // Keep only the purchase hint; RevenueCat restores the real status.
          const pro = useSettings.getState().proHint;
          kv.clearAll();
          useSettings.getState().reset();
          useSettings.getState().set({ proHint: pro });
          useDraft.getState().reset();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const loadDemoData = () => {
    if (!demoEnabled) return;
    Alert.alert(t('demo.loadTitle'), t('demo.loadBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('demo.loadAction'),
        onPress: () => {
          void import('@/features/demo/data')
            .then(({ seedDemoData }) => seedDemoData(demoNickname))
            .catch(() => Alert.alert(t('errors.genericTitle'), t('demo.error')));
        },
      },
    ]);
  };

  const removeDemo = () => {
    if (!demoEnabled || !hasDemoChild) return;
    Alert.alert(t('demo.removeTitle'), t('demo.removeBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('demo.removeAction'),
        style: 'destructive',
        onPress: () => {
          void import('@/features/demo/data')
            .then(({ removeDemoData }) => removeDemoData(demoNickname))
            .then((removed) => {
              if (!removed) Alert.alert(t('errors.genericTitle'), t('demo.error'));
            })
            .catch(() => Alert.alert(t('errors.genericTitle'), t('demo.error')));
        },
      },
    ]);
  };

  const planLabel = ent.plan === 'weekly' ? t('family.planWeekly') : t('family.planAnnual');
  const dateLine = ent.expiresAt
    ? ent.isTrial
      ? t('family.trialEnds', { date: formatShortDate(ent.expiresAt.slice(0, 10)) })
      : ent.willRenew
        ? t('family.renews', { date: formatShortDate(ent.expiresAt.slice(0, 10)) })
        : t('family.expires', { date: formatShortDate(ent.expiresAt.slice(0, 10)) })
    : undefined;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <Stack.Screen options={{ title: teen ? t('tabs.profile') : t('tabs.family') }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 48 }} testID="family">
        <Section style={{ marginTop: 8 }} separatorInset={68}>
          {kids.map((k) => (
            <ChildCard
              key={k.id}
              child={k}
              unit={s.heightUnit}
              active={kids.length > 1 && active?.id === k.id}
              onPress={() => {
                useSettings.getState().set({ activeChildId: k.id });
                router.push('/result');
              }}
              onLongPress={() => childMenu(k)}
            />
          ))}
          <Row
            testID="add-child"
            icon={teen ? 'personAdd' : 'plus'}
            iconTone="soft"
            title={teen ? t('family.invite') : t('family.addChild')}
            tint
            onPress={addChild}
          />
        </Section>

        <Section header={t('family.subHeader')}>
          {ent.isPro ? (
            <Row icon="leaf" title={t('family.proName')} subtitle={[planLabel, dateLine].filter(Boolean).join(' · ')} />
          ) : (
            <Row icon="leaf" iconTone="soft" title={t('family.free')} subtitle={t('family.freeSub')} />
          )}
          {ent.isPro ? (
            <Row testID="manage-sub" title={t('family.manage')} tint accessory="external" onPress={() => void manage()} />
          ) : (
            <Row testID="upgrade" title={t('family.upgrade')} tint accessory="chevron" onPress={() => openPaywall(undefined, 'family_upgrade')} />
          )}
          <Row title={t('family.restore')} tint onPress={() => void restore()} />
          {ent.isPro ? <Row title={t('family.refund')} tint onPress={() => void refund()} /> : null}
        </Section>

        {ent.isPro ? (
          <Section header={t('family.remindersHeader')} footer={!notifOk ? t('family.remindersOffFooter') : undefined}>
            <Row icon="moon" iconTone="soft" title={t('family.remBed')} switchValue={s.reminders.bedtime && notifOk} onSwitch={(v) => void toggleReminder('bedtime', v)} />
            <Row icon="sun" iconTone="soft" title={t('family.remMorning')} switchValue={s.reminders.morning && notifOk} onSwitch={(v) => void toggleReminder('morning', v)} />
            <Row icon="ruler" iconTone="soft" title={t('family.remCheckin')} switchValue={s.reminders.checkin && notifOk} onSwitch={(v) => void toggleReminder('checkin', v)} />
            {s.reminders.checkin && notifOk ? (
              <View style={styles.inlineControl}>
                <Text variant="body" style={{ flex: 1 }}>
                  {t('family.checkinEvery')}
                </Text>
                <SegmentedControl<'1' | '3'>
                  options={[
                    { value: '1', label: t('family.month1') },
                    { value: '3', label: t('family.month3') },
                  ]}
                  value={String(s.reminders.checkinMonths) as '1' | '3'}
                  onChange={(v) => {
                    useSettings.getState().set({ reminders: { ...s.reminders, checkinMonths: v === '1' ? 1 : 3 } });
                    void refreshReminders();
                  }}
                  style={{ width: 170 }}
                />
              </View>
            ) : null}
            {!notifOk ? <Row title={t('success.openSettings')} tint onPress={openSystemSettings} /> : null}
          </Section>
        ) : null}

        <Section header={t('family.settingsHeader')}>
          <View style={styles.inlineControl}>
            <Text variant="body" style={{ flex: 1 }}>
              {t('family.units')}
            </Text>
            <SegmentedControl<'metric' | 'us'>
              options={[
                { value: 'metric', label: t('family.unitsMetric') },
                { value: 'us', label: t('family.unitsUS') },
              ]}
              value={s.heightUnit === 'cm' ? 'metric' : 'us'}
              onChange={(v) => useSettings.getState().set(v === 'metric' ? { heightUnit: 'cm', weightUnit: 'kg' } : { heightUnit: 'ftin', weightUnit: 'lb' })}
              style={{ width: 170 }}
            />
          </View>
          <View style={styles.inlineControl}>
            <Text variant="body" style={{ flex: 1 }}>
              {t('family.reference')}
            </Text>
            <SegmentedControl<ReferenceId>
              options={[
                { value: 'cdc', label: 'CDC' },
                { value: 'who', label: 'WHO' },
              ]}
              value={s.reference}
              onChange={(v) => useSettings.getState().set({ reference: v })}
              style={{ width: 170 }}
            />
          </View>
          <Row icon="function" iconTone="gray" title={t('family.methods')} accessory="chevron" onPress={() => router.push('/legal/methods')} />
          <Row icon="info" iconTone="gray" title={t('family.disclaimer')} accessory="chevron" onPress={() => router.push('/legal/disclaimer')} />
          <Row icon="shield" iconTone="gray" title={t('family.privacy')} accessory="external" onPress={() => openLegal('privacy')} />
          <Row icon="doc" iconTone="gray" title={t('family.terms')} accessory="external" onPress={() => openLegal('terms')} />
          <Row icon="download" iconTone="gray" title={t('family.export')} accessory="chevron" onPress={() => void exportData()} />
          <Row icon="mail" iconTone="gray" title={t('family.support')} accessory="external" onPress={() => mailSupport(`${AppConfig.appName} ${version}`)} />
          <Row icon="gear" iconTone="gray" title={t('family.version')} value={version} />
        </Section>

        <Section>
          <Row testID="delete-all" title={t('family.deleteAll')} destructive centered onPress={deleteAll} />
        </Section>
        {demoEnabled ? (
          <Section header={t('demo.header')} footer={t('demo.footer')}>
            <Row testID="load-demo-data" title={t('demo.loadAction')} tint onPress={loadDemoData} />
            {hasDemoChild ? <Row testID="remove-demo-data" title={t('demo.removeAction')} destructive onPress={removeDemo} /> : null}
          </Section>
        ) : null}
        <Text variant="footnote" color="label2" align="center" style={{ marginTop: 10 }}>
          {t('family.footer')}
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  childRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: space.margin, paddingVertical: 12, minHeight: 64 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  inlineControl: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.margin, paddingVertical: 8, minHeight: 52, gap: 12 },
});
