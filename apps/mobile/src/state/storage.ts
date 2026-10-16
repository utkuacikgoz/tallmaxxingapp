import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/** MMKV for settings and small UI caches (brief §5.3). Child data lives in SQLite. */
export const kv = createMMKV({ id: 'tallsoon' });

export const zustandStorage: StateStorage = {
  getItem: (name) => kv.getString(name) ?? null,
  setItem: (name, value) => kv.set(name, value),
  removeItem: (name) => {
    kv.remove(name);
  },
};
