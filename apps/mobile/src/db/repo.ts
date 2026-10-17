import { and, asc, desc, eq, getTableColumns, gte, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import type { ExportFile } from '@tallsoon/engine';

import { db } from './client';
import { children, habitChecks, measurements, type Child, type HabitCheck, type Measurement, type NewChild } from './schema';

export type ChildInput = Omit<NewChild, 'id' | 'createdAt'>;

export const childrenRepo = {
  list(): Promise<Child[]> {
    return db.select().from(children).orderBy(asc(children.createdAt));
  },
  async get(id: string): Promise<Child | undefined> {
    const rows = await db.select().from(children).where(eq(children.id, id)).limit(1);
    return rows[0];
  },
  async create(input: ChildInput): Promise<Child> {
    const row: NewChild = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    await db.insert(children).values(row);
    return (await childrenRepo.get(row.id)) as Child;
  },
  async update(id: string, patch: Partial<ChildInput>): Promise<void> {
    await db.update(children).set(patch).where(eq(children.id, id));
  },
  async remove(id: string): Promise<void> {
    await db.delete(children).where(eq(children.id, id));
  },
};

export const measurementsRepo = {
  forChild(childId: string): Promise<Measurement[]> {
    return db
      .select({ ...getTableColumns(measurements), sequence: sql<number>`rowid` })
      .from(measurements)
      .where(eq(measurements.childId, childId))
      .orderBy(desc(measurements.date), desc(sql<number>`rowid`));
  },
  async add(input: Omit<Measurement, 'id' | 'sequence'>): Promise<Measurement> {
    const row = { ...input, id: randomUUID() };
    const [inserted] = await db
      .insert(measurements)
      .values(row)
      .returning({ ...getTableColumns(measurements), sequence: sql<number>`rowid` });
    if (!inserted) throw new Error('Measurement insert did not return the saved row');
    return inserted;
  },
  async update(id: string, patch: Partial<Omit<Measurement, 'id' | 'childId' | 'sequence'>>): Promise<void> {
    await db.update(measurements).set(patch).where(eq(measurements.id, id));
  },
  async remove(id: string): Promise<void> {
    await db.delete(measurements).where(eq(measurements.id, id));
  },
  /** Free users keep a single measurement: replace it (brief §3.2). */
  async replaceSingle(childId: string, input: Omit<Measurement, 'id' | 'childId' | 'sequence'>): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(measurements).where(eq(measurements.childId, childId));
      await tx.insert(measurements).values({ ...input, childId, id: randomUUID() });
    });
  },
};

export const habitsRepo = {
  since(childId: string, fromDay: string): Promise<HabitCheck[]> {
    return db
      .select()
      .from(habitChecks)
      .where(and(eq(habitChecks.childId, childId), gte(habitChecks.day, fromDay)));
  },
  all(childId: string): Promise<HabitCheck[]> {
    return db.select().from(habitChecks).where(eq(habitChecks.childId, childId));
  },
  async set(childId: string, day: string, habitKey: string, done: boolean): Promise<void> {
    if (done) {
      await db
        .insert(habitChecks)
        .values({ id: randomUUID(), childId, day, habitKey, done: true, isRestDay: false })
        .onConflictDoUpdate({ target: [habitChecks.childId, habitChecks.day, habitChecks.habitKey], set: { done: true } });
    } else {
      await db
        .delete(habitChecks)
        .where(and(eq(habitChecks.childId, childId), eq(habitChecks.day, day), eq(habitChecks.habitKey, habitKey)));
    }
  },
};

export async function exportAll(): Promise<ExportFile> {
  const kids = await db.select().from(children);
  const ids = kids.map((k) => k.id);
  const ms = ids.length ? await db.select().from(measurements).where(inArray(measurements.childId, ids)) : [];
  const hs = ids.length ? await db.select().from(habitChecks).where(inArray(habitChecks.childId, ids)) : [];
  return {
    format: 'tallsoon-export',
    version: 1,
    exportedAt: new Date().toISOString(),
    children: kids.map((k) => ({ ...k, pubertySigns: k.pubertySigns ?? [] })),
    measurements: ms,
    habitChecks: hs,
  };
}

export async function deleteAllRows(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(habitChecks);
    await tx.delete(measurements);
    await tx.delete(children);
  });
}
