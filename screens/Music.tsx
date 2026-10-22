import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { EmptyState } from "../components/ui/EmptyState";
import {
  getSavedTracks,
  getRecentTracks,
  toggleSavedTrack,
  getMusicPlaylists,
  createMusicPlaylist,
  renameMusicPlaylist,
  deleteMusicPlaylist,
  addTrackToMusicPlaylist,
  type MusicPlaylist,
  type LibraryTrack,
} from "../lib/musicLibrary";
import {
  playMusicTrack,
  playNextInQueue,
  playPreviousInQueue,
  toggleMusicPlayback,
  subscribeMusicPlayer,
  seekMusicTo,
  toggleMusicShuffle,
  cycleMusicRepeat,
  addTracksToQueue,
  playTrackNext,
  removeQueuedTrack,
  moveQueuedTrack,
  type MusicPlayerState,
} from "../lib/musicPlayer";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  tracks?: any[];
  tracksSource?: "live" | "mock" | "error";
  openNowPlaying?: boolean;
  onNowPlayingOpened?: () => void;
  onPlay?: (track: any) => Promise<void> | void;
};

const CHARTS = [
  { rank: 1, title: "Ojuelegba Nights", artist: "Simi Sola", plays: "12.4k" },
  { rank: 2, title: "Danfo Dreams", artist: "Kemi Wave", plays: "9.1k" },
  { rank: 3, title: "Eko Energy", artist: "Femi + Liza", plays: "7.8k" },
  { rank: 4, title: "Water & Light", artist: "Ayo Blue", plays: "6.2k" },
  { rank: 5, title: "Island Rain", artist: "Bola Keys", plays: "5.1k" },
];

const ARTISTS = [
  { id: "a1", name: "Simi Sola", meta: "Afrobeats · Lagos", color: "#F97316" },
  { id: "a2", name: "Kemi Wave", meta: "Amapiano · PH", color: "#7C3AED" },
  { id: "a3", name: "Ayo Blue", meta: "R&B · Abuja", color: "#2563EB" },
  { id: "a4", name: "Wizkid", meta: "Afrobeats · Lagos", color: "#16A34A" },
  { id: "a5", name: "Burna Boy", meta: "Afrobeats · PH", color: "#15803D" },
];

const GENRES = ["Afrobeats", "Amapiano", "R&B", "Highlife", "Afro-fusion"];

type Tab = "discover" | "search" | "charts" | "artists" | "library" | "genres" | "queue";

function trackRenderKey(track: any, index: number, prefix = "track") {
  const id = track?.id;
  if (id != null && String(id).trim()) return `${prefix}-${String(id)}`;
  const title = String(track?.title ?? "").trim().toLocaleLowerCase();
  const artist = String(track?.artist ?? "").trim().toLocaleLowerCase();
  return `${prefix}-metadata-${title}-${artist}-${index}`;
}

function sameTrack(a: any, b: any) {
  if (!a || !b) return false;
  if (a.id != null && b.id != null) return String(a.id) === String(b.id);

  // API/library layers can recreate metadata-only track objects. Compare stable
  // metadata rather than object identity so the same track remains selected.
  const titleA = String(a.title ?? "").trim().toLocaleLowerCase();
  const titleB = String(b.title ?? "").trim().toLocaleLowerCase();
  const artistA = String(a.artist ?? "").trim().toLocaleLowerCase();
  const artistB = String(b.artist ?? "").trim().toLocaleLowerCase();
  if (!titleA || !titleB || !artistA || !artistB) return a === b;
  return titleA === titleB && artistA === artistB;
}

