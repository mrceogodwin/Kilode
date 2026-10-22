import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { EmptyState } from "../components/ui/EmptyState";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  tracks?: any[];
  tracksSource?: "live" | "mock" | "error";
  onPlay: (track: any) => Promise<void> | void;
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
];

export function MusicScreen({ s, C, onBack, show, onPlay, tracks: remoteTracks, tracksSource }: Props) {
  const [tab, setTab] = useState<"new" | "charts" | "artists">("new");
  const [activeTrack, setActiveTrack] = useState<any | null>(null);
  const [activeArtist, setActiveArtist] = useState<any | null>(null);
  // Only trust the API catalogue when the request actually succeeded. The API client may return bundled data on failure.
  const hasLiveTracks = tracksSource === "live";
  const tracks = hasLiveTracks ? (remoteTracks || []) : TRACKS || [];
  const usingPreviewCatalogue = !hasLiveTracks;

  const selectTrack = (t: any) => {
    setActiveArtist(null);
    setActiveTrack(t);
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
          <Text style={[s.meta, { marginTop: 14 }]}>{usingPreviewCatalogue ? "Preview catalogue · live tracks unavailable" : "Track details · connected catalogue"}</Text>
          <TouchableOpacity style={[s.primaryBtn, { marginTop: 22 }]} onPress={async () => { await onPlay(activeTrack); }}>
            <Ionicons name="play" size={17} color="#fff" />
            <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>Play track</Text>
          </TouchableOpacity>
          <Text style={[s.meta, { marginTop: 12 }]}>Playback starts only when this track has a valid audio URL. Preview tracks without audio cannot be played.</Text>
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
            <Text style={s.sub}>Drops · charts · artists · seed catalogue</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {(["new", "charts", "artists"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextOn]}>
              {t === "new" ? "New drops" : t === "charts" ? "Top charts" : "Artists"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === "new" && (
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
              {tracks.map((t: any) => (
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
            Playback controls select a track only — no stream is started until audio is wired.
          </Text>
        </>
      )}

      {tab === "charts" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Top charts</Text>
          </View>
          {CHARTS.map((c) => (
            <TouchableOpacity
              key={c.rank}
              style={s.roomRow}
              onPress={() =>
                selectTrack({ id: `c${c.rank}`, title: c.title, artist: c.artist, color: C.accent })
              }
            >
              <Text style={[s.roomName, { width: 28, color: C.accent }]}>{c.rank}</Text>
              <View style={s.flex}>
                <Text style={s.roomName}>{c.title}</Text>
                <Text style={s.meta}>
                  {c.artist} · {c.plays} plays
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
            <Text style={s.sectionTitle}>Featured artists</Text>
          </View>
          {ARTISTS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={s.roomRow}
              onPress={() => setActiveArtist(a)}
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
    </ScrollView>
  );
}
