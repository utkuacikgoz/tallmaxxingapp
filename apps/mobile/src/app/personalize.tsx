import { ScrollView } from 'react-native';

import { ageInYears } from '@tallsoon/engine';

import { childrenRepo } from '@/db/repo';
import { refreshReminders } from '@/features/app/lifecycle';
import { todayIso, useActiveChild } from '@/features/child/useChild';
import { defaultBedtime } from '@/features/plan/vars';
import { useT } from '@/i18n';
import { formatClock } from '@/lib/time';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { space } from '@/theme';
import { Row, Section } from '@/ui/List';
import { Text } from '@/ui/Text';

const BEDTIMES = ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];
const MORNINGS = ['06:30', '07:00', '07:30', '08:00'];

/** "Personalize your plan": changes the plan, never the prediction (brief §11.3). */
export default function PersonalizeScreen() {
  const t = useT();
  const child = useActiveChild();
  const reminders = useSettings((s) => s.reminders);
  const diet = useSettings((s) => s.diet);
  const activityDays = useSettings((s) => s.activityDays);
  const age = child ? ageInYears(child.birthDate, todayIso()) : 12;
  const bedtime = child?.bedtime ?? defaultBedtime(age);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section header={t('personalize.bedtime')}>
        {BEDTIMES.map((b) => (
          <Row
            key={b}
            title={formatClock(b)}
            accessory="check"
            checked={bedtime === b}
            onPress={async () => {
              haptics.light();
              if (child) await childrenRepo.update(child.id, { bedtime: b });
              void refreshReminders();
            }}
          />
        ))}
      </Section>
      <Section header={t('personalize.morning')}>
        {MORNINGS.map((m) => (
          <Row
            key={m}
            title={formatClock(m)}
            accessory="check"
            checked={reminders.morningTime === m}
            onPress={() => {
              haptics.light();
              useSettings.getState().set({ reminders: { ...reminders, morningTime: m } });
              void refreshReminders();
            }}
          />
        ))}
      </Section>
      <Section header={t('personalize.activityDays')}>
        {[2, 3, 4, 5, 7].map((d) => (
          <Row key={d} title={String(d)} accessory="check" checked={activityDays === d} onPress={() => useSettings.getState().set({ activityDays: d })} />
        ))}
      </Section>
      <Section header={t('personalize.diet')} footer={t('personalize.footer')}>
        <Row title={t('personalize.vegetarian')} switchValue={diet.vegetarian} onSwitch={(v) => useSettings.getState().set({ diet: { ...diet, vegetarian: v } })} />
        <Row title={t('personalize.dairyFree')} switchValue={diet.dairyFree} onSwitch={(v) => useSettings.getState().set({ diet: { ...diet, dairyFree: v } })} />
      </Section>
      <Text variant="footnote" color="label2" style={{ paddingHorizontal: space.margin * 2, marginTop: space.sectionGap }}>
        {t('personalize.framing')}
      </Text>
    </ScrollView>
  );
}
