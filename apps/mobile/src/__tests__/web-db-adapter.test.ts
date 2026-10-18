import { beforeEach, expect, it, jest } from '@jest/globals';
import { openDatabaseAsync } from 'expo-sqlite';

import { db, initDb } from '../db/client.web';
import { children } from '../db/schema';

let mockRows: unknown[][] = [];
let mockExecuteError: Error | undefined;
const mockFinalize = jest.fn(async () => undefined);

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => undefined),
    prepareAsync: jest.fn(async () => ({
      executeAsync: jest.fn(async () => ({ changes: 1, lastInsertRowId: 1 })),
      executeForRawResultAsync: jest.fn(async () => {
        if (mockExecuteError) throw mockExecuteError;
        return {
          getFirstAsync: async () => mockRows[0] ?? null,
          getAllAsync: async () => mockRows,
        };
      }),
      finalizeAsync: mockFinalize,
    })),
  })),
}));

beforeEach(() => {
  mockRows = [];
  mockExecuteError = undefined;
});

it('opens one async connection for concurrent initialization', async () => {
  await Promise.all([initDb(), initDb()]);
  expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
  expect(openDatabaseAsync).toHaveBeenCalledWith('tallsoon.db', { enableChangeListener: true });
});

it('returns undefined for an absent row and maps a present positional row', async () => {
  await initDb();
  expect(await db.select({ id: children.id }).from(children).get()).toBeUndefined();
  mockRows = [['child-one']];
  expect(await db.select({ id: children.id }).from(children).get()).toEqual({ id: 'child-one' });
  expect(await db.select({ id: children.id }).from(children)).toEqual([{ id: 'child-one' }]);
  expect(await db.insert(children).values({ id: 'child-one', sexAtBirth: 'male', birthDate: '2013-05-01', createdAt: '2026-10-19' }).returning({ id: children.id })).toEqual([{ id: 'child-one' }]);
});

it('finalizes the prepared statement when execution fails', async () => {
  await initDb();
  mockExecuteError = new Error('Database unavailable');
  await expect(db.select({ id: children.id }).from(children)).rejects.toThrow();
  expect(mockFinalize).toHaveBeenCalledTimes(1);
});
