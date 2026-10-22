import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { EmptyState } from "../components/ui/EmptyState";
import {
  loadSavedTracks as getSavedTracks,
  loadRecentTracks as getRecentTracks,
  toggleSavedTrack,
  type LibraryTrack,
} from "../lib/musicLibrary";
import {
  playMusicTrack,
  playNextInQueue,
  playPreviousInQueue,
  subscribeMusicPlayer,
} from "../lib/musicPlayer";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  tracks?: any[];
  tracksSource?: "live" | "mock" | "error";
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

type Tab = "discover" | "charts" | "artists" | "library" | "genres";

export function MusicScreen({ s, C, onBack, show, tracks: remoteTracks, tracksSource }: Props) {
  const [tab, setTab] = useState<Tab>("discover");
  const [activeTrack, setActiveTrack] = useState<any | null>(null);
  const [activeArtist, setActiveArtist] = useState<any | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [saved, setSaved] = useState<LibraryTrack[]>([]);
  const [recent, setRecent] = useState<LibraryTrack[]>([]);
  const [player, setPlayer] = useState<{ track: any | null; playing: boolean; queue: any[]; index: number }>({ track: null, playing: false, queue: [], index: -1 });

  const hasLiveTracks = tracksSource === "live";
  const tracks = hasLiveTracks ? remoteTracks || [] : TRACKS || [];
  const usingPreviewCatalogue = !hasLiveTracks;

  const refreshLibrary = useCallback(async () => {
    const [sList, rList] = await Promise.all([getSavedTracks(), getRecentTracks()]);
    setSaved(sList);
    setRecent(rList);
  }, []);

  useEffect(() => {
    void refreshLibrary();
    const unsub = subscribeMusicPlayer((state) => setPlayer(state));
    return () => {
      unsub();
    };
  }, [refreshLibrary]);

  const isSaved = (id: string) => saved.some((t) => t.id === String(id));

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
    const { saved: nowSaved } = await toggleSavedTrack(track);
    await refreshLibrary();
    show(nowSaved ? `Saved · ${track.title}` : `Removed · ${track.title}`);
  };

  // ——— Track detail ———
  if (activeTrack) {
    const queue = player.queue.length ? player.queue : tracks;
    const canPrev = player.index > 0 || !!player.track;
    const canNext = player.index >= 0 && player.index < queue.length - 1;
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

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28 }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Previous track"
              onPress={async () => {
                const r = await playPreviousInQueue();
                if (!r.ok && r.message) show(r.message);
                else if (player.queue[player.index - 1]) setActiveTrack(player.queue[Math.max(0, player.index - 1)]);
              }}
              style={{ opacity: canPrev ? 1 : 0.35 }}
            >
              <Ionicons name="play-skip-back" size={28} color={C.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.primaryBtn, { paddingHorizontal: 28, minWidth: 120, justifyContent: "center" }]}
              onPress={async () => {
                const list = tracks;
                const idx = list.findIndex((x: any) => String(x.id) === String(activeTrack.id));
                await playQueue(list, idx >= 0 ? idx : 0);
              }}
            >
              <Ionicons
                name={player.playing && String(player.track?.id) === String(activeTrack.id) ? "pause" : "play"}
                size={20}
                color="#fff"
              />
              <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>
                {player.playing && String(player.track?.id) === String(activeTrack.id) ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Next track"
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
              name={isSaved(activeTrack.id) ? "heart" : "heart-outline"}
              size={22}
              color={isSaved(activeTrack.id) ? C.danger : C.accent}
            />
            <Text style={[s.roomName, { marginLeft: 12 }]}>
              {isSaved(activeTrack.id) ? "Saved to Library" : "Save to Library"}
            </Text>
          </TouchableOpacity>

          <Text style={[s.meta, { marginTop: 16 }]}>
            Playback uses sample audio in preview mode. Live catalogue streaming requires the dedicated music API.
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
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveArtist(null)} style={{ marginBottom: 12 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: activeArtist.color || C.accent,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Ionicons name="person" size={34} color="#fff" />
          </View>
          <Text style={s.h1}>{activeArtist.name}</Text>
          <Text style={s.sub}>{activeArtist.meta}</Text>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Tracks</Text>
          </View>
          {artistTracks.length ? (
            artistTracks.map((t: any, i: number) => (
              <TouchableOpacity
                key={t.id}
                style={s.roomRow}
                onPress={() => selectTrack(t)}
                onLongPress={() => playQueue(artistTracks, i)}
              >
                <Ionicons name="musical-note" size={20} color={C.accent} />
                <View style={[s.flex, { marginLeft: 12 }]}>
                  <Text style={s.roomName}>{t.title}</Text>
                  <Text style={s.meta}>{t.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => onToggleSave(t)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={isSaved(t.id) ? "heart" : "heart-outline"}
                    size={20}
                    color={isSaved(t.id) ? C.danger : C.text3}
                  />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={18} color={C.text3} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[s.sub, s.padH]}>No tracks from this artist are in the current catalogue yet.</Text>
          )}
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
              <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => selectTrack(t)} onLongPress={() => playQueue(genreTracks, i)}>
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
        {(["discover", "charts", "artists", "library", "genres"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextOn]}>
              {t === "discover"
                ? "Discover"
                : t === "charts"
                  ? "Charts"
                  : t === "artists"
                    ? "Artists"
                    : t === "library"
                      ? "Library"
                      : "Genres"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === "discover" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>New drops</Text>
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
                  key={t.id}
                  style={[s.trackCard, { backgroundColor: t.color || C.accent }]}
                  onPress={() => selectTrack(t)}
                  onLongPress={() => playQueue(tracks, i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${t.title}`}
                >
                  <Ionicons name="play" size={18} color="#fff" style={{ marginBottom: 6 }} />
                  <Text style={s.trackTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={s.trackArtist} numberOfLines={1}>
                    {t.artist}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Text style={[s.meta, s.padH, { marginTop: 12 }]}>
            Tap for details · long-press to play in queue. Sample audio works offline.
          </Text>
        </>
      )}

      {tab === "charts" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Top charts</Text>
          </View>
          {CHARTS.map((c) => {
            const match = tracks.find(
              (t: any) =>
                String(t.title).toLowerCase() === c.title.toLowerCase() ||
                String(t.artist).toLowerCase() === c.artist.toLowerCase()
            );
            const card = match || { id: `c${c.rank}`, title: c.title, artist: c.artist, color: C.accent };
            return (
              <TouchableOpacity key={c.rank} style={s.roomRow} onPress={() => selectTrack(card)}>
                <Text style={[s.roomName, { width: 28, color: C.accent }]}>{c.rank}</Text>
                <View style={s.flex}>
                  <Text style={s.roomName}>{c.title}</Text>
                  <Text style={s.meta}>
                    {c.artist} · {c.plays} plays
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={28} color={C.accent} />
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
            <Text style={s.sectionTitle}>Saved</Text>
          </View>
          {saved.length === 0 ? (
            <Text style={[s.sub, s.padH, { marginBottom: 16 }]}>
              Heart any track to save it here. Saved tracks stay on this device.
            </Text>
          ) : (
            saved.map((t) => (
              <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => selectTrack(t)}>
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
            recent.map((t) => (
              <TouchableOpacity key={`r-${t.id}`} style={s.roomRow} onPress={() => selectTrack(t)}>
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
