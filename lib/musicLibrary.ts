/**
 * Device-local Music library (saved + recently played).
 * Not server entitlements — never presented as purchases or live cloud library.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_KEY = "@kilode/music_saved_v1";
const RECENT_KEY = "@kilode/music_recent_v1";
const PLAYLISTS_KEY = "@kilode/music_playlists_v1";

export type MusicPlaylist = { id: string; name: string; tracks: LibraryTrack[]; createdAt: string };

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


export async function loadMusicPlaylists(): Promise<MusicPlaylist[]> {
  try { const raw = await AsyncStorage.getItem(PLAYLISTS_KEY); if (!raw) return []; const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((p) => p && p.id && p.name && Array.isArray(p.tracks)) : []; } catch { return []; }
}
async function writeMusicPlaylists(list: MusicPlaylist[]): Promise<void> { await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(list.slice(0, 100))); }
export async function createMusicPlaylist(name: string): Promise<MusicPlaylist[]> {
  const clean = name.trim().slice(0, 60); if (!clean) return loadMusicPlaylists(); const list = await loadMusicPlaylists();
  if (list.some((p) => p.name.toLowerCase() === clean.toLowerCase())) return list;
  list.unshift({ id: `playlist-${Date.now()}`, name: clean, tracks: [], createdAt: new Date().toISOString() }); await writeMusicPlaylists(list); return list;
}
export async function renameMusicPlaylist(id: string, name: string): Promise<MusicPlaylist[]> {
  const clean = name.trim().slice(0, 60);
  if (!clean) return loadMusicPlaylists();
  const list = await loadMusicPlaylists();
  if (list.some((p) => p.id !== id && p.name.toLowerCase() === clean.toLowerCase())) {
    throw new Error("A playlist with that name already exists.");
  }
  const playlist = list.find((p) => p.id === id);
  if (playlist) playlist.name = clean;
  await writeMusicPlaylists(list);
  return list;
}
export async function deleteMusicPlaylist(id: string): Promise<MusicPlaylist[]> { const list = (await loadMusicPlaylists()).filter((p) => p.id !== id); await writeMusicPlaylists(list); return list; }
export async function addTrackToMusicPlaylist(playlistId: string, track: LibraryTrack): Promise<MusicPlaylist[]> {
  const list = await loadMusicPlaylists(); const playlist = list.find((p) => p.id === playlistId); if (!playlist) return list;
  if (!playlist.tracks.some((t) => String(t.id) === String(track.id))) playlist.tracks.push(track); await writeMusicPlaylists(list); return list;
}