function formatTime(ms: number) {
  const seconds = Math.max(0, Math.floor((ms || 0) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MusicScreen({ s, C, onBack, show, tracks: remoteTracks, tracksSource, openNowPlaying, onNowPlayingOpened }: Props) {
  const [tab, setTab] = useState<Tab>("discover");
  const [activeChart, setActiveChart] = useState<"50" | "100">("50");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTrack, setActiveTrack] = useState<any | null>(null);
  const [activeArtist, setActiveArtist] = useState<any | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [saved, setSaved] = useState<LibraryTrack[]>([]);
  const [recent, setRecent] = useState<LibraryTrack[]>([]);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [player, setPlayer] = useState<MusicPlayerState>({ track: null, playing: false, queue: [], index: -1, positionMillis: 0, durationMillis: 0, shuffle: false, repeat: "off" });

  const hasLiveTracks = tracksSource === "live";
  const tracks = hasLiveTracks ? remoteTracks || [] : TRACKS || [];
  const usingPreviewCatalogue = !hasLiveTracks;

  const refreshLibrary = useCallback(async () => {
    const [sList, rList, pList] = await Promise.all([getSavedTracks(), getRecentTracks(), getMusicPlaylists()]);
    setSaved(sList);
    setRecent(rList);
    setPlaylists(pList);
  }, []);

  useEffect(() => {
    void refreshLibrary();
    const unsub = subscribeMusicPlayer((state: MusicPlayerState) => setPlayer(state));
    return () => {
      unsub();
    };
  }, [refreshLibrary]);

  useEffect(() => {
    if (openNowPlaying && player.track) {
      setActiveTrack(player.track);
      onNowPlayingOpened?.();
    }
  }, [openNowPlaying, player.track, onNowPlayingOpened]);

  useEffect(() => {
    // Keep the open track detail in step with next/previous and auto-advance from the shared player.
    if (activeTrack && player.track && !sameTrack(activeTrack, player.track)) {
      setActiveTrack(player.track);
    }
  }, [activeTrack, player.track]);

  const isSaved = (track: any) => saved.some((t) => sameTrack(t, track));

  const playQueue = async (list: any[], startIndex: number) => {
    const track = list[startIndex];
    if (!track) return;
    const result = await playMusicTrack(track, { queue: list, index: startIndex });
    if (!result.ok) show(result.message || "Playback unavailable.");
    else {
      setActiveTrack(track);
      void refreshLibrary();
    }
  };

  const selectTrack = (t: any) => {
    setActiveArtist(null);
    setActiveGenre(null);
    setActiveTrack(t);
  };

  const onToggleSave = async (track: any) => {
    try {
      const { saved: nowSaved } = await toggleSavedTrack(track);
      await refreshLibrary();
      show(nowSaved ? `Saved · ${track.title}` : `Removed · ${track.title}`);
    } catch (error: any) {
      show(error?.message || "Couldn't update your music library. Please try again.");
    }
  };

  // ——— Track detail ———
  if (activeTrack) {
    const queue = player.queue.length ? player.queue : tracks;
    const isCurrentPlayerTrack = sameTrack(player.track, activeTrack);
    const activeQueueIndex = player.queue.findIndex((t: any) => sameTrack(t, activeTrack));
    const queueIndex = isCurrentPlayerTrack ? player.index : activeQueueIndex;
    const canPrev = isCurrentPlayerTrack && player.index >= 0 && player.queue.length > 0;
    const canNext = isCurrentPlayerTrack && player.index >= 0 && player.index < player.queue.length - 1;
    const upNextStart = queueIndex >= 0 ? queueIndex + 1 : 0;
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveTrack(null)} style={{ marginBottom: 12 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>
          <View
            style={{
              height: 220,
              borderRadius: 20,
              backgroundColor: activeTrack.color || C.elevated,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="musical-notes" size={56} color="#fff" />
          </View>
          <Text style={s.h1}>{activeTrack.title}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>{activeTrack.artist || "Kilode artist"}</Text>
          {activeTrack.genre ? (
            <Text style={[s.meta, { marginTop: 8 }]}>{activeTrack.genre}</Text>
          ) : null}
          <Text style={[s.meta, { marginTop: 14 }]}>
            {usingPreviewCatalogue
              ? "Preview catalogue · sample audio for offline playback"
              : "Track details · connected catalogue"}
          </Text>

          {isCurrentPlayerTrack ? (
            <View style={{ marginTop: 22 }}>
              <View style={{ height: 4, borderRadius: 3, backgroundColor: C.border || "#2A2A30", overflow: "hidden" }}>
                <View style={{ height: 4, width: `${Math.min(100, player.durationMillis ? (player.positionMillis / player.durationMillis) * 100 : 0)}%`, backgroundColor: C.accent, borderRadius: 3 }} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
                <Text style={s.meta}>{formatTime(player.positionMillis)}</Text>
                <Text style={s.meta}>{formatTime(player.durationMillis)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 8 }}>
                <TouchableOpacity onPress={() => { void seekMusicTo(Math.max(0, player.positionMillis - 15000)); }} accessibilityRole="button" accessibilityLabel="Rewind 15 seconds" style={s.chip}>
                  <Text style={s.chipText}>↶ 15s</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { void seekMusicTo(Math.min(player.durationMillis || player.positionMillis + 15000, player.positionMillis + 15000)); }} accessibilityRole="button" accessibilityLabel="Forward 15 seconds" style={s.chip}>
                  <Text style={s.chipText}>15s ↷</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {playlists.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              <Text style={s.sectionTitle}>Add to playlist</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
                {playlists.map((playlist) => (
                  <TouchableOpacity key={playlist.id} style={s.chip} onPress={async () => {
                    try {
                      setPlaylists(await addTrackToMusicPlaylist(playlist.id, activeTrack));
                      show("Added to " + playlist.name);
                    } catch (e: any) { show(e?.message || "Could not add track."); }
                  }} accessibilityRole="button" accessibilityLabel={"Add to " + playlist.name}>
                    <Ionicons name="add" size={15} color={C.accent} />
                    <Text style={[s.chipText, { marginLeft: 5 }]}>{playlist.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
            <TouchableOpacity onPress={() => toggleMusicShuffle()} accessibilityRole="button" accessibilityLabel="Toggle shuffle" style={[s.chip, player.shuffle && s.chipOn]}>
              <Ionicons name="shuffle" size={16} color={player.shuffle ? C.accent : C.text2} />
              <Text style={[s.chipText, player.shuffle && s.chipTextOn, { marginLeft: 5 }]}>Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => cycleMusicRepeat()} accessibilityRole="button" accessibilityLabel="Change repeat mode" style={[s.chip, player.repeat !== "off" && s.chipOn]}>
              <Ionicons name="repeat" size={16} color={player.repeat !== "off" ? C.accent : C.text2} />
              <Text style={[s.chipText, player.repeat !== "off" && s.chipTextOn, { marginLeft: 5 }]}>{player.repeat === "one" ? "Repeat one" : player.repeat === "all" ? "Repeat all" : "Repeat off"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addTracksToQueue([activeTrack])} accessibilityRole="button" accessibilityLabel="Add track to queue" style={s.chip}>
              <Ionicons name="add" size={16} color={C.text2} />
              <Text style={[s.chipText, { marginLeft: 4 }]}>Queue</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 20 }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Previous track"
              disabled={!canPrev}
              onPress={async () => {
                const r = await playPreviousInQueue();
                if (!r.ok && r.message) show(r.message);
              }}
              style={{ opacity: canPrev ? 1 : 0.35 }}
            >
              <Ionicons name="play-skip-back" size={28} color={C.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.primaryBtn, { paddingHorizontal: 28, minWidth: 120, justifyContent: "center" }]}
              onPress={async () => {
                if (sameTrack(player.track, activeTrack)) {
                  await toggleMusicPlayback();
                  return;
                }
                const idx = tracks.findIndex((x: any) => sameTrack(x, activeTrack));
                if (idx >= 0) await playQueue(tracks, idx);
                else await playQueue([activeTrack], 0);
              }}
            >
              <Ionicons
                name={player.playing && sameTrack(player.track, activeTrack) ? "pause" : "play"}
                size={20}
                color="#fff"
              />
              <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>
                {player.playing && sameTrack(player.track, activeTrack) ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Next track"
              disabled={!canNext}
              onPress={async () => {
                const r = await playNextInQueue();
                if (!r.ok && r.message) show(r.message);
              }}
              style={{ opacity: canNext ? 1 : 0.35 }}
            >
              <Ionicons name="play-skip-forward" size={28} color={C.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.roomRow, { marginTop: 24 }]}
            onPress={() => onToggleSave(activeTrack)}
            accessibilityRole="button"
          >
            <Ionicons
              name={isSaved(activeTrack) ? "heart" : "heart-outline"}
              size={22}
              color={isSaved(activeTrack) ? C.danger : C.accent}
            />
            <Text style={[s.roomName, { marginLeft: 12 }]}>
              {isSaved(activeTrack) ? "Saved to Library" : "Save to Library"}
            </Text>
          </TouchableOpacity>

          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Up next</Text>
            <Text style={s.meta}>{queue.length} tracks</Text>
          </View>
          {queue.length ? queue.slice(upNextStart, upNextStart + 6).map((t: any, i: number) => (
            <TouchableOpacity
              key={trackRenderKey(t, upNextStart + i, "up-next")}
              style={s.roomRow}
              onPress={() => playQueue(queue, upNextStart + i)}
              accessibilityRole="button"
              accessibilityLabel={"Play next " + t.title}
            >
              <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-note" size={18} color="#FFFFFF" />
              </View>
              <View style={[s.flex, { marginLeft: 12 }]}>
                <Text style={s.roomName} numberOfLines={1}>{t.title}</Text>
                <Text style={s.meta} numberOfLines={1}>{t.artist || "Kilode artist"}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={23} color={C.accent} />
            </TouchableOpacity>
          )) : (
            <Text style={[s.sub, { marginTop: 4 }]}>Start a track to build your listening queue.</Text>
          )}
          <Text style={[s.meta, { marginTop: 16 }]}>
            {usingPreviewCatalogue ? "Preview catalogue · sample tracks, not a live catalogue." : "Live catalogue · playback requires a valid audio stream URL."}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // ——— Artist detail ———
  if (activeArtist) {
    const artistTracks = tracks.filter(
      (t: any) => String(t.artist || "").toLowerCase() === String(activeArtist.name).toLowerCase()
    );
    const pinnedTracks = artistTracks.slice(0, 3);
    const profileTracks = artistTracks.length ? artistTracks : tracks.slice(0, 5);
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveArtist(null)} style={{ marginBottom: 14 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>

          <View style={{
            minHeight: 220, borderRadius: 24, padding: 20, overflow: "hidden",
            backgroundColor: activeArtist.color || "#5B21B6", justifyContent: "flex-end",
            borderWidth: 1, borderColor: "rgba(255,255,255,0.14)",
          }}>
            <View style={{ position: "absolute", right: -24, top: -35, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.12)" }} />
            <View style={{ position: "absolute", right: 26, top: 24, width: 92, height: 92, borderRadius: 46, backgroundColor: "rgba(0,0,0,0.18)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-notes" size={38} color="#fff" />
            </View>
            <Text style={{ color: "#F5D778", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 8 }}>KILODE ARTIST</Text>
            <Text style={{ color: "#fff", fontSize: 30, lineHeight: 36, fontWeight: "800" }}>{activeArtist.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 13, marginTop: 5 }}>{activeArtist.meta}</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 10 }}>{artistTracks.length} tracks in catalogue</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => profileTracks.length ? playQueue(profileTracks, 0) : show("No playable tracks are available yet.")}
              style={{ flex: 1, minHeight: 46, borderRadius: 24, backgroundColor: C.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }}
              accessibilityRole="button"
            >
              <Ionicons name="play" size={18} color="#171717" />
              <Text style={{ color: "#171717", fontWeight: "800", marginLeft: 8 }}>Play artist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => show("Artist following will be available when artist accounts are connected.")}
              style={{ flex: 1, minHeight: 46, borderRadius: 24, borderWidth: 1, borderColor: C.border || "#2A2A30", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }}
              accessibilityRole="button"
            >
              <Ionicons name="person-add-outline" size={17} color={C.text} />
              <Text style={{ color: C.text, fontWeight: "700", marginLeft: 7 }}>Follow</Text>
            </TouchableOpacity>
          </View>

          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Pinned tracks</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
            {(pinnedTracks.length ? pinnedTracks : profileTracks.slice(0, 3)).map((t: any, i: number) => (
              <TouchableOpacity
                key={trackRenderKey(t, i, "pinned")}
                style={[s.trackCard, { width: 136, height: 154, backgroundColor: t.color || [ "#7C3AED", "#B45309", "#BE185D" ][i % 3] }]}
                onPress={() => selectTrack(t)}
                onLongPress={() => playQueue(profileTracks, Math.max(0, profileTracks.findIndex((x: any) => sameTrack(x, t))))}
                accessibilityRole="button"
              >
                <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Ionicons name="musical-notes" size={24} color="#fff" />
                </View>
                <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={s.trackArtist} numberOfLines={1}>{activeArtist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Top songs</Text>
          </View>
          {profileTracks.slice(0, 5).map((t: any, i: number) => (
            <TouchableOpacity key={trackRenderKey(t, i, "artist-track")} style={s.roomRow} onPress={() => selectTrack(t)} onLongPress={() => playQueue(profileTracks, i)} accessibilityRole="button">
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: t.color || activeArtist.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-note" size={20} color="#fff" />
              </View>
              <View style={[s.flex, { marginLeft: 12 }]}>
                <Text style={s.roomName} numberOfLines={1}>{t.title}</Text>
                <Text style={s.meta} numberOfLines={1}>{activeArtist.name}{t.genre ? " · " + t.genre : ""}</Text>
              </View>
              <TouchableOpacity onPress={() => onToggleSave(t)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel={isSaved(t.id) ? "Remove saved track" : "Save track"}>
                <Ionicons name={isSaved(t.id) ? "heart" : "heart-outline"} size={20} color={isSaved(t.id) ? C.danger : C.text3} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectTrack(t)} style={{ marginLeft: 14 }} accessibilityRole="button" accessibilityLabel={"Open " + t.title}>
                <Ionicons name="ellipsis-horizontal" size={20} color={C.text3} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Albums & releases</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
            {profileTracks.slice(0, 4).map((t: any, i: number) => (
              <TouchableOpacity key={trackRenderKey(t, i, "release")} style={{ width: 142 }} onPress={() => selectTrack(t)} accessibilityRole="button">
                <View style={{ height: 142, borderRadius: 16, backgroundColor: t.color || activeArtist.color || C.elevated, alignItems: "center", justifyContent: "center", marginBottom: 9 }}>
                  <Ionicons name={i % 2 ? "disc-outline" : "albums-outline"} size={42} color="#fff" />
                </View>
                <Text style={s.roomName} numberOfLines={1}>{t.title}</Text>
                <Text style={s.meta} numberOfLines={1}>Single · {activeArtist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[s.meta, { marginTop: 18, marginBottom: 20 }]}>
            Artist profiles, follows and release artwork will connect to verified artist data as the Kilode Music API is completed.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // ——— Genre detail ———
  if (activeGenre) {
    const genreTracks = tracks.filter(
      (t: any) => String(t.genre || "").toLowerCase() === activeGenre.toLowerCase()
    );
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveGenre(null)} style={{ marginBottom: 12 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>
          <Text style={s.h1}>{activeGenre}</Text>
          <Text style={s.sub}>{genreTracks.length} tracks in catalogue</Text>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Tracks</Text>
          </View>
          {genreTracks.length ? (
            genreTracks.map((t: any, i: number) => (
              <TouchableOpacity key={trackRenderKey(t, i, "genre")} style={s.roomRow} onPress={() => selectTrack(t)} onLongPress={() => playQueue(genreTracks, i)}>
                <View style={[s.roomAv, { backgroundColor: t.color || C.accent }]}>
                  <Ionicons name="musical-note" size={16} color="#fff" />
                </View>
                <View style={[s.flex, { marginLeft: 12 }]}>
                  <Text style={s.roomName}>{t.title}</Text>
                  <Text style={s.meta}>{t.artist}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.text3} />
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState
              title="No tracks in this genre"
              body="Catalogue will grow when more releases land."
              textColor={C.text}
              mutedColor={C.text2}
              accentColor={C.accent}
              icon="disc-outline"
            />
          )}
        </View>
      </ScrollView>
    );
  }

  // ——— Main tabs ———
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }} accessibilityRole="button">
          <Text style={s.link}>‹ Home</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: C.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="musical-notes" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h1}>Music</Text>
            <Text style={s.sub}>
              {usingPreviewCatalogue ? "Drops · charts · library · sample audio" : "Live catalogue"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {(["discover", "search", "charts", "artists", "library", "genres", "queue"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextOn]}>
              {t === "discover"
                ? "Discover"
                : t === "search"
                  ? "Search"
                  : t === "charts"
                    ? "Charts"
                    : t === "artists"
                      ? "Artists"
                      : t === "library"
                        ? "Library"
                        : t === "genres"
                          ? "Genres"
                          : "Queue"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === "search" && (
        <>
          <View style={[s.padH, { marginTop: 8, marginBottom: 8 }]}>
            <View style={{ minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: C.border || "#2A2A30", backgroundColor: C.elevated || "#18181C", flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }}>
              <Ionicons name="search" size={19} color={C.text3 || "#9A9A9E"} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Songs, artists, genres"
                placeholderTextColor={C.text3 || "#9A9A9E"}
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Search Kilode Music"
                style={{ flex: 1, color: C.text || "#FFFFFF", paddingVertical: 12, paddingHorizontal: 10, fontSize: 15 }}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery("")} accessibilityRole="button" accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={20} color={C.text3 || "#9A9A9E"} />
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={[s.meta, { marginTop: 10 }]}>
              {hasLiveTracks ? "Searching the connected catalogue" : "Preview catalogue · results are sample data"}
            </Text>
          </View>
          {(() => {
            const q = searchQuery.trim().toLowerCase();
            const results = q ? tracks.filter((t: any) => [t.title, t.artist, t.genre, t.album].some((v) => String(v || "").toLowerCase().includes(q))) : [];
            const artistResults = q ? ARTISTS.filter((a) => [a.name, a.meta].some((v) => String(v || "").toLowerCase().includes(q))) : [];
            const genreResults = q ? GENRES.filter((g) => g.toLowerCase().includes(q)) : [];
            if (!q) return (
              <View style={s.padH}>
                <View style={s.sectionHead}><Text style={s.sectionTitle}>Explore Kilode Music</Text></View>
                <Text style={s.sub}>Search songs, artists and genres to find your next sound.</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                  {GENRES.map((g) => (
                    <TouchableOpacity key={g} onPress={() => { setSearchQuery(g); }} style={[s.chip, { marginBottom: 4 }]} accessibilityRole="button">
                      <Text style={s.chipText}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
            if (!results.length && !artistResults.length && !genreResults.length) return (
              <View style={s.padH}>
                <EmptyState title="No matches yet" body="Try another song, artist or genre." textColor={C.text} mutedColor={C.text2} accentColor={C.accent} icon="search-outline" />
              </View>
            );
            return (
              <>
                {artistResults.map((a) => (
                  <TouchableOpacity key={"artist-" + a.id} style={[s.roomRow, s.padH]} onPress={() => setActiveArtist(a)} accessibilityRole="button" accessibilityLabel={"Open artist " + a.name}>
                    <View style={[s.roomAv, { backgroundColor: a.color, width: 46, height: 46, borderRadius: 23 }]}>
                      <Text style={[s.roomAvText, { color: "#fff" }]}>{a.name.slice(0, 1)}</Text>
                    </View>
                    <View style={[s.flex, { marginLeft: 12 }]}>
                      <Text style={s.roomName}>{a.name}</Text>
                      <Text style={s.meta}>{a.meta} · Artist</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.text3} />
                  </TouchableOpacity>
                ))}
                {genreResults.map((g) => (
                  <TouchableOpacity key={"genre-" + g} style={[s.roomRow, s.padH]} onPress={() => setActiveGenre(g)} accessibilityRole="button" accessibilityLabel={"Browse " + g}>
                    <View style={[s.roomAv, { backgroundColor: C.elevated }]}>
                      <Ionicons name="disc-outline" size={19} color={C.accent} />
                    </View>
                    <View style={[s.flex, { marginLeft: 12 }]}>
                      <Text style={s.roomName}>{g}</Text>
                      <Text style={s.meta}>Genre · {tracks.filter((t: any) => String(t.genre || "").toLowerCase() === g.toLowerCase()).length} tracks</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.text3} />
                  </TouchableOpacity>
                ))}
                {results.map((t: any, i: number) => (
              <TouchableOpacity key={trackRenderKey(t, i, "search")} style={[s.roomRow, s.padH]} onPress={() => selectTrack(t)} onLongPress={() => playQueue(results, i)} accessibilityRole="button">
                <View style={{ width: 46, height: 46, borderRadius: 11, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="musical-note" size={20} color="#FFFFFF" />
                </View>
                <View style={[s.flex, { marginLeft: 12 }]}>
                  <Text style={s.roomName} numberOfLines={1}>{t.title}</Text>
                  <Text style={s.meta} numberOfLines={1}>{t.artist}{t.genre ? " · " + t.genre : ""}</Text>
                </View>
                <TouchableOpacity onPress={() => onToggleSave(t)} accessibilityRole="button" accessibilityLabel={isSaved(t.id) ? "Remove saved track" : "Save track"}>
                  <Ionicons name={isSaved(t.id) ? "heart" : "heart-outline"} size={20} color={isSaved(t.id) ? C.danger : C.text3} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => playQueue(results, i)} style={{ marginLeft: 14 }} accessibilityRole="button" accessibilityLabel={"Play " + t.title}>
                  <Ionicons name="play-circle" size={26} color={C.accent} />
                </TouchableOpacity>
              </TouchableOpacity>
                ))}
              </>
            );
          })()}
        </>
      )}

      {tab === "discover" && (
        <>
          <View style={[s.padH, { marginTop: 14 }]}>
            <View style={{ minHeight: 174, borderRadius: 22, overflow: "hidden", padding: 18, justifyContent: "space-between", backgroundColor: "#211B16", borderWidth: 1, borderColor: "#51402A" }}>
              <View style={{ position: "absolute", right: -20, top: -35, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(212,175,55,0.16)" }} />
              <View style={{ position: "absolute", right: 20, top: 24, width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: "rgba(229,193,88,0.35)", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-14deg" }] }}>
                <Ionicons name="musical-notes" size={42} color="#E5C158" />
              </View>
              <View>
                <Text style={{ color: "#E5C158", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 }}>KILODE MUSIC</Text>
                <Text style={{ color: "#FFFFFF", fontSize: 25, lineHeight: 30, fontWeight: "800", maxWidth: "68%", marginTop: 8 }}>Your next sound starts here.</Text>
                <Text style={{ color: "#BDB5A8", fontSize: 12, marginTop: 7, maxWidth: "65%" }}>Discover African music, new voices and fresh releases.</Text>
              </View>
              <TouchableOpacity onPress={() => { setTab("charts"); }} accessibilityRole="button" style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: "#E5C158", marginTop: 14 }}>
                <Text style={{ color: "#17130B", fontSize: 12, fontWeight: "800" }}>Explore charts</Text>
                <Ionicons name="arrow-forward" size={14} color="#17130B" style={{ marginLeft: 7 }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Find your sound</Text>
            <TouchableOpacity onPress={() => setTab("genres")} accessibilityRole="button"><Text style={s.link}>All genres</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {GENRES.map((g, i) => (
              <TouchableOpacity key={g} onPress={() => setActiveGenre(g)} accessibilityRole="button" style={{ paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: ["#292018", "#211D30", "#18272A", "#30221A", "#2B1D27"][i % 5], borderWidth: 1, borderColor: C.border || "#2A2A30" }}>
                <Text style={{ color: C.text || "#FFFFFF", fontSize: 12, fontWeight: "700" }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {recent.length > 0 ? (
            <>
              <View style={s.sectionHead}>
                <Text style={s.sectionTitle}>Recently played</Text>
                <TouchableOpacity onPress={() => setTab("library")} accessibilityRole="button"><Text style={s.link}>Your library</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
                {recent.slice(0, 8).map((t: any, i: number) => (
                  <TouchableOpacity key={trackRenderKey(t, i, "recent-card")} style={{ width: 126 }} onPress={() => selectTrack(t)} onLongPress={() => playQueue(recent, i)} accessibilityRole="button" accessibilityLabel={"Open recently played " + t.title}>
                    <View style={{ height: 88, borderRadius: 14, backgroundColor: t.color || ["#362449", "#45331B", "#243A42"][i % 3], alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border || "#2A2A30" }}>
                      <Ionicons name="musical-notes" size={27} color="#FFFFFF" />
                    </View>
                    <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={s.trackArtist} numberOfLines={1}>{t.artist || "Kilode artist"}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>New drops</Text>
            <TouchableOpacity onPress={() => setTab("search")} accessibilityRole="button"><Text style={s.link}>Find music</Text></TouchableOpacity>
          </View>
          {tracks.length === 0 ? (
            <EmptyState
              title="No tracks yet"
              body="Catalogue will appear when the music API is live."
              textColor={C.text}
              mutedColor={C.text2}
              accentColor={C.accent}
              icon="musical-notes-outline"
            />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
              {tracks.map((t: any, i: number) => (
                <TouchableOpacity
                  key={trackRenderKey(t, i, "new-drop")}
                  style={[s.trackCard, { backgroundColor: t.color || C.accent }]}
                  onPress={() => selectTrack(t)}
                  onLongPress={() => playQueue(tracks, i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${t.title}`}
                >
                  <Ionicons name="play" size={18} color="#fff" style={{ marginBottom: 6 }} />
                  <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Text style={[s.meta, s.padH, { marginTop: 12 }]}>
            {usingPreviewCatalogue ? "Preview catalogue · sample tracks, not live chart rankings." : "Connected catalogue · chart rankings depend on verified play data."}
          </Text>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Kilode Top 50</Text>
            <TouchableOpacity onPress={() => setTab("charts")} accessibilityRole="button"><Text style={s.link}>View chart</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setTab("charts")} accessibilityRole="button" style={[s.padH, { marginTop: 2 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, backgroundColor: C.elevated || "#18181C", borderWidth: 1, borderColor: C.border || "#2A2A30" }}>
              <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: "#3A2D13", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="trending-up" size={25} color="#E5C158" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: C.text || "#FFFFFF", fontWeight: "800", fontSize: 14 }}>The sounds moving now</Text>
                <Text style={{ color: C.text3 || "#9A9A9E", fontSize: 11, marginTop: 4 }}>Rankings will be labelled sample until real play data is connected.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.text3 || "#9A9A9E"} />
            </View>
          </TouchableOpacity>
        </>
      )}

      {tab === "charts" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Kilode Top {activeChart}</Text>
          </View>
          <View style={[s.padH, { flexDirection: "row", gap: 8, marginBottom: 12 }]}>
            {(["50", "100"] as const).map((chartSize) => {
              const selected = activeChart === chartSize;
              return (
                <TouchableOpacity
                  key={chartSize}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Show Kilode Top ${chartSize}`}
                  onPress={() => setActiveChart(chartSize)}
                  style={{
                    flex: 1,
                    minHeight: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selected ? (C.accent || "#D4AF37") : (C.border || "#2A2A30"),
                    backgroundColor: selected ? (C.accentSoft || "#332A16") : (C.elevated || "#18181C"),
                  }}
                >
                  <Text style={{ color: selected ? (C.accent || "#E5C158") : (C.text2 || "#9A9A9E"), fontWeight: "800" }}>Top {chartSize}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[s.meta, s.padH, { marginBottom: 12 }]}>
            {usingPreviewCatalogue
              ? "Preview only: 5 illustrative entries are shown, not a complete Top 50/Top 100 chart. Rankings and play counts are not live."
              : `Top ${activeChart} selected. Verified chart rankings must come from the connected chart-data service; these five entries remain illustrative until that feed is available.`}
          </Text>
          {CHARTS.map((c) => {
            // Match both fields so a shared artist name never opens the wrong track.
            const match = tracks.find(
              (t: any) =>
                String(t.title ?? "").trim().toLowerCase() === c.title.toLowerCase() &&
                String(t.artist ?? "").trim().toLowerCase() === c.artist.toLowerCase()
            );
            return (
              <TouchableOpacity
                key={c.rank}
                style={s.roomRow}
                accessibilityRole="button"
                accessibilityLabel={match ? `Open ${c.title}` : `${c.title}, illustrative chart entry only`}
                onPress={() => {
                  if (match) selectTrack(match);
                  else show("Illustrative chart entry only. This track is not in the connected catalogue yet.");
                }}
              >
                <Text style={[s.roomName, { width: 28, color: C.accent }]}>{c.rank}</Text>
                <View style={s.flex}>
                  <Text style={s.roomName}>{c.title}</Text>
                  <Text style={s.meta}>{c.artist} · Sample entry</Text>
                </View>
                <Ionicons name={match ? "play-circle-outline" : "information-circle-outline"} size={28} color={C.accent} />
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {tab === "artists" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Featured artists</Text>
          </View>
          {ARTISTS.map((a) => (
            <TouchableOpacity key={a.id} style={s.roomRow} onPress={() => setActiveArtist(a)}>
              <View style={[s.roomAv, { backgroundColor: a.color, width: 48, height: 48, borderRadius: 24 }]}>
                <Text style={[s.roomAvText, { color: "#fff" }]}>{a.name.slice(0, 1)}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.roomName}>{a.name}</Text>
                <Text style={s.meta}>{a.meta}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.text3} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {tab === "library" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Playlists</Text>
            <Text style={s.meta}>{playlists.length}</Text>
          </View>
          <View style={[s.padH, { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }]}>
            <TextInput value={playlistName} onChangeText={setPlaylistName} placeholder={editingPlaylistId ? "Rename playlist…" : "New playlist name"} placeholderTextColor={C.text3} maxLength={48} accessibilityLabel="Playlist name" style={{ flex: 1, minHeight: 42, borderRadius: 12, paddingHorizontal: 12, color: C.text, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }} returnKeyType="done" />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={editingPlaylistId ? "Save playlist name" : "Create playlist"} onPress={async () => {
              try {
                if (editingPlaylistId) { setPlaylists(await renameMusicPlaylist(editingPlaylistId, playlistName)); show("Playlist renamed."); }
                else { setPlaylists(await createMusicPlaylist(playlistName)); show("Playlist created."); }
                setPlaylistName(""); setEditingPlaylistId(null);
              } catch (e: any) { show(e?.message || "Could not save playlist."); }
            }} style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.accent }}>
              <Ionicons name={editingPlaylistId ? "checkmark" : "add"} size={21} color="#17130B" />
            </TouchableOpacity>
          </View>
          {playlists.length === 0 ? (
            <Text style={[s.sub, s.padH, { marginBottom: 16 }]}>Create a playlist to organise tracks on this device.</Text>
          ) : playlists.map((p) => (
            <View key={p.id} style={[s.roomRow, { alignItems: "center" }]}>
              <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-notes" size={19} color={C.accent} />
              </View>
              <View style={[s.flex, { marginLeft: 12 }]}>
                <Text style={s.roomName}>{p.name}</Text>
                <Text style={s.meta}>{p.tracks.length} tracks · stored on this device</Text>
              </View>
              <TouchableOpacity onPress={() => { setEditingPlaylistId(p.id); setPlaylistName(p.name); }} accessibilityRole="button" accessibilityLabel={"Rename " + p.name} style={{ padding: 6 }}>
                <Ionicons name="pencil-outline" size={17} color={C.text2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { setPlaylists(await deleteMusicPlaylist(p.id)); show("Playlist deleted."); }} accessibilityRole="button" accessibilityLabel={"Delete " + p.name} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={17} color={C.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Saved</Text>
          </View>
          {saved.length === 0 ? (
            <Text style={[s.sub, s.padH, { marginBottom: 16 }]}>
              Heart any track to save it here. Saved tracks stay on this device.
            </Text>
          ) : (
            saved.map((t, i) => (
              <TouchableOpacity key={trackRenderKey(t, i, "saved")} style={s.roomRow} onPress={() => selectTrack(t)}>
                <Ionicons name="heart" size={18} color={C.danger} />
                <View style={[s.flex, { marginLeft: 12 }]}>
                  <Text style={s.roomName}>{t.title}</Text>
                  <Text style={s.meta}>{t.artist}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.text3} />
              </TouchableOpacity>
            ))
          )}

          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Recently played</Text>
          </View>
          {recent.length === 0 ? (
            <Text style={[s.sub, s.padH]}>Play a track and it will show up here.</Text>
          ) : (
            recent.map((t, i) => (
              <TouchableOpacity key={trackRenderKey(t, i, "recent-row")} style={s.roomRow} onPress={() => selectTrack(t)}>
                <Ionicons name="time-outline" size={18} color={C.accent} />
                <View style={[s.flex, { marginLeft: 12 }]}>
                  <Text style={s.roomName}>{t.title}</Text>
                  <Text style={s.meta}>{t.artist}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.text3} />
              </TouchableOpacity>
            ))
          )}
        </>
      )}

      {tab === "queue" && (
        <>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>Up next</Text>
              <Text style={s.meta}>{player.queue.length} tracks · {player.track?.title ? "Playing " + player.track.title : "Nothing playing"}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                onPress={() => toggleMusicShuffle()}
                accessibilityRole="button"
                accessibilityLabel="Toggle queue shuffle"
                style={[s.chip, player.shuffle && s.chipOn, { paddingHorizontal: 10 }]}
              >
                <Ionicons name="shuffle" size={16} color={player.shuffle ? C.accent : C.text2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => cycleMusicRepeat()}
                accessibilityRole="button"
                accessibilityLabel="Change queue repeat mode"
                style={[s.chip, player.repeat !== "off" && s.chipOn, { paddingHorizontal: 10 }]}
              >
                <Ionicons name={player.repeat === "one" ? "repeat" : "repeat"} size={16} color={player.repeat !== "off" ? C.accent : C.text2} />
                {player.repeat === "one" ? <Text style={[s.chipText, { marginLeft: 3 }]}>1</Text> : null}
              </TouchableOpacity>
            </View>
          </View>
          {player.queue.length ? player.queue.map((t: any, i: number) => (
            <View key={trackRenderKey(t, i, "queue-tab")} style={[s.roomRow, { alignItems: "center" }]}>
              <TouchableOpacity onPress={() => { void playQueue(player.queue, i); }} style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }} accessibilityRole="button" accessibilityLabel={"Play " + t.title}>
                <Ionicons name={i === player.index && player.playing ? "volume-high" : "play"} size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={[s.flex, { marginLeft: 12 }]}>
                <Text style={s.roomName} numberOfLines={1}>{t.title}</Text>
                <Text style={s.meta} numberOfLines={1}>{t.artist || "Kilode artist"}{i === player.index ? " · Now playing" : ""}</Text>
              </View>
              <TouchableOpacity onPress={() => playTrackNext(t)} accessibilityRole="button" accessibilityLabel={"Play " + t.title + " next"} style={{ padding: 5 }}>
                <Ionicons name="arrow-up" size={17} color={C.text2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveQueuedTrack(i, Math.max(0, i - 1))} disabled={i === 0} accessibilityRole="button" accessibilityLabel={"Move " + t.title + " up"} style={{ padding: 5, opacity: i === 0 ? 0.3 : 1 }}>
                <Ionicons name="chevron-up" size={17} color={C.text2} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeQueuedTrack(i)} disabled={i === player.index} accessibilityRole="button" accessibilityLabel={"Remove " + t.title + " from queue"} style={{ padding: 5, opacity: i === player.index ? 0.3 : 1 }}>
                <Ionicons name="close" size={18} color={C.text2} />
              </TouchableOpacity>
            </View>
          )) : (
            <EmptyState title="Your queue is empty" body="Choose a track and add it to your listening queue." textColor={C.text} mutedColor={C.text2} accentColor={C.accent} icon="list-outline" />
          )}
          <View style={s.padH}>
            <TouchableOpacity onPress={() => addTracksToQueue(tracks)} style={[s.primaryBtn, { marginTop: 14 }]} accessibilityRole="button">
              <Ionicons name="list" size={17} color="#17130B" />
              <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>Add catalogue to queue</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {tab === "genres" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Browse by genre</Text>
          </View>
          {GENRES.map((g) => {
            const count = tracks.filter((t: any) => String(t.genre || "").toLowerCase() === g.toLowerCase()).length;
            return (
              <TouchableOpacity key={g} style={s.roomRow} onPress={() => setActiveGenre(g)}>
                <View style={[s.roomAv, { backgroundColor: C.accent }]}>
                  <Ionicons name="disc" size={18} color="#fff" />
                </View>
                <View style={s.flex}>
                  <Text style={s.roomName}>{g}</Text>
                  <Text style={s.meta}>{count} track{count === 1 ? "" : "s"}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.text3} />
              </TouchableOpacity>
            );
          })}
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
