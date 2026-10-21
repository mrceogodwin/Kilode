import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { fetchTracks } from "../lib/api";
import { EmptyState } from "../components/ui/EmptyState";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  onPlay: (track: any) => void;
};

export function MusicScreen({ s, C, onBack, show, onPlay }: Props) {
  const [tab, setTab] = useState<"new" | "charts" | "artists">("new");
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState<any[]>(TRACKS as any[]);
  const [catalogueSource, setCatalogueSource] = useState<"loading" | "live" | "preview">("loading");

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
  const artists = Array.from(new Map(
    tracks.filter((t: any) => t.artist).map((t: any) => [
      String(t.artist).toLowerCase(),
      { id: String(t.artist).toLowerCase(), name: String(t.artist), meta: "Kilode artist", color: C.accent },
    ])
  ).values());
  const chartTracks = filteredTracks.slice(0, 10);

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
          <Text style={[s.meta, { marginTop: 14 }]}>Track details · {catalogueSource === "live" ? "live catalogue" : "preview catalogue"}</Text>
          <TouchableOpacity style={[s.primaryBtn, { marginTop: 22 }]} onPress={() => { onPlay(activeTrack); show("Track selected. Streaming audio is not connected yet."); }}>
            <Ionicons name="play" size={17} color="#fff" />
            <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>Select track</Text>
          </TouchableOpacity>
          <Text style={[s.meta, { marginTop: 12 }]}>Selecting a track updates the in-app player bar; it does not start audio until a streaming source is connected.</Text>
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
            <Text style={s.sub}>{catalogueSource === "live" ? "Drops · charts · artists · live catalogue" : catalogueSource === "loading" ? "Loading music catalogue…" : "Drops · charts · artists · preview catalogue"}</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {(["new", "charts", "artists"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextOn]}>
              {t === "new" ? "New drops" : t === "charts" ? "Tracks" : "Artists"}
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

      {tab === "new" && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>New drops</Text>
          </View>
          {filteredTracks.length === 0 ? (
            <EmptyState
              title={search ? "No matches" : "No tracks yet"}
              body={search ? "Try another track or artist name." : "The live catalogue is empty or unavailable. Try again when the music service is connected."}
              textColor={C.text}
              mutedColor={C.text2}
              accentColor={C.accent}
              icon="musical-notes-outline"
            />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
              {filteredTracks.map((t: any) => (
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
            <Text style={s.sectionTitle}>Tracks in catalogue</Text>
          </View>
          {chartTracks.length === 0 ? <Text style={[s.meta, s.padH]}>No catalogue tracks match this search.</Text> : chartTracks.map((c: any, index: number) => (
            <TouchableOpacity
              key={c.id || `${c.title}-${index}`}
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
          {artists.filter((a: any) => a.name.toLowerCase().includes(search.trim().toLowerCase())).map((a: any) => (
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
