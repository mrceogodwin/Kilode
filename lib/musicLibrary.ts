/**
 * Device-local music library for Kilode.
 * Saved + recently played survive app restarts.
 * No backend dependency — works in localOnly / seed mode.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_KEY = "@kilode/music/saved";
const RECENT_KEY = "@kilode/music/recent";
const MAX_RECENT = 40;

export type LibraryTrack = {
  id: string;
  title: string;
  artist?: string;
  color?: string;
  audioUrl?: string;
  genre?: string;
  [key: string]: any;
};

function normalize(track: any): LibraryTrack {
  return {
    id: String(track?.id ?? ""),
    title: String(track?.title ?? "Untitled"),
    artist: track?.artist ? String(track.artist) : undefined,
    color: track?.color,
    audioUrl: track?.audioUrl || track?.audio_url || track?.streamUrl || track?.previewUrl,
    genre: track?.genre,
    ...track,
  };
}

async function readList(key: string): Promise<LibraryTrack[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalize).filter((t) => t.id) : [];
  } catch {
    return [];
  }
}

async function writeList(key: string, list: LibraryTrack[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

export async function getSavedTracks(): Promise<LibraryTrack[]> {
  return readList(SAVED_KEY);
}

export async function getRecentTracks(): Promise<LibraryTrack[]> {
  return readList(RECENT_KEY);
}

export async function isTrackSaved(id: string): Promise<boolean> {
  const list = await getSavedTracks();
  return list.some((t) => t.id === String(id));
}

export async function toggleSavedTrack(track: any): Promise<{ saved: boolean; list: LibraryTrack[] }> {
  const list = await getSavedTracks();
  const id = String(track?.id ?? "");
  const idx = list.findIndex((t) => t.id === id);
  let next: LibraryTrack[];
  let saved: boolean;
  if (idx >= 0) {
    next = list.filter((_, i) => i !== idx);
    saved = false;
  } else {
    next = [normalize(track), ...list.filter((t) => t.id !== id)];
    saved = true;
  }
  await writeList(SAVED_KEY, next);
  return { saved, list: next };
}

export async function addRecentTrack(track: any): Promise<LibraryTrack[]> {
  const list = await getRecentTracks();
  const id = String(track?.id ?? "");
  const next = [normalize(track), ...list.filter((t) => t.id !== id)].slice(0, MAX_RECENT);
  await writeList(RECENT_KEY, next);
  return next;
}

export async function clearRecentTracks(): Promise<void> {
  await writeList(RECENT_KEY, []);
}
