import { Audio, AVPlaybackStatus } from "expo-av";

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

type PlayerListener = (track: MusicTrack | null, playing: boolean) => void;

let sound: Audio.Sound | null = null;
let currentTrack: MusicTrack | null = null;
let isPlaying = false;
let isLoading = false;
let audioModeConfigured = false;
const listeners = new Set<PlayerListener>();

function publish() {
  listeners.forEach((listener) => {
    try {
      listener(currentTrack, isPlaying);
    } catch {
      // A UI subscriber must not break playback for other subscribers.
    }
  });
}

export function subscribeMusicPlayer(listener: PlayerListener): () => void {
  listeners.add(listener);
  listener(currentTrack, isPlaying);
  return () => listeners.delete(listener);
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
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
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
  isPlaying = status.isPlaying;
  if (status.didJustFinish) {
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
    if (sound && currentTrack && String(currentTrack.id) === String(track.id)) {
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
    publish();
    return { ok: false, message: "Playback failed. Please check the connection and try again." };
  } finally {
    isLoading = false;
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
    publish();
    return;
  }
  const oldSound = sound;
  sound = null;
  currentTrack = null;
  isPlaying = false;
  publish();
  oldSound.setOnPlaybackStatusUpdate(null);
  await oldSound.stopAsync().catch(() => undefined);
  await oldSound.unloadAsync().catch(() => undefined);
}

