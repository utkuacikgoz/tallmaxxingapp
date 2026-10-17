import { asc, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import {
  growthVelocity,
  predictionHistory,
  toIsoDate,
  type PredictionSummary,
  type Velocity,
  type HistoryPoint,
} from '@tallsoon/engine';

import { db } from '@/db/client';
import { children, measurements, type Child, type Measurement } from '@/db/schema';
import { engine, predictOptions } from '@/lib/engine';
import { useSettings } from '@/state/settings';

export function useChildren(): Child[] {
  const { data } = useLiveQuery(db.select().from(children).orderBy(asc(children.createdAt)));
  return data ?? [];
}

/** Active child: the selected one, else the first. */
export function useActiveChild(): Child | null {
  const kids = useChildren();
  const activeId = useSettings((s) => s.activeChildId);
  return kids.find((k) => k.id === activeId) ?? kids[0] ?? null;
}

export function useMeasurements(childId: string | null | undefined): Measurement[] {
  const { data } = useLiveQuery(
    db
      .select({ ...getTableColumns(measurements), sequence: sql<number>`rowid` })
      .from(measurements)
      .where(eq(measurements.childId, childId ?? ''))
      .orderBy(desc(measurements.date), desc(sql<number>`rowid`)),
    [childId],
  );
  return data ?? [];
}

export interface ChildModel {
  child: Child;
  measurements: Measurement[];
  latest: Measurement | null;
  /** Most recent known weight (carried from older rows). */
  weightKg: number | null;
  summary: PredictionSummary | null;
  history: HistoryPoint[];
  velocity: Velocity | null;
}

export function summarize(child: Child, ms: Measurement[], reference = useSettings.getState().reference): ChildModel {
  const latest = ms[0] ?? null;
  const weightKg = ms.find((m) => m.weightKg != null)?.weightKg ?? null;
  const opts = { ...predictOptions(), reference };
  let summary: PredictionSummary | null = null;
  if (latest) {
    try {
      summary = engine.predict(
        {
          sex: child.sexAtBirth,
          birthDate: child.birthDate,
          measuredOn: latest.date,
          heightCm: latest.heightCm,
          weightKg,
          motherHeightCm: child.motherHeightCm,
          fatherHeightCm: child.fatherHeightCm,
        },
        opts,
      );
    } catch {
      summary = null;
    }
  }
  const points = ms.map((m) => ({ date: m.date, heightCm: m.heightCm, weightKg: m.weightKg, sequence: m.sequence }));
  return {
    child,
    measurements: ms,
    latest,
    weightKg,
    summary,
    history: predictionHistory(
      engine,
      { sex: child.sexAtBirth, birthDate: child.birthDate, motherHeightCm: child.motherHeightCm, fatherHeightCm: child.fatherHeightCm },
      points,
      opts,
    ),
    velocity: growthVelocity(engine, points, child.birthDate, child.sexAtBirth, reference),
  };
}

/** Child + measurements + prediction, recomputed whenever data or settings change. */
export function useChildModel(child: Child | null): ChildModel | null {
  const ms = useMeasurements(child?.id);
  const reference = useSettings((s) => s.reference);
  return useMemo(() => (child ? summarize(child, ms, reference) : null), [child, ms, reference]);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}
