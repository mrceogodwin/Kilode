/**
 * Kilode music playback + queue.
 * Only streams when a track has a valid http(s) audio URL.
 */
import { Audio, AVPlaybackStatus } from "expo-av";
import { pushRecentTrack } from "./musicLibrary";

type Listener = (track: any | null, playing: boolean) => void;

let sound: Audio.Sound | null = null;
let currentTrack: any | null = null;
let playing = false;
let queue: any[] = [];
let queueIndex = -1;
const listeners = new Set<Listener>();

function publish() {
  listeners.forEach((fn) => {
    try {
      fn(currentTrack, playing);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

export function subscribeMusicPlayer(fn: Listener): () => void {
  listeners.add(fn);
  fn(currentTrack, playing);
  return () => {
    listeners.delete(fn);
  };
}

export function getMusicQueue(): { queue: any[]; index: number } {
  return { queue: [...queue], index: queueIndex };
}

export function setMusicQueue(tracks: any[], startIndex = 0) {
  queue = Array.isArray(tracks) ? tracks.slice() : [];
  queueIndex = Math.max(0, Math.min(startIndex, queue.length - 1));
}

function getAudioUrl(track: any): string | null {
  const value =
    track?.audioUrl ||
    track?.audio_url ||
    track?.streamUrl ||
    track?.stream_url ||
    track?.previewUrl ||
    track?.preview_url ||
    track?.url;
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;
}

export async function playMusicTrack(track: any): Promise<{ ok: boolean; message?: string }> {
  const uri = getAudioUrl(track);
  if (!uri) {
    try {
      await pushRecentTrack({
        id: String(track?.id ?? track?.title ?? Date.now()),
        title: String(track?.title || "Track"),
        artist: String(track?.artist || track?.artist_name || "Artist"),
        color: track?.color,
      });
    } catch {
      /* ignore */
    }
    currentTrack = track;
    playing = false;
    publish();
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
        } else if ((status as any).error) {
          playing = false;
          publish();
        }
      }
    );
    sound = created.sound;
    currentTrack = track;
    playing = created.status.isLoaded ? !!(created.status as any).isPlaying : false;
    const qi = queue.findIndex((t) => String(t?.id) === String(track?.id));
    if (qi >= 0) queueIndex = qi;
    try {
      await pushRecentTrack({
        id: String(track?.id ?? track?.title ?? Date.now()),
        title: String(track?.title || "Track"),
        artist: String(track?.artist || track?.artist_name || "Artist"),
        color: track?.color,
        audioUrl: uri,
      });
    } catch {
      /* ignore */
    }
    publish();
    return { ok: true };
  } catch {
    playing = false;
    publish();
    return { ok: false, message: "Playback failed. Check the track's audio URL and try again." };
  }
}

export async function playNextInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (!queue.length || queueIndex < 0) return { ok: false, message: "Queue is empty." };
  const next = queueIndex + 1;
  if (next >= queue.length) return { ok: false, message: "End of queue." };
  queueIndex = next;
  return playMusicTrack(queue[queueIndex]);
}

export async function playPreviousInQueue(): Promise<{ ok: boolean; message?: string }> {
  if (!queue.length || queueIndex < 0) return { ok: false, message: "Queue is empty." };
  const prev = queueIndex - 1;
  if (prev < 0) return { ok: false, message: "Start of queue." };
  queueIndex = prev;
  return playMusicTrack(queue[queueIndex]);
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
