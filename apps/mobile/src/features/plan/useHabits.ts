import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { addDays, computeStreak, habitScore, type DayLog, type HabitScore, type StreakResult } from '@tallsoon/engine';
import { habits as allHabits, type HabitCategory } from '@tallsoon/content';

import { refreshReminders } from '@/features/app/lifecycle';
import { db } from '@/db/client';
import { habitsRepo } from '@/db/repo';
import { habitChecks } from '@/db/schema';
import { analytics } from '@/services/analytics';
import { useSettings } from '@/state/settings';

const categoryOf = new Map(allHabits.map((h) => [h.key, h.category as HabitCategory]));

export interface HabitsModel {
  /** Ticked habit keys by day. */
  byDay: Map<string, Set<string>>;
  logs: DayLog[];
  streak: StreakResult;
  score: HabitScore;
  lastWeekScore: HabitScore;
}

export function useHabits(childId: string | null | undefined, today: string): HabitsModel {
  const { data } = useLiveQuery(db.select().from(habitChecks).where(eq(habitChecks.childId, childId ?? '')), [childId]);
  const best = useSettings((s) => (childId ? (s.bestStreak[childId] ?? 0) : 0));
  return useMemo(() => {
    const byDay = new Map<string, Set<string>>();
    for (const row of data ?? []) {
      if (!row.done) continue;
      let set = byDay.get(row.day);
      if (!set) byDay.set(row.day, (set = new Set()));
      set.add(row.habitKey);
    }
    const logs: DayLog[] = [...byDay.entries()].map(([day, keys]) => ({
      day,
      done: keys.size,
      categories: [...keys].map((k) => categoryOf.get(k)).filter((c): c is HabitCategory => !!c),
    }));
    const streak = computeStreak(logs, today, best);
    return {
      byDay,
      logs,
      streak,
      score: habitScore(logs, today, streak.restDays),
      lastWeekScore: habitScore(logs, addDays(today, -7), streak.restDays),
    };
  }, [data, today, best]);
}

export type TickOutcome = 'none' | 'streak' | 'allDone';

/** Ticks or unticks a habit. Returns the milestone this tick reached, for the banner. */
export async function setHabit(childId: string, day: string, key: string, done: boolean, before: number, total: number): Promise<TickOutcome> {
  await habitsRepo.set(childId, day, key, done);
  void refreshReminders().catch(() => undefined);
  if (!done) return 'none';
  analytics.track('habit_checked');
  const after = before + 1;
  if (after === total) return 'allDone';
  if (after === 3) return 'streak';
  return 'none';
}

/** Persists the best streak forever (brief §12.4). */
export function rememberBest(childId: string, best: number) {
  const s = useSettings.getState();
  if ((s.bestStreak[childId] ?? 0) < best) s.set({ bestStreak: { ...s.bestStreak, [childId]: best } });
}
