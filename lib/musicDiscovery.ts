import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@kilode/music-discovery/v1";

function storageKeyFor(accountScope = "guest"): string {
  const scope = String(accountScope || "guest").trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_-]/g, "_").slice(0, 64) || "guest";
  return `${STORAGE_KEY}:${scope}`;
}
const MAX_HISTORY = 250;

export type MusicDiscoveryEvent = {
  trackKey: string;
  title: string;
  artist: string;
  genre?: string;
  action: "played" | "saved" | "skipped" | "opened";
  at: number;
  listenedMs?: number;
};

export type MusicDiscoveryProfile = {
  version: 1;
  events: MusicDiscoveryEvent[];
  hiddenTrackKeys: string[];
};

function keyFor(track: any): string {
  if (track?.id !== undefined && track?.id !== null && String(track.id).trim()) return `id:${String(track.id)}`;
  return `meta:${String(track?.title || "").trim().toLowerCase()}:${String(track?.artist || "").trim().toLowerCase()}`;
}

function emptyProfile(): MusicDiscoveryProfile {
  return { version: 1, events: [], hiddenTrackKeys: [] };
}

export async function readMusicDiscoveryProfile(accountScope = "guest"): Promise<MusicDiscoveryProfile> {
  try {
    const raw = await AsyncStorage.getItem(storageKeyFor(accountScope));
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.events)) return emptyProfile();
    return {
      version: 1,
      events: parsed.events.slice(-MAX_HISTORY),
      hiddenTrackKeys: Array.isArray(parsed.hiddenTrackKeys) ? parsed.hiddenTrackKeys : [],
    };
  } catch {
    return emptyProfile();
  }
}

export async function recordMusicDiscoveryAction(
  track: any,
  action: MusicDiscoveryEvent["action"],
  listenedMs?: number,
  accountScope = "guest"
): Promise<void> {
  if (!track || !String(track.title || "").trim()) return;
  try {
    const profile = await readMusicDiscoveryProfile(accountScope);
    const event: MusicDiscoveryEvent = {
      trackKey: keyFor(track),
      title: String(track.title),
      artist: String(track.artist || ""),
      genre: String(track.genre || track.genre_name || track.category || ""),
      action,
      at: Date.now(),
      ...(Number.isFinite(listenedMs) ? { listenedMs } : {}),
    };
    profile.events.push(event);
    profile.events = profile.events.slice(-MAX_HISTORY);
    await AsyncStorage.setItem(storageKeyFor(accountScope), JSON.stringify(profile));
  } catch {
    // Personalisation is an enhancement; storage failures must never block music.
  }
}

export type MusicDiscoveryShelf = {
  id: string;
  title: string;
  subtitle: string;
  tracks: any[];
};

/** Ranks the already-loaded catalogue on-device. This function never performs network requests. */
export function buildMusicDiscoveryShelves(
  tracks: any[],
  profile: MusicDiscoveryProfile
): MusicDiscoveryShelf[] {
  const valid = (tracks || []).filter((track) => track && String(track.title || "").trim());
  if (!valid.length) return [];

  const events = profile.events || [];
  const recentPlays = events.filter((event) => event.action === "played").slice().reverse();
  const recentKeys = new Set<string>();
  const continueTracks: any[] = [];
  for (const event of recentPlays) {
    if (recentKeys.has(event.trackKey)) continue;
    recentKeys.add(event.trackKey);
    const match = valid.find((track) => keyFor(track) === event.trackKey);
    if (match) continueTracks.push(match);
    if (continueTracks.length >= 8) break;
  }

  const artistScores = new Map<string, number>();
  const genreScores = new Map<string, number>();
  const trackScores = new Map<string, number>();
  const now = Date.now();
  for (const event of events) {
    const ageDays = Math.max(0, (now - event.at) / 86400000);
    const recency = Math.exp(-ageDays / 18);
    const base = event.action === "saved" ? 8 : event.action === "played" ? 3 : event.action === "skipped" ? -4 : 0.6;
    const weight = base * recency;
    const artist = event.artist.trim().toLowerCase();
    const genre = event.genre?.trim().toLowerCase();
    if (artist) artistScores.set(artist, (artistScores.get(artist) || 0) + weight);
    if (genre) genreScores.set(genre, (genreScores.get(genre) || 0) + weight);
    trackScores.set(event.trackKey, (trackScores.get(event.trackKey) || 0) + weight);
  }

  const ranked = valid
    .filter((track) => !profile.hiddenTrackKeys.includes(keyFor(track)))
    .map((track, index) => {
      const artist = String(track.artist || "").toLowerCase();
      const genre = String(track.genre || track.genre_name || track.category || "").toLowerCase();
      const seen = trackScores.get(keyFor(track)) || 0;
      const affinity = (artistScores.get(artist) || 0) * 1.4 + (genreScores.get(genre) || 0) * 1.2;
      // Small stable catalogue-order term avoids reshuffling on every render.
      return { track, score: affinity - seen * 0.45 + Math.max(0, 0.2 - index * 0.002) };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.track);

  const seenKeys = new Set(recentPlays.map((event) => event.trackKey));
  const nextUp = ranked.filter((track) => !seenKeys.has(keyFor(track))).slice(0, 8);
  const shelves: MusicDiscoveryShelf[] = [];
  if (continueTracks.length) shelves.push({
    id: "recently-in-your-orbit",
    title: "Back in your orbit",
    subtitle: "Pick up where your listening took you",
    tracks: continueTracks,
  });
  if (nextUp.length) shelves.push({
    id: "next-in-your-sound",
    title: events.length ? "Your sound, one step further" : "Find your sound",
    subtitle: events.length ? "A local mix shaped by what you play" : "Start a few tracks and Kilode will tune this shelf to you",
    tracks: nextUp,
  });
  return shelves;
}
