import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { fetchTracks, getMusicPlayback, recordMusicEvent } from "../lib/api";
import { playMusicTrack, subscribeMusicPlayer, toggleMusicPlayback } from "../lib/musicPlayer";
import { EmptyState } from "../components/ui/EmptyState";
import { MusicUploadSheet } from "./MusicUploadSheet";
import { buildMusicDiscoveryShelves, readMusicDiscoveryProfile, recordMusicDiscoveryAction, type MusicDiscoveryProfile, type MusicDiscoveryShelf } from "../lib/musicDiscovery";

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
};

export function MusicScreen({ s, C, onBack, show, onPlay, canUpload, token }: Props) {
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
    void readMusicDiscoveryProfile().then((profile) => {
      if (!active) return;
      setDiscoveryProfile(profile);
      setDiscoveryReady(true);
    });
    return () => { active = false; };
  }, []);

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
      void recordMusicDiscoveryAction(track, "played");
      void readMusicDiscoveryProfile().then(setDiscoveryProfile);
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
    void recordMusicDiscoveryAction(t, "opened").then(() => readMusicDiscoveryProfile().then(setDiscoveryProfile));
  };

  if (activeTrack) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => setActiveTrack(null)} style={{ marginBottom: 12 }} accessibilityRole="button">
            <Text style={s.link}>‹ Back to Music</Text>
          </TouchableOpacity>
          <View style={{ height: 220, borderRadius: 20, backgroundColor: activeTrack.color || C.elevated, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="musical-notes" size={56} color="#fff" />
          </View>
          <Text style={s.h1}>{activeTrack.title}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>{activeTrack.artist || "Kilode artist"}</Text>
          <Text style={[s.meta, { marginTop: 14 }]}>Track details · {catalogueSource === "live" ? "live catalogue" : "preview catalogue"}</Text>
          <TouchableOpacity style={[s.primaryBtn, { marginTop: 22, opacity: playbackBusy ? 0.65 : 1 }]} onPress={() => void togglePlayback(activeTrack)} disabled={playbackBusy}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={17} color="#fff" />
            <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>{playbackBusy ? "Loading audio…" : isPlaying ? "Pause track" : "Play track"}</Text>
          </TouchableOpacity>
          <Text style={[s.meta, { marginTop: 12 }]}>Playback works when a catalogue track provides a valid audio URL. Tracks without one cannot play yet.</Text>
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
                style={[s.trackCard, { backgroundColor: track.color || C.accent }]}
                onPress={() => selectTrack(track)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${track.title} from ${shelf.title}`}
              >
                <Ionicons name="headset-outline" size={18} color="#fff" style={{ marginBottom: 6 }} />
                <Text style={s.trackTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={s.trackArtist} numberOfLines={1}>{track.artist || "Kilode artist"}</Text>
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
                  style={[s.trackCard, { backgroundColor: t.color || C.accent }]}
                  onPress={() => selectTrack(t)}
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
            Recent releases are based on catalogue release dates. Choose a track to view details; playback requires a valid audio URL or secure playback link.
          </Text>
        </>
      )}

      {tab === "charts" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Explore tracks</Text>
          </View>
          {exploreTracks.length === 0 ? <EmptyState title={search ? "No matching tracks" : "No tracks available"} body={search ? "Try a different title or artist." : "Tracks will appear here when the catalogue is available."} textColor={C.text} mutedColor={C.text2} accentColor={C.accent} icon="musical-notes-outline" /> : exploreTracks.map((c: any, index: number) => (
            <TouchableOpacity
              key={musicTrackIdentity(c)}
              style={s.roomRow}
              onPress={() =>
                selectTrack(c)
              }
            >
              <Text style={[s.roomName, { width: 28, color: C.accent }]}>{index + 1}</Text>
              <View style={s.flex}>
                <Text style={s.roomName}>{c.title}</Text>
                <Text style={s.meta}>
                  {c.artist || "Kilode artist"}
                </Text>
              </View>
              <Ionicons name="play-circle-outline" size={28} color={C.accent} />
            </TouchableOpacity>
          ))}
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
