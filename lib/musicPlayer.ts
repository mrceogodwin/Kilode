import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { addRecentTrack } from "./musicLibrary";

export type RepeatMode = "off" | "all" | "one";

export type MusicPlayerState = {
  track: any | null;
  playing: boolean;
  queue: any[];
  index: number;
  positionMillis: number;
  durationMillis: number;
  shuffle: boolean;
  repeat: RepeatMode;
  recentHistoryRevision: number;
};

type Listener =
  | ((state: MusicPlayerState) => void)
  | ((track: any | null, playing: boolean) => void);

let sound: AudioPlayer | null = null;
let currentTrack: any | null = null;
let playing = false;
let queue: any[] = [];
let index = -1;
let positionMillis = 0;
let durationMillis = 0;
let shuffle = false;
let repeat: RepeatMode = "off";
let recentHistoryRevision = 0;
let handlingTrackFinish = false;
const listeners = new Set<Listener>();

function getState(): MusicPlayerState {
  return {
    track: currentTrack,
    playing,
    queue: [...queue],
    index,
    positionMillis,
    durationMillis,
    shuffle,
    repeat,
    recentHistoryRevision,
  };
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
      // Listener failures must not interrupt audio playback.
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
  } catch {}
  return () => listeners.delete(listener);
}

function getAudioUrl(track: any): string | null {
  const value = track?.audioUrl || track?.audio_url || track?.streamUrl || track?.stream_url || track?.previewUrl || track?.preview_url;
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;
}

export function setMusicQueue(tracks: any[], startIndex = 0) {
  queue = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
  index = queue.length ? Math.max(0, Math.min(startIndex, queue.length - 1)) : -1;
  publish();
}

export function addTracksToQueue(tracks: any[]) {
  const additions = (Array.isArray(tracks) ? tracks : [tracks]).filter(Boolean);
  const existing = new Set(queue.map((t) => t?.id != null ? String(t.id) : null).filter((id): id is string => id !== null));
  additions.forEach((track) => {
    const id = track?.id != null ? String(track.id) : null;
    if (id === null || !existing.has(id)) {
      queue.push(track);
      if (id !== null) existing.add(id);
    }
  });
  if (index < 0 && queue.length) index = 0;
  publish();
}

export function playTrackNext(track: any) {
  if (!track) return;
  const targetId = track?.id == null ? null : String(track.id);
  const currentTrackInQueue = index >= 0 && index < queue.length ? queue[index] : null;
  const currentId = currentTrackInQueue?.id == null ? null : String(currentTrackInQueue.id);
  if (currentTrackInQueue && (targetId !== null ? currentId === targetId : currentTrackInQueue === track)) {
    publish();
    return;
  }
  if (targetId !== null) {
    queue = queue.filter((item) => item?.id == null || String(item.id) !== targetId);
  }
  const currentPosition = currentTrackInQueue
    ? queue.findIndex((item) => item === currentTrackInQueue || (currentId !== null && item?.id != null && String(item.id) === currentId))
    : -1;
  const insertAt = currentPosition >= 0 ? currentPosition + 1 : 0;
  queue.splice(insertAt, 0, track);
  index = currentPosition >= 0 ? currentPosition : 0;
  publish();
}

export function removeQueuedTrack(trackIndex: number) {
  if (trackIndex < 0 || trackIndex >= queue.length || trackIndex === index) return;
  queue.splice(trackIndex, 1);
  if (trackIndex < index) index -= 1;
  publish();
}

export function clearUpcomingTracks() {
  if (index >= 0 && index < queue.length) {
    queue = [queue[index]];
    index = 0;
  } else {
    queue = [];
    index = -1;
  }
  publish();
}

export function moveQueuedTrack(fromIndex: number, toIndex: number) {
  if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length || fromIndex === toIndex) return;
  const [item] = queue.splice(fromIndex, 1);
  queue.splice(toIndex, 0, item);
  if (index === fromIndex) index = toIndex;
  else if (fromIndex < index && toIndex >= index) index -= 1;
  else if (fromIndex > index && toIndex <= index) index += 1;
  publish();
}

export function toggleMusicShuffle() {
  shuffle = !shuffle;
  publish();
  return shuffle;
}

export function cycleMusicRepeat() {
  repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
  publish();
  return repeat;
}

export async function seekMusicTo(position: number): Promise<boolean> {
  const player = sound;
  if (!player || !player.isLoaded) return false;
  try {
    const max = player.duration * 1000 || durationMillis;
    const target = Math.max(0, Math.min(Math.round(position), max || Math.round(position)));
    await player.seekTo(target / 1000);
    if (sound !== player) return false;
    positionMillis = target;
    publish();
    return true;
  } catch {
    return false;
  }
}

