import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppConfig } from '@/config/app-config';
import { AppIcon } from '@/features/brand/AppIcon';
import { BubbleBackground } from '@/features/paywall/BubbleBackground';
import type { PaywallContext } from '@/features/paywall/open';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import {
  entitlements,
  formatMoney,
  savePercent,
  useEntitlementStore,
  type Offering,
  type PlanId,
} from '@/services/entitlements';
import { haptics } from '@/services/haptics';
import { openLegal } from '@/services/links';
import { useSettings } from '@/state/settings';
import { minTouch, radius, space, useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import { Icon, IconTile, type IconName } from '@/ui/Icon';
import { Text } from '@/ui/Text';

function PlanCard({
  selected,
  title,
  badge,
  sub,
  price,
  per,
  onPress,
  testID,
}: {
  selected: boolean;
  title: string;
  badge?: string | null;
  sub: string;
  price: string;
  per: string;
  onPress: () => void;
  testID: string;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={[title, badge, `${price}${per}`, sub].filter(Boolean).join(', ')}
      style={({ pressed }) => [
        styles.plan,
        { backgroundColor: c.card, borderColor: selected ? c.tint : c.separator, borderWidth: selected ? 2 : StyleSheet.hairlineWidth * 2 },
        !selected && { padding: 17 },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.radio, selected ? { backgroundColor: c.tint, borderColor: c.tint } : { borderColor: c.label3 }]}>
        {selected ? <Icon name="check" size={15} color={c.onTint} weight="bold" /> : null}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="headline" style={{ fontSize: 19 }}>
          {title}
        </Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: c.accentFill }]}>
            <Text variant="footnote" weight="700" style={{ color: c.accentText }}>
              {badge}
            </Text>
          </View>
        ) : null}
        <Text variant="subhead" color="label2">
          {sub}
        </Text>
      </View>
      {/* The billed amount is always the most prominent price (brief §11.6, App Store 3.1.2). */}
      <View style={styles.priceCol}>
        <Text style={[styles.price, { color: c.label }]} tabular>
          {price}
          <Text variant="subhead" color="label2" style={{ fontWeight: '400' }}>
            {per}
          </Text>
        </Text>
      </View>
    </Pressable>
  );
}

