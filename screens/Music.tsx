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
  onPlay: (track: any) => void;
};

const CHARTS = [
  { rank: 1, title: "Ojuelegba Nights", artist: "Simi Sola" },
  { rank: 2, title: "Danfo Dreams", artist: "Kemi Wave" },
  { rank: 3, title: "Eko Energy", artist: "Femi + Liza" },
  { rank: 4, title: "Water & Light", artist: "Ayo Blue" },
  { rank: 5, title: "Island Rain", artist: "Bola Keys" },
];

const ARTISTS = [
  { id: "a1", name: "Simi Sola", meta: "Afrobeats · Lagos", color: "#F97316" },
  { id: "a2", name: "Kemi Wave", meta: "Amapiano · PH", color: "#7C3AED" },
  { id: "a3", name: "Ayo Blue", meta: "R&B · Abuja", color: "#2563EB" },
];

export function MusicScreen({ s, C, onBack, show, onPlay }: Props) {
  const [tab, setTab] = useState<"new" | "charts" | "artists">("new");
  const [activeTrack, setActiveTrack] = useState<any | null>(null);
  const [activeArtist, setActiveArtist] = useState<any | null>(null);
  const tracks = TRACKS || [];

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
          <View style={{ height: 216, borderRadius: 18, backgroundColor: activeTrack.color || C.elevated, alignItems: "center", justifyContent: "center", marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
            <View style={{ position: "absolute", width: 164, height: 164, borderRadius: 82, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", transform: [{ rotate: "22deg" }] }} /><View style={{ position: "absolute", width: 118, height: 118, borderRadius: 59, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", transform: [{ rotate: "-18deg" }] }} /><Ionicons name="musical-notes" size={58} color="rgba(255,255,255,0.96)" />
          </View>
          <Text style={s.h1}>{activeTrack.title}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>{activeTrack.artist || "Kilode artist"}</Text>
          
          <TouchableOpacity style={[s.primaryBtn, { marginTop: 22 }]} onPress={() => { onPlay(activeTrack); show("Track selected. Streaming audio is not connected yet."); }}>
            <Ionicons name="play" size={17} color="#fff" />
            <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>Select track</Text>
          </TouchableOpacity>
          
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
          <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: activeArtist.color || C.accent, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
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
        <View style={{ paddingTop: 5, paddingBottom: 8 }}>
          <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.8, marginBottom: 7 }}>KILODE SOUND</Text>
          <Text style={[s.h1, { fontSize: 26, letterSpacing: -0.7 }]}>Music</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {(["new", "charts", "artists"] as const).map((t) => (
          <TouchableOpacity key={t} activeOpacity={0.72} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
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
                  style={{ width: 120, marginRight: 11 }}
                  activeOpacity={0.82}
                  onPress={() => selectTrack(t)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${t.title}`}
                >
                  <View style={{ height: 120, borderRadius: 12, overflow: "hidden", backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ position: "absolute", width: 102, height: 102, borderRadius: 51, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" }} />
                    <View style={{ position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }} />
                    <View style={{ position: "absolute", width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" }} />
                    <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.92)" />
                    <View style={{ position: "absolute", right: 9, bottom: 9, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(15,15,16,0.88)", alignItems: "center", justifyContent: "center" }}><Ionicons name="play" size={14} color="#fff" /></View>
                  </View>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 9 }} numberOfLines={1}>{t.title}</Text>
                  <Text style={{ color: C.text2, fontSize: 12, marginTop: 3 }} numberOfLines={1}>{t.artist}</Text>
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
          <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.35 }}>Top charts</Text>
              
            </View>
            <View style={{ paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.text3, fontSize: 9, fontWeight: "800", letterSpacing: 1 }}>SAMPLE</Text>
            </View>
          </View>
          <View style={{ marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: C.elevated }}>
            <Text style={{ color: C.text2, fontSize: 11, lineHeight: 16 }}>Preview rankings only · live chart data is not connected.</Text>
          </View>
          {CHARTS.map((c) => (
            <TouchableOpacity
              key={c.rank}
              style={{ marginHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.border }}
              activeOpacity={0.76}
              onPress={() => selectTrack({ id: `c${c.rank}`, title: c.title, artist: c.artist, color: C.accent })}
              accessibilityRole="button"
              accessibilityLabel={`Preview track ${c.title} by ${c.artist}`}
            >
              <Text style={{ width: 34, color: c.rank === 1 ? C.accent : C.text3, fontSize: c.rank === 1 ? 20 : 16, fontWeight: "800", fontVariant: ["tabular-nums"] }}>{String(c.rank).padStart(2, "0")}</Text>
              <View style={{ width: 44, height: 44, borderRadius: 9, marginRight: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-notes" size={18} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }} numberOfLines={1}>{c.title}</Text>
                <Text style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>{c.artist}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={25} color={C.accent} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {tab === "artists" && (
        <>
          <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: C.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.45 }}>Featured artists</Text>
              
            </View>
            <View style={{ paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.text3, fontSize: 9, fontWeight: "800", letterSpacing: 1 }}>SAMPLE</Text>
            </View>
          </View>
          {ARTISTS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={s.roomRow}
              activeOpacity={0.76}
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
