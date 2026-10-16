import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/** Generated PDFs, images and exports live here and are deleted on next launch (brief §5.5). */
export function tempDir(): Directory {
  const dir = new Directory(Paths.cache, 'tallsoon-share');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export async function cleanupTempFiles() {
  if (Platform.OS === 'web') return;
  try {
    const dir = new Directory(Paths.cache, 'tallsoon-share');
    if (dir.exists) dir.delete();
  } catch {
    // Best effort.
  }
}

/** Moves a file into the temp dir under a readable name, so the share sheet shows a good filename. */
export function moveToTemp(uri: string, name: string): string {
  const src = new File(uri);
  const dest = new File(tempDir(), name);
  if (dest.exists) dest.delete();
  src.move(dest);
  return dest.uri;
}

export function writeTempText(name: string, contents: string): string {
  const f = new File(tempDir(), name);
  if (f.exists) f.delete();
  f.create();
  f.write(contents);
  return f.uri;
}
