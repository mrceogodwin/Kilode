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
let playbackRequestId = 0;
let positionMillis = 0;
let durationMillis = 0;
let repeatCurrentTrack = false;
let audioModeConfigured = false;
let finishedSound: Audio.Sound | null = null;
let onTrackFinished: (() => void) | null = null;
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

function clearActiveSound(source: Audio.Sound) {
  if (sound !== source) return;
  sound = null;
  currentTrack = null;
  isPlaying = false;
  positionMillis = 0;
  durationMillis = 0;
  finishedSound = null;
  source.setOnPlaybackStatusUpdate(null);
  void source.unloadAsync().catch(() => undefined);
  publish();
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

function onStatus(status: AVPlaybackStatus, source: Audio.Sound) {
  // Ignore late events from sounds that have already been stopped or replaced.
  if (sound !== source) return;

  if (!status.isLoaded) {
    if (status.error) {
      // A native decoder/network failure must not leave a dead track in the UI.
      clearActiveSound(source);
    }
    return;
  }
  positionMillis = status.positionMillis;
  durationMillis = status.durationMillis || 0;
  isPlaying = status.isPlaying;
  if (status.didJustFinish && repeatCurrentTrack) {
    void source.replayAsync().catch(() => {
      if (sound === source) {
        isPlaying = false;
        publish();
      }
    });
    isPlaying = true;
  } else if (status.didJustFinish) {
    isPlaying = false;
    // Native status updates may report the same completion more than once.
    // Advance only once for this sound, and only while it remains active.
    if (finishedSound !== source) {
      finishedSound = source;
      publish();
      onTrackFinished?.();
      return;
    }
  }
  publish();
}

export async function playMusicTrack(track: MusicTrack): Promise<{ ok: boolean; message?: string }> {
  const url = getPlayableUrl(track);
  if (!url) {
    return { ok: false, message: "This track has no playable audio source yet." };
  }
  // A newer Play request supersedes an older source still loading. Request IDs
  // make the older operation dispose of any late native result safely.
  isLoading = true;
  const requestId = ++playbackRequestId;
  try {
    await configureAudioMode();
    // Stop may be pressed while audio-session setup is awaiting native code.
    if (requestId !== playbackRequestId) {
      return { ok: false, message: "Playback was cancelled." };
    }

    const existingSound = sound;
    if (existingSound && currentTrack && trackIdentity(currentTrack) === trackIdentity(track)) {
      const status = await existingSound.getStatusAsync();
      if (requestId !== playbackRequestId || existingSound !== sound) {
        return { ok: false, message: "Playback was cancelled." };
      }
      if (status.isLoaded) {
        if (status.isPlaying) {
          await existingSound.pauseAsync();
        } else if (status.didJustFinish) {
          await existingSound.replayAsync();
        } else {
          await existingSound.playAsync();
        }
        if (requestId !== playbackRequestId || existingSound !== sound) {
          return { ok: false, message: "Playback was cancelled." };
        }
        const updated = await existingSound.getStatusAsync();
        if (requestId !== playbackRequestId || existingSound !== sound || !updated.isLoaded) {
          return { ok: false, message: "Playback was cancelled." };
        }
        isPlaying = updated.isPlaying;
        positionMillis = updated.positionMillis;
        durationMillis = updated.durationMillis || 0;
        publish();
        return { ok: true };
      }
    }

    if (existingSound) {
      existingSound.setOnPlaybackStatusUpdate(null);
      await existingSound.unloadAsync().catch(() => undefined);
      if (requestId !== playbackRequestId) {
        return { ok: false, message: "Playback was cancelled." };
      }
      if (sound === existingSound) sound = null;
    }

    if (requestId !== playbackRequestId) {
      return { ok: false, message: "Playback was cancelled." };
    }

    currentTrack = track;
    isPlaying = false;
    positionMillis = 0;
    durationMillis = 0;
    publish();

    const created = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 }
    );

    // A stop/close may have happened while the native source was loading.
    // Dispose the late result instead of resurrecting playback after the user stopped it.
    if (requestId !== playbackRequestId) {
      created.sound.setOnPlaybackStatusUpdate(null);
      await created.sound.stopAsync().catch(() => undefined);
      await created.sound.unloadAsync().catch(() => undefined);
      return { ok: false, message: "Playback was cancelled." };
    }

    if (!created.status.isLoaded) {
      // createAsync can resolve with an unloaded status for some source failures.
      // Do not leave the UI believing a track started when the native player did not load it.
      created.sound.setOnPlaybackStatusUpdate(null);
      await created.sound.unloadAsync().catch(() => undefined);
      sound = null;
      currentTrack = null;
      isPlaying = false;
      positionMillis = 0;
      durationMillis = 0;
      publish();
      return { ok: false, message: "Kilode couldn't load this audio source. Try another track or try again later." };
    }

    sound = created.sound;
    finishedSound = null;
    // Register only after this sound becomes the active source. This prevents
    // callbacks from a late/replaced source mutating the current player's state.
    created.sound.setOnPlaybackStatusUpdate((status) => onStatus(status, created.sound));
    isPlaying = created.status.isPlaying;
    positionMillis = created.status.positionMillis;
    durationMillis = created.status.durationMillis || 0;
    publish();
    return { ok: true };
  } catch {
    if (requestId !== playbackRequestId) {
      return { ok: false, message: "Playback was cancelled." };
    }
    isPlaying = false;
    positionMillis = 0;
    durationMillis = 0;
    if (!sound) currentTrack = null;
    publish();
    return { ok: false, message: "Playback failed. Please check the connection and try again." };
  } finally {
    // A cancelled older request must not clear the loading state of a newer one.
    if (requestId === playbackRequestId) isLoading = false;
  }
}

