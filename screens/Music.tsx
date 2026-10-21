import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { fetchTracks, getMusicPlayback, recordMusicEvent } from "../lib/api";
import { playMusicTrack, subscribeMusicPlayer, toggleMusicPlayback } from "../lib/musicPlayer";
import { EmptyState } from "../components/ui/EmptyState";
import { MusicUploadSheet } from "./MusicUploadSheet";
import { buildMusicDiscoveryShelves, readMusicDiscoveryProfile, recordMusicDiscoveryAction, type MusicDiscoveryProfile, type MusicDiscoveryShelf } from "../lib/musicDiscovery";

function hasPlayableAudioSource(track: any): boolean {
  const value = [track?.audioUrl, track?.audio_url, track?.streamUrl, track?.stream_url, track?.previewUrl, track?.preview_url]
    .find((candidate) => typeof candidate === "string" && /^https?:\/\//i.test(candidate.trim()));
  return Boolean(value);
}

function musicTrackIdentity(track: any): string {
  if (track?.id !== undefined && track?.id !== null && String(track.id).trim()) {
    return `id:${String(track.id)}`;
  }
  const url = [track?.audioUrl, track?.audio_url, track?.streamUrl, track?.stream_url, track?.previewUrl, track?.preview_url]
    .find((value) => typeof value === "string" && /^https?:\/\//i.test(value.trim()));
  if (url) return `url:${String(url).trim()}`;
  return `meta:${String(track?.title || "").trim().toLowerCase()}:${String(track?.artist || "").trim().toLowerCase()}`;
}

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  onPlay: (track: any) => void;
  canUpload: boolean;
  token: string;
  accountScope?: string;
};

export function MusicScreen({ s, C, onBack, show, onPlay, canUpload, token, accountScope = "guest" }: Props) {
  const [tab, setTab] = useState<"forYou" | "charts" | "new" | "artists">("forYou");
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState<any[]>(TRACKS as any[]);
  const [catalogueSource, setCatalogueSource] = useState<"loading" | "live" | "preview">("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBusy, setPlaybackBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [discoveryProfile, setDiscoveryProfile] = useState<MusicDiscoveryProfile>({ version: 1, events: [], hiddenTrackKeys: [] });
  const [discoveryReady, setDiscoveryReady] = useState(false);
  const [discoveryShelves, setDiscoveryShelves] = useState<MusicDiscoveryShelf[]>([]);

  useEffect(() => {
    let active = true;
    setDiscoveryReady(false);
    setDiscoveryProfile({ version: 1, events: [], hiddenTrackKeys: [] });
    void readMusicDiscoveryProfile(accountScope).then((profile) => {
      if (!active) return;
      setDiscoveryProfile(profile);
      setDiscoveryReady(true);
    });
    return () => { active = false; };
  }, [accountScope]);

  useEffect(() => {
    setDiscoveryShelves(buildMusicDiscoveryShelves(tracks, discoveryProfile));
  }, [tracks, discoveryProfile]);


  useEffect(() => {
    let active = true;
    fetchTracks().then((result) => {
      if (!active) return;
      if (result.ok && Array.isArray(result.data)) {
        setTracks(result.data);
        setCatalogueSource("live");
      } else {
        // Keep the offline sample catalogue visible, but never label it as live.
        setTracks(TRACKS as any[]);
        setCatalogueSource("preview");
      }
    }).catch(() => {
      if (!active) return;
      setTracks(TRACKS as any[]);
      setCatalogueSource("preview");
    });
    return () => { active = false; };
  }, []);
  const [activeTrack, setActiveTrack] = useState<any | null>(null);
  const [activeArtist, setActiveArtist] = useState<any | null>(null);
  const filteredTracks = tracks.filter((t: any) => `${t.title || ""} ${t.artist || ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  const artistMap = new Map<string, any>();
  tracks.forEach((track: any) => {
    const name = String(track.artist || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    const existing = artistMap.get(key);
    if (existing) existing.trackCount += 1;
    else artistMap.set(key, { id: key, name, trackCount: 1, color: C.accent });
  });
  const artists = Array.from(artistMap.values())
    .map((artist: any) => ({ ...artist, meta: artist.trackCount + (artist.trackCount === 1 ? " track in catalogue" : " tracks in catalogue") }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
    const exploreTracks = filteredTracks;
  const newTracks = filteredTracks.filter((track: any) => {
    const rawDate = track?.releaseDate || track?.release_date || track?.releasedAt || track?.released_at;
    if (!rawDate) return false;
    const timestamp = Date.parse(String(rawDate));
    if (!Number.isFinite(timestamp)) return false;
    const age = Date.now() - timestamp;
    return age >= -86400000 && age <= 45 * 86400000;
  });
  const visibleArtists = artists.filter((a: any) => a.name.toLowerCase().includes(search.trim().toLowerCase()));

  useEffect(() => {
    const unsubscribe = subscribeMusicPlayer((track, playing) => {
      setIsPlaying(Boolean(track && activeTrack && musicTrackIdentity(track) === musicTrackIdentity(activeTrack) && playing));
    });
    return () => { unsubscribe(); };
  }, [activeTrack]);

  const togglePlayback = async (track: any) => {
    if (playbackBusy) return;
    setPlaybackBusy(true);
    try {
      // Pausing the active track should not request a fresh signed URL or count as a new play.
      if (isPlaying) {
        await toggleMusicPlayback();
        return;
      }
      let playableTrack = track;
      if (catalogueSource === "live") {
        if (!track?.id) {
          show("This live track is missing its Kilode track ID.");
          return;
        }
        const playback = await getMusicPlayback(token, String(track.id));
        if (!playback.ok || !playback.data?.url || !/^https:\/\//i.test(playback.data.url)) {
          show(playback.error || "Kilode could not create a secure playback link for this track.");
          return;
        }
        playableTrack = { ...track, audioUrl: playback.data.url, audio_url: undefined, streamUrl: undefined, stream_url: undefined, previewUrl: undefined, preview_url: undefined };
      }
      const result = await playMusicTrack(playableTrack);
      if (!result.ok) {
        show(result.message || "This track cannot be played yet.");
        return;
      }
      if (catalogueSource === "live" && track?.id) {
        void recordMusicEvent(token, String(track.id), "play_started");
      }
      void recordMusicDiscoveryAction(track, "played", undefined, accountScope);
      void readMusicDiscoveryProfile(accountScope).then(setDiscoveryProfile);
      onPlay(playableTrack);
    } catch {
      show("Kilode could not start this track. Check your connection and try again.");
    } finally {
      setPlaybackBusy(false);
    }
  };

  const selectTrack = (t: any) => {
    setActiveArtist(null);
    setActiveTrack(t);
    // Track opens are stored locally to improve discovery without a server request.
    void recordMusicDiscoveryAction(t, "opened", undefined, accountScope).then(() => readMusicDiscoveryProfile(accountScope).then(setDiscoveryProfile));
  };

  if (activeTrack) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveTrack(null)} style={{ marginBottom: 12 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>
          <View style={{ height: 220, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="musical-notes" size={56} color="#fff" />
          </View>
          <Text style={s.h1}>{activeTrack.title}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>{activeTrack.artist || "Kilode artist"}</Text>
          <Text style={[s.meta, { marginTop: 14 }]}>Track details · {catalogueSource === "live" ? "live catalogue" : "preview catalogue"}</Text>
          <TouchableOpacity
            style={[s.primaryBtn, { marginTop: 22, opacity: playbackBusy || (catalogueSource !== "live" && !hasPlayableAudioSource(activeTrack)) ? 0.5 : 1 }]}
            onPress={() => void togglePlayback(activeTrack)}
            disabled={playbackBusy || (catalogueSource !== "live" && !hasPlayableAudioSource(activeTrack))}
            accessibilityRole="button"
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={17} color="#fff" />
            <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>
              {playbackBusy ? "Loading audio…" : isPlaying ? "Pause track" : catalogueSource !== "live" && !hasPlayableAudioSource(activeTrack) ? "Audio unavailable" : "Play track"}
            </Text>
          </TouchableOpacity>
          <Text style={[s.meta, { marginTop: 12 }]}>
            {catalogueSource === "live"
              ? "Kilode requests a secure playback link when you press play."
              : hasPlayableAudioSource(activeTrack)
                ? "Preview audio is available for this track."
                : "This preview track has no audio file attached yet. Choose a track with a playable source."}
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (activeArtist) {
    const artistTracks = tracks.filter((t: any) => String(t.artist || "").toLowerCase() === String(activeArtist.name).toLowerCase());
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveArtist(null)} style={{ marginBottom: 12 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: activeArtist.color || C.accent, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Ionicons name="person" size={34} color="#fff" />
          </View>
          <Text style={s.h1}>{activeArtist.name}</Text>
          <Text style={s.sub}>{activeArtist.meta}</Text>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>Tracks</Text></View>
          {artistTracks.length ? artistTracks.map((t: any) => (
            <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => selectTrack(t)}>
              <Ionicons name="musical-note" size={20} color={C.accent} />
              <View style={[s.flex, { marginLeft: 12 }]}><Text style={s.roomName}>{t.title}</Text><Text style={s.meta}>{t.artist}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={C.text3} />
            </TouchableOpacity>
          )) : <Text style={[s.sub, s.padH]}>No tracks from this artist are in the current preview catalogue yet.</Text>}
        </View>
      </ScrollView>
    );
  }

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
            <Text style={s.sub}>{catalogueSource === "live" ? "Discover tracks · artists · live catalogue" : catalogueSource === "loading" ? "Loading music catalogue…" : "Discover tracks · artists · preview catalogue"}</Text>
          </View>
          {canUpload ? <TouchableOpacity onPress={() => setUploadOpen(true)} accessibilityRole="button" accessibilityLabel="Upload a music track" style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}><Ionicons name="cloud-upload-outline" size={21} color={C.accent} /></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {(["forYou", "charts", "new", "artists"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextOn]}>
              {t === "forYou" ? "For You" : t === "new" ? "New" : t === "charts" ? "Explore" : "Artists"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 14, marginTop: 2, marginBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <Ionicons name="search" size={17} color={C.text3} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tracks or artists"
            placeholderTextColor={C.text3}
            returnKeyType="search"
            style={{ flex: 1, color: C.text, fontSize: 14, padding: 0 }}
            accessibilityLabel="Search tracks or artists"
          />
          {search.length > 0 ? <TouchableOpacity onPress={() => setSearch("")} accessibilityRole="button" accessibilityLabel="Clear search"><Ionicons name="close-circle" size={17} color={C.text3} /></TouchableOpacity> : null}
        </View>
      </View>

      {tab === "forYou" && !search.trim() && (
        <View style={{ marginTop: 16 }}>
          <View style={[s.sectionHead, { paddingHorizontal: 14, marginBottom: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>More to Explore</Text>
              <Text style={[s.meta, { marginTop: 3 }]}>Find your next favourite sound on Kilode</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.tracksRow, { paddingHorizontal: 14, gap: 10 }]}>
            {([
              { id: "explore", title: "Explore tracks", detail: "Browse the catalogue", icon: "musical-notes-outline", target: "charts" as const },
              { id: "new", title: "Fresh releases", detail: "Hear what's new", icon: "sparkles-outline", target: "new" as const },
              { id: "artists", title: "Meet the artists", detail: "Find your next favourite", icon: "people-outline", target: "artists" as const },
            ]).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setTab(item.target)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={{ width: 168, minHeight: 112, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, justifyContent: "space-between" }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: C.elevated || C.border, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={item.icon as any} size={19} color={C.accent} />
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>{item.title}</Text>
                  <Text style={[s.meta, { marginTop: 3 }]}>{item.detail}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {discoveryReady && tab === "forYou" && !search.trim() && discoveryShelves.map((shelf) => (
        <View key={shelf.id} style={{ marginTop: 18 }}>
          <View style={s.sectionHead}>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>{shelf.title}</Text>
              <Text style={[s.meta, { marginTop: 3 }]}>{shelf.subtitle}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
            {shelf.tracks.map((track: any) => (
              <TouchableOpacity
                key={musicTrackIdentity(track)}
                style={[s.trackCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}
                onPress={() => selectTrack(track)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${track.title} from ${shelf.title}`}
              >
                <Ionicons name="headset-outline" size={18} color={C.accent} style={{ marginBottom: 6 }} />
                <Text style={[s.trackTitle, { color: C.text }]} numberOfLines={1}>{track.title}</Text>
                <Text style={[s.trackArtist, { color: C.text2 }]} numberOfLines={1}>{track.artist || "Kilode artist"}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}


      {tab === "forYou" && (
        <View style={{ marginTop: 14, paddingHorizontal: 14 }}>
          <Text style={s.sectionTitle}>Made for your next mood</Text>
          <Text style={[s.meta, { marginTop: 5, lineHeight: 17 }]}>
            Kilode shapes these picks on your device as you listen. Your listening history stays local in this first version.
          </Text>
          {!discoveryShelves.length ? (
            <View style={{ marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>Your sound starts here</Text>
              <Text style={[s.meta, { marginTop: 6, lineHeight: 17 }]}>Explore a few tracks. Kilode will use your listening activity to shape your personal shelves.</Text>
              <TouchableOpacity onPress={() => setTab("charts")} style={{ marginTop: 12, alignSelf: "flex-start" }}>
                <Text style={s.link}>Explore music →</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}

      {tab === "new" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Recently released</Text>
          </View>
          {newTracks.length === 0 ? (
            <EmptyState
              title={search ? "No recent releases match" : "No recent releases yet"}
              body={search ? "Try another track or artist name." : "Recent releases appear here when catalogue entries include release dates. Browse all available tracks in Explore."}
              textColor={C.text}
              mutedColor={C.text2}
              accentColor={C.accent}
              icon="musical-notes-outline"
            />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
              {newTracks.map((t: any) => (
                <TouchableOpacity
                  key={t.id}
                  style={[s.trackCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}
                  onPress={() => selectTrack(t)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${t.title}`}
                >
                  <Ionicons name="play" size={18} color={C.accent} style={{ marginBottom: 6 }} />
                  <Text style={[s.trackTitle, { color: C.text }]} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={[s.trackArtist, { color: C.text2 }]} numberOfLines={1}>
                    {t.artist}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Text style={[s.meta, s.padH, { marginTop: 12 }]}>
            Recent releases are based on catalogue release dates. Choose a track to view details; playback requires a valid audio URL or secure playback link.
          </Text>
        </>
      )}

      {tab === "charts" && (
        <>
          <View style={{ marginHorizontal: 14, marginTop: 12, marginBottom: 14, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#8D7440", backgroundColor: C.card, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 54, height: 62, borderRadius: 13, borderWidth: 1, borderColor: "#C8A85B", backgroundColor: "#29241A", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="trophy" size={22} color="#E5C158" />
                <Text style={{ color: "#E5C158", fontSize: 10, fontWeight: "900", letterSpacing: 1 }}>100</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 21, fontWeight: "900", letterSpacing: -0.5 }}>KILODE TOP 100</Text>
                <Text style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>The tracks shaping the sound right now.</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#E5C158" }} />
                  <Text style={{ color: "#E5C158", fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>{catalogueSource === "live" ? "CATALOGUE CONNECTED · RANKINGS PENDING" : "PREVIEW · NOT A LIVE CHART"}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: "#8D7440", opacity: 0.7, marginTop: 14, marginBottom: 10 }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="stats-chart-outline" size={14} color="#E5C158" />
              <Text style={{ color: C.text2, fontSize: 11, flex: 1 }}>Rank movement needs verified play and chart history. No movement is fabricated.</Text>
              <Ionicons name="shield-checkmark-outline" size={14} color="#E5C158" />
            </View>
          </View>
          <View style={[s.sectionHead, { marginBottom: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>The Top 100</Text>
              <Text style={[s.meta, { marginTop: 3 }]}>Every track has a place. Tap a row to open it.</Text>
            </View>
            <Ionicons name="musical-notes-outline" size={18} color={C.accent} />
          </View>
          {exploreTracks.length === 0 ? <EmptyState title={search ? "No matching tracks" : "No tracks available"} body={search ? "Try a different title or artist." : "Tracks will appear here when the catalogue is available."} textColor={C.text} mutedColor={C.text2} accentColor={C.accent} icon="musical-notes-outline" /> : exploreTracks.slice(0, 100).map((track: any, index: number) => {
            const rankChange = Number.isFinite(track.rankChange) ? track.rankChange : null;
            const previousRank = Number.isFinite(track.previousRank) ? track.previousRank : null;
            const change = rankChange !== null ? rankChange : previousRank !== null ? previousRank - (index + 1) : null;
            const movementIcon = change === null || change === 0 ? "remove-outline" : change > 0 ? "arrow-up" : "arrow-down";
            const movementColor = change === null || change === 0 ? C.text3 : change > 0 ? "#59C98A" : "#E58A78";
            return (
              <TouchableOpacity
                key={musicTrackIdentity(track)}
                style={{ marginHorizontal: 14, marginBottom: 7, minHeight: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, gap: 10 }}
                onPress={() => selectTrack(track)}
                accessibilityRole="button"
                accessibilityLabel={`Rank ${index + 1}, ${track.title}, ${track.artist || "Kilode artist"}`}
              >
                <View style={{ width: 27, alignItems: "center" }}>
                  <Text style={{ color: index < 3 ? "#E5C158" : C.text2, fontSize: index < 3 ? 19 : 16, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{String(index + 1).padStart(2, "0")}</Text>
                  {index === 0 ? <Ionicons name="trophy-outline" size={10} color="#E5C158" /> : index === 1 ? <Ionicons name="medal-outline" size={10} color="#B8C0CC" /> : index === 2 ? <Ionicons name="medal-outline" size={10} color="#B87951" /> : null}
                </View>
                <View style={{ width: 38, height: 42, borderRadius: 9, backgroundColor: C.input, borderWidth: 1, borderColor: index < 3 ? "#8D7440" : C.border, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={index === 0 ? "trophy-outline" : index % 5 === 0 ? "flame-outline" : "musical-note-outline"} size={17} color={index < 3 ? "#E5C158" : C.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: "800" }} numberOfLines={1}>{track.title}</Text>
                  <Text style={{ color: C.text2, fontSize: 11, marginTop: 3 }} numberOfLines={1}>{track.artist || "Kilode artist"}</Text>
                </View>
                <View style={{ alignItems: "center", justifyContent: "center", minWidth: 28 }}>
                  <Ionicons name={movementIcon as any} size={15} color={movementColor} />
                  <Text style={{ color: movementColor, fontSize: 9, fontWeight: "800", marginTop: 1 }}>{change === null ? "—" : change > 0 ? `+${change}` : change < 0 ? String(change) : "—"}</Text>
                </View>
                <Ionicons name="play-circle-outline" size={24} color={C.accent} />
              </TouchableOpacity>
            );
          })}
          {exploreTracks.length > 0 ? <Text style={[s.meta, { paddingHorizontal: 14, marginTop: 7, marginBottom: 18, lineHeight: 16 }]}>This list currently follows available catalogue order. Official chart positions and movement will appear only when verified chart data is connected.</Text> : null}
        </>
      )}

      {tab === "artists" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Artists in catalogue</Text>
          </View>
          {visibleArtists.length === 0 ? (
            <EmptyState
              title={search ? "No artists found" : "No artists yet"}
              body={search ? "Try another artist name." : "Artist profiles will appear here when tracks are available in the catalogue."}
              textColor={C.text}
              mutedColor={C.text2}
              accentColor={C.accent}
              icon="people-outline"
            />
          ) : visibleArtists.map((a: any) => (
            <TouchableOpacity
              key={a.id}
              style={s.roomRow}
              onPress={() => setActiveArtist(a)}
              accessibilityRole="button"
              accessibilityLabel={`Open artist ${a.name}`}
            >
              <View
                style={[
                  s.roomAv,
                  { backgroundColor: a.color, width: 48, height: 48, borderRadius: 24 },
                ]}
              >
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

      <View style={{ height: 24 }} />
      <MusicUploadSheet
        visible={uploadOpen}
        token={token}
        C={C}
        onClose={() => setUploadOpen(false)}
        show={show}
        onPublished={() => {
          void fetchTracks().then((result) => {
            if (result.ok && Array.isArray(result.data)) {
              setTracks(result.data);
              setCatalogueSource("live");
            }
          });
        }}
      />
    </ScrollView>
  );
}
