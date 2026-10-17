import { Tabs } from 'expo-router';

import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '@/ui/Icon';

/** Browser preview uses bottom tabs; the native platforms keep their system tab bar. */
export default function WebTabsLayout() {
  const t = useT();
  const { c } = useTheme();
  const role = useSettings((s) => s.role);
  const screens: Array<{ name: string; label: string; icon: IconName }> = [
    { name: 'today', label: t('tabs.today'), icon: 'sun' },
    { name: 'growth', label: t('tabs.growth'), icon: 'chart' },
    { name: 'plan', label: t('tabs.plan'), icon: 'calendar' },
    { name: 'family', label: t(role === 'teen' ? 'tabs.profile' : 'tabs.family'), icon: role === 'teen' ? 'person' : 'people' },
  ];
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: c.tint,
      tabBarInactiveTintColor: c.label2,
      tabBarStyle: { backgroundColor: c.card, borderTopColor: c.separator, height: 64 },
      tabBarLabelStyle: { fontSize: 12 },
    }}>
      {screens.map(({ name, label, icon }) => (
        <Tabs.Screen key={name} name={name} options={{
          title: label,
          tabBarAccessibilityLabel: label,
          tabBarIcon: ({ focused }) => <Icon name={icon} color={focused ? c.tint : c.label2} size={23} />,
        }} />
      ))}
    </Tabs>
  );
}
