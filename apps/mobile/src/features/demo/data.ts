import { ageBandFor, habitsForDay } from '@tallsoon/content';
import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { children, habitChecks, measurements } from '@/db/schema';
import { entitlements, useEntitlementStore } from '@/services/entitlements';
import { FREE_STATUS } from '@/services/entitlements/types';
import { useSettings } from '@/state/settings';

/** Reserved exclusively for the debug screenshot child. Never reuse for user-created children. */
export const DEMO_CHILD_ID = '00000000-0000-4000-8000-000000000101';
const DEMO_MEASUREMENT_PREFIX = `${DEMO_CHILD_ID}-measurement-`;
const DEMO_HABIT_PREFIX = `${DEMO_CHILD_ID}-habit-`;

function assertDemoMode() {
  if (!__DEV__ || entitlements.kind !== 'mock') {
    throw new Error('Demo data is available only in debug builds using mock entitlements.');
  }
}

function shiftedDate(date: Date, months: number): Date {
  const shifted = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
  // Preserve end-of-month dates by clamping to the destination month.
  if (shifted.getUTCDate() !== date.getUTCDate()) shifted.setUTCDate(0);
  return shifted;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function ageFourteenBirthDate(today: Date): string {
  const birthday = shiftedDate(today, -14 * 12);
  return isoDay(birthday);
}

export async function seedDemoData(nickname: string): Promise<void> {
  assertDemoMode();
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const existing = await db.select().from(children).where(eq(children.id, DEMO_CHILD_ID)).limit(1);
  if (existing[0] && existing[0].nickname !== nickname) {
    throw new Error('The reserved demo child ID is already used by a different child.');
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(children)
      .values({
        id: DEMO_CHILD_ID,
        nickname,
        avatarEmoji: '🌿',
        sexAtBirth: 'female',
        birthDate: ageFourteenBirthDate(today),
        motherHeightCm: 164,
        fatherHeightCm: 178,
        parentHeightsSelfReported: true,
        parentHeightEstimated: null,
        sleepBand: '8-9',
        pubertySigns: [],
        primaryGoal: null,
        bedtime: null,
        createdAt: now.toISOString(),
      })
      .onConflictDoNothing();

    for (let index = 0; index < 6; index++) {
      const date = shiftedDate(today, -2 * (5 - index));
      await tx
        .insert(measurements)
        .values({
          id: `${DEMO_MEASUREMENT_PREFIX}${index + 1}`,
          childId: DEMO_CHILD_ID,
          date: isoDay(date),
          heightCm: 158.1 + index * 0.38,
          weightKg: 48.2 + index * 0.45,
          note: null,
        })
        .onConflictDoNothing();
    }

    const band = ageBandFor(14);
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const day = new Date(today);
      day.setUTCDate(day.getUTCDate() - dayOffset);
      for (const habit of habitsForDay(band, isoDay(day))) {
        await tx
          .insert(habitChecks)
          .values({
            id: `${DEMO_HABIT_PREFIX}${isoDay(day)}-${habit.key}`,
            childId: DEMO_CHILD_ID,
            day: isoDay(day),
            habitKey: habit.key,
            done: true,
            isRestDay: false,
          })
          .onConflictDoNothing();
      }
    }
  });

  const settings = useSettings.getState();
  settings.set({ activeChildId: DEMO_CHILD_ID, bestStreak: { ...settings.bestStreak, [DEMO_CHILD_ID]: 14 } });
  // This only affects the debug mock store. RevenueCat is never touched or overridden.
  useEntitlementStore.getState().set({
    ...FREE_STATUS,
    isPro: true,
    multiChild: true,
    plan: 'annual',
    willRenew: true,
  });
}

export async function removeDemoData(nickname: string): Promise<boolean> {
  assertDemoMode();
  const existing = await db.select().from(children).where(eq(children.id, DEMO_CHILD_ID)).limit(1);
  // A reserved ID alone is not enough: fail closed if it has unexpected user data.
  if (!existing[0] || existing[0].nickname !== nickname) return false;

  await db.delete(children).where(eq(children.id, DEMO_CHILD_ID));
  const settings = useSettings.getState();
  settings.set({
    activeChildId: settings.activeChildId === DEMO_CHILD_ID ? null : settings.activeChildId,
    bestStreak: Object.fromEntries(Object.entries(settings.bestStreak).filter(([id]) => id !== DEMO_CHILD_ID)),
  });
  // Restore the real mock entitlement saved by the service before demo mode.
  useEntitlementStore.getState().set(await entitlements.getStatus());
  return true;
}
