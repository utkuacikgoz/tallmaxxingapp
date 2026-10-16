import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DB_NAME = 'tallsoon.db';

type RealDb = ReturnType<typeof drizzle<typeof schema>>;
let real: RealDb | null = null;

/**
 * Web only (used for previews and screenshots). The first synchronous call into expo-sqlite's
 * worker can time out while the WebAssembly loads, so we open asynchronously once, then hand out
 * the synchronous connection Drizzle needs.
 */
export async function initDb(): Promise<void> {
  if (real) return;
  const warm = await openDatabaseAsync(DB_NAME);
  await warm.execAsync('PRAGMA foreign_keys = ON;');
  real = drizzle(openDatabaseSync(DB_NAME, { enableChangeListener: true }), { schema });
}

export const db = new Proxy({} as RealDb, {
  get(_t, prop) {
    if (!real) throw new Error('initDb() must finish before using the database');
    const v = Reflect.get(real, prop, real) as unknown;
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});
export type Db = RealDb;
