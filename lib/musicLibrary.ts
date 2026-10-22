/**
 * Device-local Music library (saved + recently played).
 * Not server entitlements — never presented as purchases or live cloud library.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_KEY = "@kilode/music_saved_v1";
const RECENT_KEY = "@kilode/music_recent_v1";

export type LibraryTrack = {
  id: string;
  title: string;
  artist: string;
  color?: string;
  audioUrl?: string;
  genre?: string;
  savedAt?: string;
  playedAt?: string;
};

async function readList(key: string): Promise<LibraryTrack[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => x && x.id && x.title) : [];
  } catch {
    return [];
  }
}

async function writeList(key: string, list: LibraryTrack[]) {
  await AsyncStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
}

export async function loadSavedTracks(): Promise<LibraryTrack[]> {
  return readList(SAVED_KEY);
}

export async function loadRecentTracks(): Promise<LibraryTrack[]> {
  return readList(RECENT_KEY);
}

export async function isTrackSaved(id: string): Promise<boolean> {
  const list = await loadSavedTracks();
  return list.some((t) => String(t.id) === String(id));
}

export async function toggleSavedTrack(track: LibraryTrack): Promise<{ saved: boolean; list: LibraryTrack[] }> {
  const list = await loadSavedTracks();
  const idx = list.findIndex((t) => String(t.id) === String(track.id));
  if (idx >= 0) {
    list.splice(idx, 1);
    await writeList(SAVED_KEY, list);
    return { saved: false, list };
  }
  const next = [{ ...track, savedAt: new Date().toISOString() }, ...list];
  await writeList(SAVED_KEY, next);
  return { saved: true, list: next };
}

export async function pushRecentTrack(track: LibraryTrack): Promise<void> {
  const list = await loadRecentTracks();
  const filtered = list.filter((t) => String(t.id) !== String(track.id));
  const next = [{ ...track, playedAt: new Date().toISOString() }, ...filtered];
  await writeList(RECENT_KEY, next);
}
