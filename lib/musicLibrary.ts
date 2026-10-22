/**
 * Device-local music library for Kilode.
 * Saved + recently played survive app restarts.
 * No backend dependency — works in localOnly / seed mode.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_KEY = "@kilode/music/saved";
const RECENT_KEY = "@kilode/music/recent";
const PLAYLISTS_KEY = "@kilode/music/playlists";
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
  // Spread metadata first, then enforce canonical fields. Putting ...track last could
  // overwrite the string ID with a number and break saved/recent/playlist comparisons.
  return {
    ...track,
    id: String(track?.id ?? ""),
    title: String(track?.title ?? "Untitled"),
    artist: track?.artist ? String(track.artist) : undefined,
    color: track?.color,
    audioUrl: track?.audioUrl || track?.audio_url || track?.streamUrl || track?.stream_url || track?.previewUrl || track?.preview_url,
    genre: track?.genre,
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


export type MusicPlaylist = {
  id: string;
  name: string;
  tracks: LibraryTrack[];
  updatedAt: number;
};

export async function getMusicPlaylists(): Promise<MusicPlaylist[]> {
  try {
    const raw = await AsyncStorage.getItem(PLAYLISTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((p) => p && typeof p.id === "string" && typeof p.name === "string")
          .map((p) => ({ ...p, tracks: Array.isArray(p.tracks) ? p.tracks.map(normalize).filter((t: LibraryTrack) => t.id) : [] }))
      : [];
  } catch {
    return [];
  }
}

async function writeMusicPlaylists(playlists: MusicPlaylist[]): Promise<void> {
  await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export async function createMusicPlaylist(name: string): Promise<MusicPlaylist[]> {
  const clean = name.trim().slice(0, 48);
  if (!clean) return getMusicPlaylists();
  const playlists = await getMusicPlaylists();
  if (playlists.some((p) => p.name.toLowerCase() === clean.toLowerCase())) {
    throw new Error("A playlist with that name already exists.");
  }
  const next = [{ id: `playlist-${Date.now()}`, name: clean, tracks: [], updatedAt: Date.now() }, ...playlists];
  await writeMusicPlaylists(next);
  return next;
}

export async function renameMusicPlaylist(id: string, name: string): Promise<MusicPlaylist[]> {
  const clean = name.trim().slice(0, 48);
  if (!clean) throw new Error("Enter a playlist name.");
  const playlists = await getMusicPlaylists();
  if (playlists.some((p) => p.id !== id && p.name.toLowerCase() === clean.toLowerCase())) {
    throw new Error("A playlist with that name already exists.");
  }
  const next = playlists.map((p) => p.id === id ? { ...p, name: clean, updatedAt: Date.now() } : p);
  await writeMusicPlaylists(next);
  return next;
}

export async function deleteMusicPlaylist(id: string): Promise<MusicPlaylist[]> {
  const next = (await getMusicPlaylists()).filter((p) => p.id !== id);
  await writeMusicPlaylists(next);
  return next;
}

export async function addTrackToMusicPlaylist(id: string, track: any): Promise<MusicPlaylist[]> {
  if (!track?.id) throw new Error("This track cannot be added yet.");
  const playlists = await getMusicPlaylists();
  const next = playlists.map((p) => p.id !== id ? p : {
    ...p,
    tracks: p.tracks.some((t) => t.id === String(track.id)) ? p.tracks : [...p.tracks, normalize(track)],
    updatedAt: Date.now(),
  });
  await writeMusicPlaylists(next);
  return next;
}

export async function removeTrackFromMusicPlaylist(id: string, trackId: string): Promise<MusicPlaylist[]> {
  const next = (await getMusicPlaylists()).map((p) => p.id === id
    ? { ...p, tracks: p.tracks.filter((t) => t.id !== String(trackId)), updatedAt: Date.now() }
    : p);
  await writeMusicPlaylists(next);
  return next;
}
