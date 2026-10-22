import { Audio, type AVPlaybackStatus } from "expo-av";
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
};

type Listener = ((state: MusicPlayerState) => void) | ((track: any | null, playing: boolean) => void);

let sound: Audio.Sound | null = null;
let currentTrack: any | null = null;
let playing = false;
let queue: any[] = [];
let index = -1;
let positionMillis = 0;
let durationMillis = 0;
let shuffle = false;
let repeat: RepeatMode = "off";
let handlingTrackFinish = false;
const listeners = new Set<Listener>();

function getState(): MusicPlayerState {
  return { track: currentTrack, playing, queue: [...queue], index, positionMillis, durationMillis, shuffle, repeat };
}

function publish() {
  const state = getState();
  listeners.forEach((listener) => {
    try {
      if (listener.length >= 2) (listener as (track: any | null, playing: boolean) => void)(state.track, state.playing);
      else (listener as (state: MusicPlayerState) => void)(state);
    } catch {
      // Listener failures must not interrupt audio playback.
    }
  });
}

export function subscribeMusicPlayer(listener: Listener) {
  listeners.add(listener);
  try {
    if (listener.length >= 2) (listener as (track: any | null, playing: boolean) => void)(currentTrack, playing);
    else (listener as (state: MusicPlayerState) => void)(getState());
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
    // Tracks without IDs cannot be safely deduplicated; do not collapse them all into "undefined".
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
  const targetId = String(track?.id);
  const currentTrackInQueue = index >= 0 && index < queue.length ? queue[index] : null;
  if (currentTrackInQueue && String(currentTrackInQueue?.id) === targetId) {
    publish();
    return;
  }
  // Re-find the current item after removing duplicate target entries so its index cannot drift.
  queue = queue.filter((item) => String(item?.id) !== targetId);
  index = currentTrackInQueue
    ? queue.findIndex((item) => item === currentTrackInQueue || String(item?.id) === String(currentTrackInQueue?.id))
    : -1;
  const insertAt = index >= 0 ? index + 1 : 0;
  queue.splice(insertAt, 0, track);
  if (index < 0) index = 0;
  publish();
}

export function removeQueuedTrack(trackIndex: number) {
  if (trackIndex < 0 || trackIndex >= queue.length) return;
  // The active sound is not replaced by this operation. Protect its queue entry
  // so the visible current index cannot silently point at a different track.
  if (trackIndex === index) return;
  queue.splice(trackIndex, 1);
  if (trackIndex < index) index -= 1;
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
  if (!sound) return false;
  try {
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return false;
    const max = status.durationMillis || durationMillis;
    await sound.setPositionAsync(Math.max(0, Math.min(Math.round(position), max || Math.round(position))));
    positionMillis = Math.max(0, Math.min(Math.round(position), max || Math.round(position)));
    publish();
    return true;
  } catch {
    return false;
  }
}

export async function playMusicTrack(track: any, options?: { queue?: any[]; index?: number }): Promise<{ ok: boolean; message?: string }> {
  // Reject non-playable entries before changing queue/index state. Otherwise a failed
  // chart/sample tap can silently move the queue away from the track that is playing.
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
    const existing = queue.findIndex((t) => String(t?.id) === String(track?.id));
    if (existing >= 0) index = existing;
    else {
      queue = [...queue.slice(0, index + 1), track, ...queue.slice(index + 1)];
      index = Math.max(0, index + 1);
    }
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
    positionMillis = 0;
    durationMillis = Number(track?.durationMillis) || 0;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    let createdSoundForRepeat: Audio.Sound | null = null;
    const created = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          playing = status.isPlaying;
          positionMillis = status.positionMillis || 0;
          durationMillis = status.durationMillis || durationMillis;
          if (status.didJustFinish && !handlingTrackFinish) {
            handlingTrackFinish = true;
            playing = false;
            if (repeat === "one") {
              // Restart directly; a seek/toggle chain can race repeated finish callbacks.
              void (async () => {
                try {
                  if (createdSoundForRepeat) {
                    await createdSoundForRepeat.setPositionAsync(0);
                    await createdSoundForRepeat.playAsync();
                    playing = true;
                    positionMillis = 0;
                  }
                } catch {
                  playing = false;
                } finally {
                  handlingTrackFinish = false;
                  publish();
                }
              })();
            } else {
              void playNextInQueue().finally(() => { handlingTrackFinish = false; });
            }
          }
          publish();
        } else if (status.error) {
          playing = false;
          publish();
        }
      }
    );

    sound = created.sound;
    createdSoundForRepeat = created.sound;
    handlingTrackFinish = false;
    currentTrack = track;
    playing = created.status.isLoaded ? !!created.status.isPlaying : false;
    positionMillis = created.status.isLoaded ? created.status.positionMillis || 0 : 0;
    durationMillis = created.status.isLoaded ? created.status.durationMillis || 0 : durationMillis;
    void addRecentTrack(track);
    publish();
    return { ok: true };
  } catch {
    // A failed load must not leave the UI claiming that the previous track is
    // active after its sound has already been unloaded.
    try {
      if (sound) await sound.unloadAsync();
    } catch {}
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
    positionMillis = 0;
    durationMillis = 0;
    publish();
  }
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

  // Do not advance the visible queue index onto an entry that cannot play.
  // Search forward for the next playable track, preserving the current index
  // if the remaining queue contains only metadata/sample entries.
  const nextIndex = candidates.find((i) => !!getAudioUrl(queue[i]));
  if (nextIndex === undefined) {
    if (!candidates.length) {
      playing = false;
      publish();
      return { ok: false, message: "End of queue." };
    }
    return { ok: false, message: "No playable audio source is available in the remaining queue." };
  }

  index = nextIndex;
  return playMusicTrack(queue[index], { queue, index });
}

export async function playPreviousInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (queue.length === 0 || index < 0) return { ok: false, message: "No queue." };
  if (positionMillis > 3000) return (await seekMusicTo(0)) ? { ok: true } : { ok: false, message: "Could not restart track." };

  const candidates = queue.map((_, i) => i).filter((i) => i < index).reverse();
  if (repeat === "all") candidates.push(...queue.map((_, i) => i).filter((i) => i >= index).reverse());
  const prevIndex = candidates.find((i) => !!getAudioUrl(queue[i]));
  if (prevIndex === undefined) {
    return { ok: false, message: candidates.length ? "No playable audio source is available earlier in the queue." : "Start of queue." };
  }

  index = prevIndex;
  return playMusicTrack(queue[index], { queue, index });
}

export function getMusicPlayerState(): MusicPlayerState {
  return getState();
}
