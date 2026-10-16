import { NativeTabs } from 'expo-router/native-tabs';

import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme';

/** Today · Growth · Plan · Family (teen: Profile), system tab bar on each platform (brief §13.1, §13.9). */
export default function TabsLayout() {
  const t = useT();
  const { c } = useTheme();
  const role = useSettings((s) => s.role);
  return (
    <NativeTabs tintColor={c.tint} labelStyle={{ selected: { color: c.tint } }} iconColor={{ selected: c.tint }}>
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Label>{t('tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="wb_sunny" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="growth">
        <NativeTabs.Trigger.Label>{t('tabs.growth')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="monitoring" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>{t('tabs.plan')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="family">
        <NativeTabs.Trigger.Label>{role === 'teen' ? t('tabs.profile') : t('tabs.family')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={role === 'teen' ? { default: 'person', selected: 'person.fill' } : { default: 'person.2', selected: 'person.2.fill' }}
          md={role === 'teen' ? 'person' : 'group'}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
