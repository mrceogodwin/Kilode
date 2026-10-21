import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

type MusicTrack = {
  id?: string | number;
  title?: string;
  audioUrl?: string;
  audio_url?: string;
  streamUrl?: string;
  stream_url?: string;
  previewUrl?: string;
  preview_url?: string;
  [key: string]: unknown;
};

type PlayerListener = (track: MusicTrack | null, playing: boolean, positionMillis: number, durationMillis: number) => void;

let sound: Audio.Sound | null = null;
let currentTrack: MusicTrack | null = null;
let isPlaying = false;
let isLoading = false;
let positionMillis = 0;
let durationMillis = 0;
let repeatCurrentTrack = false;
let audioModeConfigured = false;
const listeners = new Set<PlayerListener>();

function publish() {
  listeners.forEach((listener) => {
    try {
      listener(currentTrack, isPlaying, positionMillis, durationMillis);
    } catch {
      // A UI subscriber must not break playback for other subscribers.
    }
  });
}

export function subscribeMusicPlayer(listener: PlayerListener): () => void {
  listeners.add(listener);
  listener(currentTrack, isPlaying, positionMillis, durationMillis);
  return () => listeners.delete(listener);
}

function trackIdentity(track: MusicTrack): string {
  if (track.id !== undefined && track.id !== null && String(track.id).trim()) {
    return `id:${String(track.id)}`;
  }
  const url = getPlayableUrl(track);
  if (url) return `url:${url}`;
  return `meta:${String(track.title || "").trim().toLowerCase()}:${String(track.artist || "").trim().toLowerCase()}`;
}

function getPlayableUrl(track: MusicTrack): string | null {
  const candidate =
    track.audioUrl ??
    track.audio_url ??
    track.streamUrl ??
    track.stream_url ??
    track.previewUrl ??
    track.preview_url;
  if (typeof candidate !== "string") return null;
  const value = candidate.trim();
  return /^https?:\/\//i.test(value) ? value : null;
}

async function configureAudioMode() {
  if (audioModeConfigured) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
  });
  audioModeConfigured = true;
}

function onStatus(status: AVPlaybackStatus) {
  if (!status.isLoaded) {
    if (status.error) {
      isPlaying = false;
      publish();
    }
    return;
  }
  positionMillis = status.positionMillis;
  durationMillis = status.durationMillis || 0;
  isPlaying = status.isPlaying;
  if (status.didJustFinish && repeatCurrentTrack && sound) {
    void sound.replayAsync().catch(() => undefined);
    isPlaying = true;
  } else if (status.didJustFinish) {
    isPlaying = false;
  }
  publish();
}

export async function playMusicTrack(track: MusicTrack): Promise<{ ok: boolean; message?: string }> {
  const url = getPlayableUrl(track);
  if (!url) {
    return { ok: false, message: "This track has no playable audio source yet." };
  }
  if (isLoading) return { ok: false, message: "The player is preparing another track. Try again shortly." };

  isLoading = true;
  try {
    await configureAudioMode();
    if (sound && currentTrack && trackIdentity(currentTrack) === trackIdentity(track)) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
          isPlaying = false;
        } else if (status.didJustFinish) {
          await sound.replayAsync();
          isPlaying = true;
        } else {
          await sound.playAsync();
          isPlaying = true;
        }
        publish();
        return { ok: true };
      }
    }

    if (sound) {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.unloadAsync().catch(() => undefined);
      sound = null;
    }

    currentTrack = track;
    isPlaying = false;
    positionMillis = 0;
    durationMillis = 0;
    publish();

    const created = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      onStatus
    );
    sound = created.sound;
    isPlaying = created.status.isLoaded ? created.status.isPlaying : false;
    publish();
    return { ok: true };
  } catch {
    isPlaying = false;
    positionMillis = 0;
    durationMillis = 0;
    if (!sound) currentTrack = null;
    publish();
    return { ok: false, message: "Playback failed. Please check the connection and try again." };
  } finally {
    isLoading = false;
  }
}

export async function seekMusicPlayback(position: number): Promise<void> {
  if (!sound || !Number.isFinite(position) || position < 0) return;
  try {
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    // Do not accidentally jump to 0 while the stream's duration is still unknown.
    const knownDuration = status.durationMillis ?? durationMillis;
    if (!Number.isFinite(knownDuration) || knownDuration <= 0) return;

    const next = Math.max(0, Math.min(Math.floor(position), knownDuration));
    await sound.setPositionAsync(next);
    // Read the native player's resulting position rather than assuming the seek
    // completed at the requested timestamp (some streams seek to a nearby point).
    const updated = await sound.getStatusAsync();
    if (updated.isLoaded) {
      positionMillis = updated.positionMillis;
      durationMillis = updated.durationMillis ?? knownDuration;
      isPlaying = updated.isPlaying;
    } else {
      positionMillis = next;
    }
    publish();
  } catch {
    // Unsupported or temporarily unavailable stream seeking should not crash the player.
  }
}

export async function toggleMusicPlayback(): Promise<void> {
  if (!sound) return;
  try {
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) await sound.pauseAsync();
    else if (status.didJustFinish) await sound.replayAsync();
    else await sound.playAsync();
  } catch {
    isPlaying = false;
    publish();
  }
}

export async function stopMusicPlayback(): Promise<void> {
  if (!sound) {
    currentTrack = null;
    isPlaying = false;
    positionMillis = 0;
    durationMillis = 0;
    publish();
    return;
  }
  const oldSound = sound;
  sound = null;
  currentTrack = null;
  isPlaying = false;
  positionMillis = 0;
  durationMillis = 0;
  publish();
  oldSound.setOnPlaybackStatusUpdate(null);
  await oldSound.stopAsync().catch(() => undefined);
  await oldSound.unloadAsync().catch(() => undefined);
}


export function setMusicRepeat(enabled: boolean): void {
  repeatCurrentTrack = enabled;
}
