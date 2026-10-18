import { sql } from 'drizzle-orm';
import type { useMigrations as useExpoMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import type { Db } from './client.web';

type Migrations = Parameters<typeof useExpoMigrations>[1];
let migration: Promise<void> | undefined;

/** Apply the same bundled journal and migration table through the asynchronous web adapter. */
export function useMigrations(db: Db, migrations: Migrations) {
  const [state, setState] = useState<{ success: boolean; error?: Error }>({ success: false });
  useEffect(() => {
    let cancelled = false;
    const migrate = async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)`);
      const [latest] = await db.values<[number, string, number]>(sql`SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1`);
      await db.transaction(async (tx) => {
        for (const entry of migrations.journal.entries) {
          if (latest && Number(latest[2]) >= entry.when) continue;
          const source = migrations.migrations[`m${entry.idx.toString().padStart(4, '0')}`];
          if (!source) throw new Error(`Missing migration: ${entry.tag}`);
          for (const statement of source.split('--> statement-breakpoint')) {
            if (statement.trim()) await tx.run(sql.raw(statement));
          }
          await tx.run(sql`INSERT INTO __drizzle_migrations (hash, created_at) VALUES (${''}, ${entry.when})`);
        }
      });
    };
    // React Strict Mode may subscribe twice; one journal application owns the transaction.
    migration ??= migrate();
    void migration.then(
      () => { if (!cancelled) setState({ success: true }); },
      (error: unknown) => { if (!cancelled) setState({ success: false, error: error instanceof Error ? error : new Error(String(error)) }); },
    );
    return () => { cancelled = true; };
  }, [db, migrations]);
  return state;
}
