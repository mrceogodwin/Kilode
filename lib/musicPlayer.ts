import { Audio, type AVPlaybackStatus } from "expo-av";
import { addRecentTrack } from "./musicLibrary";

export type MusicPlayerState = {
  track: any | null;
  playing: boolean;
  queue: any[];
  index: number;
};

/** Supports both (state) and legacy (track, playing) listeners. */
type Listener = ((state: MusicPlayerState) => void) | ((track: any | null, playing: boolean) => void);

let sound: Audio.Sound | null = null;
let currentTrack: any | null = null;
let playing = false;
let queue: any[] = [];
let index = -1;
const listeners = new Set<Listener>();

function getState(): MusicPlayerState {
  return { track: currentTrack, playing, queue: [...queue], index };
}

function publish() {
  const state = getState();
  listeners.forEach((listener) => {
    try {
      if (listener.length >= 2) {
        (listener as (track: any | null, playing: boolean) => void)(state.track, state.playing);
      } else {
        (listener as (state: MusicPlayerState) => void)(state);
      }
    } catch {
      // ignore listener errors
    }
  });
}

export function subscribeMusicPlayer(listener: Listener) {
  listeners.add(listener);
  try {
    if (listener.length >= 2) {
      (listener as (track: any | null, playing: boolean) => void)(currentTrack, playing);
    } else {
      (listener as (state: MusicPlayerState) => void)(getState());
    }
  } catch {
    // ignore
  }
  return () => listeners.delete(listener);
}

function getAudioUrl(track: any): string | null {
  const value =
    track?.audioUrl ||
    track?.audio_url ||
    track?.streamUrl ||
    track?.stream_url ||
    track?.previewUrl ||
    track?.preview_url;
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;
}

export function setMusicQueue(tracks: any[], startIndex = 0) {
  queue = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
  index = Math.max(0, Math.min(startIndex, Math.max(queue.length - 1, 0)));
}

export async function playMusicTrack(
  track: any,
  options?: { queue?: any[]; index?: number }
): Promise<{ ok: boolean; message?: string }> {
  if (options?.queue) {
    setMusicQueue(options.queue, options.index ?? 0);
  } else if (queue.length === 0) {
    setMusicQueue([track], 0);
  } else {
    const existing = queue.findIndex((t) => String(t?.id) === String(track?.id));
    if (existing >= 0) index = existing;
    else {
      queue = [track, ...queue];
      index = 0;
    }
  }

  const uri = getAudioUrl(track);
  if (!uri) {
    return { ok: false, message: "This track has no playable audio source yet." };
  }

  try {
    if (sound && String(currentTrack?.id) === String(track?.id)) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        playing = false;
      } else if (status.isLoaded) {
        if (status.didJustFinish) await sound.setPositionAsync(0);
        await sound.playAsync();
        playing = true;
      } else {
        await sound.unloadAsync();
        sound = null;
      }
      if (sound) {
        publish();
        return { ok: true };
      }
    }

    if (sound) await sound.unloadAsync();
    sound = null;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const created = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          playing = status.isPlaying;
          if (status.didJustFinish) {
            playing = false;
            void playNextInQueue();
          }
          publish();
        } else if (status.error) {
          playing = false;
          publish();
        }
      }
    );

    sound = created.sound;
    currentTrack = track;
    playing = created.status.isLoaded ? !!created.status.isPlaying : false;
    void addRecentTrack(track);
    publish();
    return { ok: true };
  } catch {
    playing = false;
    publish();
    return { ok: false, message: "Playback failed. Check the track's audio URL and try again." };
  }
}

export async function toggleMusicPlayback(): Promise<void> {
  if (!sound) return;
  try {
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
      playing = false;
    } else {
      if (status.didJustFinish) await sound.setPositionAsync(0);
      await sound.playAsync();
      playing = true;
    }
    publish();
  } catch {
    playing = false;
    publish();
  }
}

export async function stopMusicPlayback(): Promise<void> {
  try {
    if (sound) await sound.unloadAsync();
  } finally {
    sound = null;
    currentTrack = null;
    playing = false;
    publish();
  }
}

export async function playNextInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (queue.length === 0 || index < 0) {
    return { ok: false, message: "No queue." };
  }
  const nextIndex = index + 1;
  if (nextIndex >= queue.length) {
    playing = false;
    publish();
    return { ok: false, message: "End of queue." };
  }
  index = nextIndex;
  return playMusicTrack(queue[index], { queue, index });
}

export async function playPreviousInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (queue.length === 0 || index < 0) {
    return { ok: false, message: "No queue." };
  }
  const prevIndex = index - 1;
  if (prevIndex < 0) {
    if (sound) {
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
        playing = true;
        publish();
        return { ok: true };
      } catch {
        return { ok: false, message: "Could not restart track." };
      }
    }
    return { ok: false, message: "Start of queue." };
  }
  index = prevIndex;
  return playMusicTrack(queue[index], { queue, index });
}

export function getMusicPlayerState(): MusicPlayerState {
  return getState();
}