export async function seekMusicPlayback(position: number): Promise<void> {
  const source = sound;
  if (!source || !Number.isFinite(position) || position < 0) return;
  try {
    const status = await source.getStatusAsync();
    if (source !== sound) return;
    if (!status.isLoaded) {
      clearActiveSound(source);
      return;
    }

    // Do not accidentally jump to 0 while the stream's duration is still unknown.
    const knownDuration = status.durationMillis ?? durationMillis;
    if (!Number.isFinite(knownDuration) || knownDuration <= 0) return;

    const next = Math.max(0, Math.min(Math.floor(position), knownDuration));
    await source.setPositionAsync(next);
    // A next/stop action may replace the sound while native seeking is in flight.
    if (source !== sound) return;
    // Read the native player's resulting position rather than assuming the seek
    // completed at the requested timestamp (some streams seek to a nearby point).
    const updated = await source.getStatusAsync();
    if (source !== sound) return;
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
  const source = sound;
  if (!source) return;
  try {
    const status = await source.getStatusAsync();
    if (source !== sound) return;
    if (!status.isLoaded) {
      clearActiveSound(source);
      return;
    }
    if (status.isPlaying) await source.pauseAsync();
    else if (status.didJustFinish) await source.replayAsync();
    else await source.playAsync();
    if (source !== sound) return;
    const updated = await source.getStatusAsync();
    if (source !== sound) return;
    if (!updated.isLoaded) {
      clearActiveSound(source);
      return;
    }
    positionMillis = updated.positionMillis;
    durationMillis = updated.durationMillis || 0;
    isPlaying = updated.isPlaying;
    publish();
  } catch {
    if (source !== sound) return;
    isPlaying = false;
    publish();
  }
}

export async function stopMusicPlayback(): Promise<void> {
  // Invalidate any source currently being prepared so its late completion
  // cannot restart audio after this stop request. Release the loading lock
  // immediately so a new Play action can start without waiting for stale native work.
  playbackRequestId += 1;
  isLoading = false;
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
  finishedSound = null;
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

export function setMusicTrackFinishedHandler(handler: (() => void) | null): void {
  onTrackFinished = handler;
}