export async function playMusicTrack(track: any, options?: { queue?: any[]; index?: number }): Promise<{ ok: boolean; message?: string }> {
  const uri = getAudioUrl(track);
  if (!uri) {
    publish();
    return { ok: false, message: "This track has no playable audio source yet." };
  }

  if (options?.queue) {
    queue = options.queue.filter(Boolean);
    index = Math.max(0, Math.min(options.index ?? 0, Math.max(queue.length - 1, 0)));
  } else if (queue.length === 0) {
    queue = [track];
    index = 0;
  } else {
    const trackId = track?.id == null ? null : String(track.id);
    const existing = queue.findIndex((t) => trackId !== null ? t?.id != null && String(t.id) === trackId : t === track);
    if (existing >= 0) index = existing;
    else {
      queue = [...queue.slice(0, index + 1), track, ...queue.slice(index + 1)];
      index = Math.max(0, index + 1);
    }
  }

  try {
    const sameTrack = currentTrack && (track?.id != null && currentTrack?.id != null
      ? String(currentTrack.id) === String(track.id)
      : currentTrack === track);

    if (sound && sameTrack) {
      const player = sound;
      if (player.isLoaded) {
        if (player.playing) {
          player.pause();
          playing = false;
        } else {
          if (player.duration > 0 && player.currentTime >= player.duration) await player.seekTo(0);
          if (sound !== player) return { ok: false };
          player.play();
          playing = true;
        }
        publish();
        return { ok: true };
      }
      player.remove();
      sound = null;
    }

    if (sound) sound.remove();
    sound = null;
    positionMillis = 0;
    durationMillis = Number(track?.durationMillis) || 0;
    handlingTrackFinish = false;

    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
    });

    const player = createAudioPlayer({ uri }, { updateInterval: 250 });
    sound = player;
    currentTrack = track;
    playing = false;

    player.addListener("playbackStatusUpdate", (status) => {
      if (sound !== player) return;
      playing = status.playing;
      positionMillis = Math.max(0, Math.round(status.currentTime * 1000));
      durationMillis = status.duration ? Math.round(status.duration * 1000) : durationMillis;

      if (status.error) {
        playing = false;
        publish();
        return;
      }

      if (status.didJustFinish && !handlingTrackFinish) {
        handlingTrackFinish = true;
        playing = false;
        if (repeat === "one") {
          void player.seekTo(0).then(() => {
            if (sound !== player) return;
            player.play();
            playing = true;
            positionMillis = 0;
          }).catch(() => {
            playing = false;
          }).finally(() => {
            handlingTrackFinish = false;
            publish();
          });
        } else {
          void playNextInQueue().finally(() => { handlingTrackFinish = false; });
        }
      }
      publish();
    });

    player.play();
    playing = true;
    await addRecentTrack(track).catch(() => {});
    recentHistoryRevision += 1;
    publish();
    return { ok: true };
  } catch {
    if (sound) sound.remove();
    sound = null;
    currentTrack = null;
    playing = false;
    positionMillis = 0;
    durationMillis = 0;
    publish();
    return { ok: false, message: "Playback failed. Check the track's audio URL and try again." };
  }
}

export async function toggleMusicPlayback(): Promise<void> {
  const player = sound;
  if (!player || !player.isLoaded) return;
  try {
    if (player.playing) {
      player.pause();
      playing = false;
    } else {
      if (player.duration > 0 && player.currentTime >= player.duration) await player.seekTo(0);
      if (sound !== player) return;
      player.play();
      playing = true;
    }
    publish();
  } catch {
    playing = false;
    publish();
  }
}

export async function stopMusicPlayback(): Promise<void> {
  if (sound) sound.remove();
  sound = null;
  currentTrack = null;
  playing = false;
  positionMillis = 0;
  durationMillis = 0;
  handlingTrackFinish = false;
  publish();
}

export async function playNextInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (queue.length === 0 || index < 0) return { ok: false, message: "No queue." };
  let candidates: number[] = [];
  if (shuffle && queue.length > 1) {
    candidates = queue.map((_, i) => i).filter((i) => i !== index);
  } else {
    candidates = queue.map((_, i) => i).filter((i) => i > index);
    if (repeat === "all") candidates.push(...queue.map((_, i) => i).filter((i) => i <= index));
  }
  const playable = candidates.filter((i) => !!getAudioUrl(queue[i]));
  const nextIndex = playable.length ? playable[shuffle ? Math.floor(Math.random() * playable.length) : 0] : undefined;
  if (nextIndex === undefined) {
    if (!candidates.length) {
      playing = false;
      publish();
      return { ok: false, message: "End of queue." };
    }
    return { ok: false, message: "No playable audio source is available in the remaining queue." };
  }
  const previousIndex = index;
  index = nextIndex;
  const result = await playMusicTrack(queue[index], { queue, index });
  if (!result.ok) {
    index = previousIndex;
    publish();
  }
  return result;
}

export async function playPreviousInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (queue.length === 0 || index < 0) return { ok: false, message: "No queue." };
  if (positionMillis > 3000) return (await seekMusicTo(0)) ? { ok: true } : { ok: false, message: "Could not restart track." };
  const candidates = queue.map((_, i) => i).filter((i) => i < index).reverse();
  if (repeat === "all") candidates.push(...queue.map((_, i) => i).filter((i) => i >= index).reverse());
  const previous = candidates.find((i) => !!getAudioUrl(queue[i]));
  if (previous === undefined) {
    return { ok: false, message: candidates.length ? "No playable audio source is available earlier in the queue." : "Start of queue." };
  }
  const previousIndex = index;
  index = previous;
  const result = await playMusicTrack(queue[index], { queue, index });
  if (!result.ok) {
    index = previousIndex;
    publish();
  }
  return result;
}

export function getMusicPlayerState(): MusicPlayerState {
  return getState();
}
