import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DB_NAME = 'tallsoon.db';

const sqlite = openDatabaseSync(DB_NAME, { enableChangeListener: true });
sqlite.execSync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;

/** Native opens synchronously; web needs an async warm-up first (see client.web.ts). */
export async function initDb(): Promise<void> {}
