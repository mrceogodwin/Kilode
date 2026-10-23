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
  // Give metadata-only tracks a deterministic local ID so saved/recent/playlist
  // storage can retain them without collapsing unrelated missing IDs together.
  const title = String(track?.title ?? "Untitled").trim();
  const artist = track?.artist ? String(track.artist).trim() : "";
  const suppliedId = String(track?.id ?? "").trim();
  const id = suppliedId || (title !== "Untitled" && artist
    ? `metadata:${title.toLocaleLowerCase()}::${artist.toLocaleLowerCase()}`
    : "");
  return {
    ...track,
    id,
    title,
    artist: artist || undefined,
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

function trackIdentity(track: any): string {
  const normalized = normalize(track);
  if (normalized.id) return normalized.id;
  const title = String(normalized.title ?? "").trim().toLocaleLowerCase();
  const artist = String(normalized.artist ?? "").trim().toLocaleLowerCase();
  return title && artist ? `metadata:${title}::${artist}` : "";
}

// Serialize saved-library read/modify/write operations. UI-level tap guards prevent
// duplicate taps on one row; this queue also protects concurrent saves from separate
// screens so two quick saves cannot overwrite each other's AsyncStorage updates.
let savedMutationQueue: Promise<void> = Promise.resolve();

function serializeSavedMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = savedMutationQueue.then(operation, operation);
  savedMutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function toggleSavedTrack(track: any): Promise<{ saved: boolean; list: LibraryTrack[] }> {
  return serializeSavedMutation(async () => {
    const list = await getSavedTracks();
    const normalized = normalize(track);
    const id = trackIdentity(track);
    if (!id) throw new Error("This track needs a title and artist before it can be saved.");
    const idx = list.findIndex((t) => trackIdentity(t) === id);
    let next: LibraryTrack[];
    let saved: boolean;
    if (idx >= 0) {
      next = list.filter((_, i) => i !== idx);
      saved = false;
    } else {
      next = [normalized, ...list.filter((t) => trackIdentity(t) !== id)];
      saved = true;
    }
    await writeList(SAVED_KEY, next);
    return { saved, list: next };
  });
}

// Serialize recent-history mutations so rapid track changes and Clear History
// cannot race their AsyncStorage read/modify/write cycles.
let recentMutationQueue: Promise<void> = Promise.resolve();

function serializeRecentMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = recentMutationQueue.then(operation, operation);
  recentMutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function addRecentTrack(track: any): Promise<LibraryTrack[]> {
  return serializeRecentMutation(async () => {
    const list = await getRecentTracks();
    const normalized = normalize(track);
    const id = trackIdentity(track);
    if (!id) return list;
    const next = [normalized, ...list.filter((t) => trackIdentity(t) !== id)].slice(0, MAX_RECENT);
    await writeList(RECENT_KEY, next);
    return next;
  });
}

export async function clearRecentTracks(): Promise<void> {
  await serializeRecentMutation(async () => {
    await writeList(RECENT_KEY, []);
  });
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
  const normalized = normalize(track);
  const identity = trackIdentity(track);
  if (!identity) throw new Error("This track needs a title and artist before it can be added.");
  const playlists = await getMusicPlaylists();
  const next = playlists.map((p) => p.id !== id ? p : {
    ...p,
    tracks: p.tracks.some((t) => trackIdentity(t) === identity) ? p.tracks : [...p.tracks, normalized],
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
