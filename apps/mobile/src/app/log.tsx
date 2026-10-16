import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, TextInput, View } from 'react-native';

import { addMonths, DROP_WARNING_CM, toIsoDate, type HeightUnit, type WeightUnit } from '@tallsoon/engine';

import { measurementsRepo } from '@/db/repo';
import type { Measurement } from '@/db/schema';
import { refreshReminders } from '@/features/app/lifecycle';
import { summarize, useActiveChild, useMeasurements } from '@/features/child/useChild';
import { useMeasure, useMeasureCopy } from '@/features/onboarding/measure';
import { FieldMessage } from '@/features/onboarding/StepScreen';
import { useT } from '@/i18n';
import { formatShortDate } from '@/lib/time';
import { analytics } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { useSettings } from '@/state/settings';
import { radius, space, typeScale, useTheme } from '@/theme';
import { showBanner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Row, Section } from '@/ui/List';
import { MeasureField } from '@/ui/MeasureField';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { SheetHeader, SheetScroll } from '@/ui/Sheet';
import { Text } from '@/ui/Text';

type DateChoice = '0' | '3' | '6' | '12' | 'other';

/** Log in ≤ 3 taps: date, height, Add (brief §3.4). Also edits a row, or replaces the free user's single row. */
export default function LogSheet() {
  const t = useT();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ id?: string; replace?: string }>();
  const child = useActiveChild();
  const ms = useMeasurements(child?.id);
  const editing: Measurement | undefined = ms.find((m) => m.id === params.id);
  const replaceMode = params.replace === '1';
  const heightUnit = useSettings((s) => s.heightUnit);
  const weightUnit = useSettings((s) => s.weightUnit);
  const today = toIsoDate(new Date());

  const [choice, setChoice] = useState<DateChoice>(editing ? 'other' : '0');
  const [otherDate, setOtherDate] = useState<string>(editing?.date ?? today);
  const [showPicker, setShowPicker] = useState(false);
  const height = useMeasure('childHeightCm', editing?.heightCm ?? null);
  const weight = useMeasure('weightKg', editing?.weightKg ?? null);
  const [note, setNote] = useState(editing?.note ?? '');
  const copy = useMeasureCopy();

  // Rows load asynchronously; fill the form once when the edited row arrives.
  const filled = useRef(false);
  const [formKey, setFormKey] = useState(0);
  useEffect(() => {
    if (!editing || filled.current) return;
    filled.current = true;
    height.set(editing.heightCm);
    weight.set(editing.weightKg);
    setNote(editing.note ?? '');
    setOtherDate(editing.date);
    setChoice('other');
    setFormKey(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const date = choice === 'other' ? otherDate : choice === '0' ? today : addMonths(today, -Number(choice));
  const latest = ms.find((m) => m.id !== editing?.id);
  const drop = date === today && height.valid && latest && height.value != null && latest.heightCm - height.value > DROP_WARNING_CM;
  const weightOk = weight.value == null || weight.valid;
  const valid = height.valid && weightOk && !!child && date >= (child?.birthDate ?? '') && date <= today;

  const dateOptions = useMemo(
    () =>
      [
        { value: '0' as const, label: t('log.today') },
        { value: '3' as const, label: t('log.m3') },
        { value: '6' as const, label: t('log.m6') },
        { value: '12' as const, label: t('log.y1') },
      ] satisfies Array<{ value: DateChoice; label: string }>,
    [t],
  );

  const save = async () => {
    if (!valid || !child || height.value == null) return;
    const before = summarize(child, ms).summary?.estimateCm ?? null;
    const row = { date, heightCm: height.value, weightKg: weight.valid ? weight.value : null, note: note.trim() || null };
    let next: Measurement[];
    if (editing) {
      await measurementsRepo.update(editing.id, row);
      next = ms.map((m) => (m.id === editing.id ? { ...m, ...row } : m));
    } else if (replaceMode) {
      await measurementsRepo.replaceSingle(child.id, { ...row, date: today });
      next = [{ ...row, date: today, id: 'tmp', childId: child.id }];
    } else {
      const added = await measurementsRepo.add({ ...row, childId: child.id });
      next = [added, ...ms];
    }
    next.sort((a, b) => (a.date < b.date ? 1 : -1));
    const after = summarize(child, next).summary?.estimateCm ?? null;
    haptics.success();
    analytics.track('measurement_logged', { past: date !== today });
    const s = useSettings.getState();
    const count = s.measurementsLoggedCount + 1;
    s.set({ measurementsLoggedCount: count });

    let subtitle = t('log.savedHistory');
    if (date === today && before != null && after != null) {
      const d = after - before;
      subtitle = Math.abs(d) < 0.5 ? t('log.unchanged') : t('log.updated', { delta: `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} cm` });
    }
    router.back();
    setTimeout(() => showBanner({ title: t('log.added'), subtitle, icon: 'ruler' }), 350);
    void refreshReminders();
    // Ask for a rating only after the 2nd logged measurement, never after a paywall (brief §7).
    if (count >= 2 && !s.reviewRequested && (await StoreReview.isAvailableAsync().catch(() => false))) {
      s.set({ reviewRequested: true });
      setTimeout(() => void StoreReview.requestReview().catch(() => undefined), 1500);
    }
  };

  const remove = () => {
    if (!editing) return;
    Alert.alert(t('growth.deleteMeasurementTitle'), t('growth.deleteMeasurementBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await measurementsRepo.remove(editing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }} testID="log-sheet">
      <SheetHeader
        title={editing ? t('log.editTitle') : t('log.title')}
        left={{ label: t('common.cancel'), onPress: () => router.back() }}
        right={{ label: editing ? t('common.save') : t('common.add'), bold: true, disabled: !valid, onPress: () => void save(), testID: 'log-add' }}
      />
      <SheetScroll>
        {!replaceMode ? (
          <View style={{ paddingHorizontal: space.margin, paddingTop: 8, gap: 10 }}>
            <Text variant="footnote" color="label2" uppercase style={{ paddingHorizontal: space.margin }}>
              {t('log.date')}
            </Text>
            <SegmentedControl<DateChoice>
              options={choice === 'other' ? [...dateOptions, { value: 'other' as const, label: formatShortDate(otherDate) }] : dateOptions}
              value={choice}
              onChange={setChoice}
            />
            <Button
              variant="plain"
              title={choice === 'other' ? formatShortDate(otherDate) : t('log.other')}
              onPress={() => setShowPicker((v) => !v)}
            />
            {showPicker ? (
              <DateTimePicker
                value={new Date(`${otherDate}T12:00:00`)}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                minimumDate={child ? new Date(`${child.birthDate}T12:00:00`) : undefined}
                accentColor={c.tint}
                onChange={(_, d) => {
                  if (Platform.OS !== 'ios') setShowPicker(false);
                  if (d) {
                    setOtherDate(toIsoDate(d));
                    setChoice('other');
                  }
                }}
              />
            ) : null}
          </View>
        ) : null}

        <View style={{ paddingHorizontal: space.margin, marginTop: 18, gap: 10 }}>
          <Text variant="footnote" color="label2" uppercase style={{ paddingHorizontal: space.margin }}>
            {t('log.height')}
          </Text>
          <SegmentedControl<HeightUnit>
            options={[
              { value: 'cm', label: t('common.cm') },
              { value: 'ftin', label: t('common.ftIn') },
            ]}
            value={heightUnit}
            onChange={(u) => useSettings.getState().set({ heightUnit: u })}
          />
          <MeasureField
            key={`h${formKey}`}
            testID="log-height"
            unit={heightUnit}
            value={height.value}
            onChange={height.onChange}
            onBlur={height.onBlur}
            invalid={height.showError}
            autoFocus={!editing}
            placeholder={latest ? String(Math.round(latest.heightCm)) : 'e.g. 152'}
            returnKeyType="done"
            onSubmitEditing={() => void save()}
            accessibilityLabel={t('onboarding.height.a11y', { unit: heightUnit === 'cm' ? 'centimeters' : 'feet and inches' })}
          />
        </View>
        {height.showError ? (
          <FieldMessage kind="error" text={copy.error('childHeightCm', heightUnit, height.info.inchesInvalid)} />
        ) : drop ? (
          <FieldMessage kind="warning" text={t('validation.lowerThanLast')} />
        ) : (
          <FieldMessage kind="hint" text={t('log.heightFooter')} />
        )}

        <View style={{ paddingHorizontal: space.margin, marginTop: 6, gap: 10 }}>
          <Text variant="footnote" color="label2" uppercase style={{ paddingHorizontal: space.margin }}>
            {t('log.weight')}
          </Text>
          <SegmentedControl<WeightUnit>
            options={[
              { value: 'kg', label: t('common.kg') },
              { value: 'lb', label: t('common.lb') },
            ]}
            value={weightUnit}
            onChange={(u) => useSettings.getState().set({ weightUnit: u })}
          />
          <MeasureField
            key={`w${formKey}`}
            testID="log-weight"
            unit={weightUnit}
            value={weight.value}
            onChange={weight.onChange}
            onBlur={weight.onBlur}
            invalid={weight.showError}
            size="compact"
            placeholder="–"
            returnKeyType="done"
            accessibilityLabel={t('onboarding.weight.a11y', { unit: weightUnit === 'kg' ? 'kilograms' : 'pounds' })}
          />
        </View>
        {weight.showError ? <FieldMessage kind="error" text={copy.error('weightKg', weightUnit, false)} /> : <View style={{ height: 8 }} />}

        {!replaceMode ? (
          <View style={{ paddingHorizontal: space.margin, gap: 8 }}>
            <Text variant="footnote" color="label2" uppercase style={{ paddingHorizontal: space.margin }}>
              {t('log.note')}
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('log.notePlaceholder')}
              placeholderTextColor={c.label3}
              maxLength={200}
              style={[styles.note, typeScale.body, { backgroundColor: c.card, color: c.label }]}
            />
          </View>
        ) : null}

        {editing ? (
          <Section>
            <Row title={t('common.delete')} destructive centered onPress={remove} />
          </Section>
        ) : null}
      </SheetScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { minHeight: 48, borderRadius: radius.list, paddingHorizontal: 16, paddingVertical: 12 },
});
