import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { openDatabaseAsync } from 'expo-sqlite';

import * as schema from './schema';

export const DB_NAME = 'tallsoon.db';

type RealDb = ReturnType<typeof drizzle<typeof schema>>;
let real: RealDb | null = null;
let initialization: Promise<void> | undefined;

/**
 * Keep all web queries asynchronous: Expo's synchronous worker bridge busy-spins on the main
 * thread and can time out even after startup when a write or browser scheduling takes longer.
 * sqlite-proxy is a local adapter here; no SQL or child data leaves this device.
 */
export function initDb(): Promise<void> {
  initialization ??= (async () => {
    const sqlite = await openDatabaseAsync(DB_NAME, { enableChangeListener: true });
    await sqlite.execAsync('PRAGMA foreign_keys = ON;');
    real = drizzle(async (sql, params, method) => {
      const statement = await sqlite.prepareAsync(sql);
      try {
        if (method === 'run') {
          await statement.executeAsync(params);
          return { rows: [] };
        }
        const result = await statement.executeForRawResultAsync(params);
        // Drizzle maps column positions itself. `get` expects one row; `all` and `values`
        // expect a matrix, including INSERT ... RETURNING queries.
        if (method === 'get') {
          // sqlite-proxy's callback type declares only arrays, but its get mapper requires
          // undefined for a missing row. Keep that assertion at this driver boundary.
          return { rows: (await result.getFirstAsync()) ?? undefined } as { rows: unknown[] };
        }
        return { rows: await result.getAllAsync() };
      } finally {
        await statement.finalizeAsync();
      }
    }, { schema });
  })();
  return initialization;
}

export const db = new Proxy({} as RealDb, {
  get(_t, prop) {
    if (!real) throw new Error('initDb() must finish before using the database');
    const v = Reflect.get(real, prop, real) as unknown;
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});
export type Db = RealDb;