export default function Paywall() {
  const t = useT();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ context?: PaywallContext }>();
  const role = useSettings((s) => s.role);
  const [offering, setOffering] = useState<Offering | null>(null);
  const [failed, setFailed] = useState(false);
  const [plan, setPlan] = useState<PlanId>('annual');
  const [trial, setTrial] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => entitlements.getOffering().then(setOffering, () => setFailed(true)),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const close = () => {
    analytics.track('paywall_closed');
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/today');
  };

  const annual = offering?.annual;
  const weekly = offering?.weekly;
  const trialAvailable = plan === 'annual' && !!offering?.annualTrial;
  const trialOn = trialAvailable && trial;
  const billedAnnual = trialOn ? offering?.annualTrial : annual;
  const save = billedAnnual && weekly && billedAnnual.currencyCode === weekly.currencyCode
    ? savePercent(billedAnnual.price, weekly.price) : null;
  const perWeek = billedAnnual ? formatMoney(billedAnnual.price / 52, billedAnnual.currencyCode) : '';

  const cta = !offering
    ? t('paywall.loading')
    : trialOn
      ? t('paywall.ctaTrial')
      : plan === 'annual'
        ? t('paywall.ctaAnnual', { price: annual?.priceString })
        : t('paywall.ctaWeekly', { price: weekly?.priceString });
  const terms = !offering
    ? ''
    : trialOn
      ? t('paywall.termsTrial', { price: billedAnnual?.priceString })
      : plan === 'annual'
        ? t('paywall.termsAnnual', { price: annual?.priceString })
        : t('paywall.termsWeekly', { price: weekly?.priceString });

  const buy = async () => {
    if (!offering || busy) return;
    setBusy(true);
    analytics.track('plan_selected', { product: plan, trial: trialOn });
    try {
      const res = await entitlements.purchase(plan, { trial: trialOn });
      if (res.status === 'purchased') {
        useEntitlementStore.getState().set(res.entitlement);
        haptics.success();
        analytics.track('purchase_completed', { product: plan, trial: trialOn });
        router.replace('/success');
      } else if (res.status === 'pending') {
        Alert.alert(t('paywall.pendingTitle'), t('paywall.pendingBody'));
      }
    } catch {
      Alert.alert(t('paywall.purchaseFailedTitle'), t('paywall.purchaseFailedBody'));
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    analytics.track('restore_tapped');
    setBusy(true);
    try {
      const status = await entitlements.restore();
      useEntitlementStore.getState().set(status);
      if (status.isPro) {
        Alert.alert(t('paywall.restoredTitle'), t('paywall.restoredBody'), [{ text: t('common.ok'), onPress: () => router.replace('/(tabs)/today') }]);
      } else {
        Alert.alert(t('paywall.restoredTitle'), t('paywall.restoreNoneBody'));
      }
    } catch {
      Alert.alert(t('errors.genericTitle'), t('paywall.unavailableBody'));
    } finally {
      setBusy(false);
    }
  };

  const askParent = () => {
    void Share.share({
      message: t('paywall.askParentMessage', { price: plan === 'weekly' ? `${weekly?.priceString ?? ''}${t('paywall.perWeek')}` : `${billedAnnual?.priceString ?? ''}${t('paywall.perYear')}`, url: AppConfig.websiteUrl }),
    });
  };

  const included: Array<[IconName, string]> = [
    ['list', t('paywall.inc1')],
    ['flame', t('paywall.inc2')],
    ['chartUp', t('paywall.inc3')],
    ['doc', t('paywall.inc4')],
  ];

  return (
    <View style={[styles.root, { backgroundColor: c.cover }]} testID="paywall">
      <BubbleBackground top={insets.top} />

      {/* Close X: top-right, visible from the first frame, 44×44 hit area (brief §13.6). */}
      <Pressable
        testID="paywall-close"
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel={t('paywall.closeA11y')}
        hitSlop={8}
        style={[styles.close, { top: insets.top + 4 }]}
      >
        <View style={styles.closeCircle}>
          <Icon name="close" size={14} color="#EBEBF5" weight="bold" />
        </View>
      </Pressable>

      <View style={[styles.sheet, { backgroundColor: c.sheetBg, top: insets.top + 118 }]}>
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AppIcon size={52} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="title2" accessibilityRole="header">
                {t('paywall.title')}
              </Text>
              <Text variant="callout" color="tint" weight="600">
                {t('paywall.sub')}
              </Text>
            </View>
          </View>
          {params.context ? (
            <Text variant="footnote" color="label2" style={styles.context}>
              {t(`paywall.context.${params.context}`)}
            </Text>
          ) : null}

          {!offering ? (
            <View style={styles.loading}>
              {failed ? (
                <>
                  <Text variant="headline" align="center">
                    {t('paywall.unavailableTitle')}
                  </Text>
                  <Text variant="subhead" color="label2" align="center">
                    {t('paywall.unavailableBody')}
                  </Text>
                  <Button variant="tinted" title={t('paywall.retry')} onPress={() => { setFailed(false); void load(); }} fullWidth={false} />
                </>
              ) : (
                <ActivityIndicator color={c.tint} />
              )}
            </View>
          ) : (
            <View accessibilityRole="radiogroup" style={styles.plans}>
              <PlanCard
                testID="plan-annual"
                selected={plan === 'annual'}
                title={t('paywall.annual')}
                badge={save != null ? t('paywall.badge', { pct: save }) : null}
                sub={t('paywall.annualSub', { perWeek })}
                price={billedAnnual?.priceString ?? ''}
                per={t('paywall.perYear')}
                onPress={() => {
                  haptics.light();
                  setPlan('annual');
                }}
              />
              <PlanCard
                testID="plan-weekly"
                selected={plan === 'weekly'}
                title={t('paywall.weekly')}
                sub={t('paywall.weeklySub')}
                price={weekly?.priceString ?? ''}
                per={t('paywall.perWeek')}
                onPress={() => {
                  haptics.light();
                  setPlan('weekly');
                }}
              />
              {trialAvailable ? (
                <View style={[styles.trialRow, { backgroundColor: c.card }]}>
                  <Text variant="body" style={{ flex: 1 }}>
                    {t('paywall.trial')}
                  </Text>
                  <Switch
                    testID="trial-toggle"
                    value={trial}
                    onValueChange={(v) => {
                      haptics.light();
                      setTrial(v);
                      analytics.track('trial_toggled', { on: v });
                    }}
                    trackColor={{ true: c.tint, false: Platform.OS === 'ios' ? undefined : c.fill }}
                    ios_backgroundColor={c.fill}
                    accessibilityLabel={t('paywall.trialA11y')}
                  />
                </View>
              ) : null}
              {offering.isExample ? (
                <Text variant="footnote" color="label2" align="center">
                  {t('paywall.examplePrices')}
                </Text>
              ) : null}
            </View>
          )}

          <Text variant="footnote" color="label2" uppercase style={styles.incHeader}>
            {t('paywall.includedHeader')}
          </Text>
          <View style={[styles.incCard, { backgroundColor: c.card }]}>
            {included.map(([icon, label], i) => (
              <View key={label}>
                {i > 0 ? <View style={[styles.sep, { backgroundColor: c.separator }]} /> : null}
                <View style={styles.incRow}>
                  <IconTile name={icon} tone="soft" />
                  <Text variant="body" style={{ flex: 1 }}>
                    {label}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text variant="footnote" color="label2" align="center" style={styles.reassure}>
            {t('paywall.reassure')}
          </Text>
          {role === 'teen' ? <Button variant="plain" title={t('paywall.askParent')} onPress={askParent} testID="ask-parent" /> : null}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: c.separator, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: c.sheetBg }]}>
          <Button testID="paywall-cta" title={cta} disabled={!offering} loading={busy} onPress={() => void buy()} />
          {terms ? (
            <Text variant="footnote" color="label2" align="center" style={styles.terms} testID="paywall-terms">
              {terms}
            </Text>
          ) : null}
          <View style={styles.links}>
            {[
              [t('paywall.restore'), () => void restore()],
              [t('paywall.terms'), () => openLegal('terms')],
              [t('paywall.privacy'), () => openLegal('privacy')],
            ].map(([label, fn]) => (
              <Pressable key={label as string} onPress={fn as () => void} accessibilityRole="link" hitSlop={4} style={styles.link}>
                <Text variant="subhead" color="tint">
                  {label as string}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  close: { position: 'absolute', right: 12, width: minTouch, height: minTouch, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  closeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(118,118,128,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  sheetContent: { paddingHorizontal: space.margin, paddingTop: 22, paddingBottom: 24 },
  header: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  context: { marginTop: 10 },
  loading: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 10 },
  plans: { marginTop: 18, gap: 12 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.list, borderCurve: 'continuous' },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priceCol: { alignItems: 'flex-end', maxWidth: '45%' },
  price: { fontSize: 22, fontWeight: '700' },
  trialRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: 16, borderRadius: radius.list, borderCurve: 'continuous' },
  incHeader: { marginTop: 26, marginBottom: 7, paddingHorizontal: 16 },
  incCard: { borderRadius: radius.list, borderCurve: 'continuous', overflow: 'hidden' },
  incRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, minHeight: 52 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  reassure: { marginTop: 16, paddingHorizontal: 12 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.margin, paddingTop: 12, gap: 6 },
  terms: { paddingHorizontal: 8 },
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16 },
  link: { minHeight: minTouch, justifyContent: 'center' },
});
