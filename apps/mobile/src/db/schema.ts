import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/** On-device data model (brief §5.3). Everything stays on the phone. */
export const children = sqliteTable('children', {
  id: text('id').primaryKey(),
  nickname: text('nickname').notNull().default(''),
  avatarEmoji: text('avatar_emoji').notNull().default('🙂'),
  sexAtBirth: text('sex_at_birth', { enum: ['female', 'male'] }).notNull(),
  birthDate: text('birth_date').notNull(),
  motherHeightCm: real('mother_height_cm'),
  fatherHeightCm: real('father_height_cm'),
  parentHeightsSelfReported: integer('parent_heights_self_reported', { mode: 'boolean' }).notNull().default(true),
  parentHeightEstimated: text('parent_height_estimated', { enum: ['mother', 'father'] }),
  sleepBand: text('sleep_band', { enum: ['lt7', '7-8', '8-9', '9+'] }),
  pubertySigns: text('puberty_signs', { mode: 'json' }).$type<string[]>().notNull().default([]),
  primaryGoal: text('primary_goal'),
  bedtime: text('bedtime'),
  createdAt: text('created_at').notNull(),
});

export const measurements = sqliteTable(
  'measurements',
  {
    id: text('id').primaryKey(),
    childId: text('child_id')
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    heightCm: real('height_cm').notNull(),
    weightKg: real('weight_kg'),
    note: text('note'),
  },
  (t) => [index('measurements_child_date').on(t.childId, t.date)],
);

export const habitChecks = sqliteTable(
  'habit_checks',
  {
    id: text('id').primaryKey(),
    childId: text('child_id')
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    day: text('day').notNull(),
    habitKey: text('habit_key').notNull(),
    done: integer('done', { mode: 'boolean' }).notNull().default(true),
    isRestDay: integer('is_rest_day', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [uniqueIndex('habit_checks_unique').on(t.childId, t.day, t.habitKey), index('habit_checks_child_day').on(t.childId, t.day)],
);

export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type HabitCheck = typeof habitChecks.$inferSelect;
