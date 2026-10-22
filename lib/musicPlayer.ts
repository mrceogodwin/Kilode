import { Audio, type AVPlaybackStatus } from "expo-av";

type Listener = (track: any | null, playing: boolean) => void;

let sound: Audio.Sound | null = null;
let currentTrack: any | null = null;
let playing = false;
const listeners = new Set<Listener>();

function publish() {
  listeners.forEach((listener) => listener(currentTrack, playing));
}

export function subscribeMusicPlayer(listener: Listener) {
  listeners.add(listener);
  listener(currentTrack, playing);
  return () => listeners.delete(listener);
}

function getAudioUrl(track: any): string | null {
  const value = track?.audioUrl || track?.audio_url || track?.streamUrl || track?.stream_url || track?.previewUrl || track?.preview_url;
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;
}

export async function playMusicTrack(track: any): Promise<{ ok: boolean; message?: string }> {
  const uri = getAudioUrl(track);
  if (!uri) return { ok: false, message: "This track has no playable audio source yet." };
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
          if (status.didJustFinish) playing = false;
          publish();
        } else if (status.error) {
          playing = false;
          publish();
        }
      }
    );
    sound = created.sound;
    currentTrack = track;
    playing = created.status.isLoaded ? created.status.isPlaying : false;
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
