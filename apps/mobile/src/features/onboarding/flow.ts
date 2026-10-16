import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { toIsoDate } from '@tallsoon/engine';

import { childrenRepo, measurementsRepo } from '@/db/repo';
import { useT } from '@/i18n';
import { analytics } from '@/services/analytics';
import { useSettings } from '@/state/settings';
import { draft, draftBirthDate, nextStep, stepProgress, useDraft, type StepId } from './draft';

/** Saves the draft: creates the child + first measurement, or updates them when editing. */
export async function commitDraft(): Promise<string> {
  const d = draft();
  const birthDate = draftBirthDate(d);
  if (!d.sex || !birthDate || d.heightCm == null) throw new Error('Incomplete draft');
  const childFields = {
    sexAtBirth: d.sex,
    birthDate,
    motherHeightCm: d.unknownParent === 'mother' ? null : d.motherCm,
    fatherHeightCm: d.unknownParent === 'father' ? null : d.fatherCm,
    parentHeightEstimated: d.unknownParent,
    sleepBand: d.sleepBand,
    pubertySigns: d.pubertySigns,
    primaryGoal: d.goal,
    nickname: d.nickname,
  };
  const today = toIsoDate(new Date());
  const weightKg = d.weightSkipped ? null : d.weightKg;

  if (d.childId) {
    const existing = await childrenRepo.get(d.childId);
    if (existing) {
      await childrenRepo.update(d.childId, childFields);
      const latest = (await measurementsRepo.forChild(d.childId))[0];
      if (latest) await measurementsRepo.update(latest.id, { heightCm: d.heightCm, weightKg });
      else await measurementsRepo.add({ childId: d.childId, date: today, heightCm: d.heightCm, weightKg, note: null });
      return d.childId;
    }
  }
  const child = await childrenRepo.create(childFields);
  await measurementsRepo.add({ childId: child.id, date: today, heightCm: d.heightCm, weightKg, note: null });
  useDraft.getState().patch({ childId: child.id });
  useSettings.getState().set({ activeChildId: child.id, hasCompletedOnboarding: true });
  return child.id;
}

/** Step navigation: progress, Back label and "Continue" behaviour, including edit-in-place. */
export function useStep(step: StepId) {
  const t = useT();
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEdit = params.edit === '1';
  const mode = useDraft((s) => s.mode);
  const sex = useDraft((s) => s.sex);
  const birth = useDraft((s) => s.birth);
  const progress = isEdit ? undefined : stepProgress(step, { mode, sex, birth });

  const advance = useCallback(async () => {
    analytics.track('onboarding_step_completed', { step });
    if (isEdit) {
      await commitDraft();
      router.back();
      return;
    }
    const next = nextStep(step, draft());
    router.push(`/onboarding/${next}`);
  }, [isEdit, step]);

  return {
    isEdit,
    progress,
    backLabel: isEdit ? t('common.result') : undefined,
    continueLabel: isEdit ? t('common.save') : t('common.continue'),
    advance,
  };
}
