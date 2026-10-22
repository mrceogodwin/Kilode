import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  tracks?: any[];
  tracksSource?: "live" | "mock" | "error";
  onPlay: (track: any) => Promise<void> | void;
  onOpenTrack?: (track: any) => void;
  onOpenArtist?: (name: string) => void;
};

/** Preview catalogue ranks — not claimed as live listening charts. */
const PREVIEW_RANKS = [
  { title: "Hunter of Africa", artist: "Mudino" },
  { title: "We Want a Party", artist: "Mudino" },
  { title: "Calm Down", artist: "Rema" },
  { title: "Water & Light", artist: "Ayo Blue" },
  { title: "Ojuelegba Nights", artist: "Simi Sola" },
  { title: "Last Last", artist: "Burna Boy" },
  { title: "Essence", artist: "Wizkid" },
  { title: "Danfo Dreams", artist: "Kemi Wave" },
  { title: "Joro", artist: "Wizkid" },
  { title: "Balogun Bounce", artist: "Market Band" },
];

const SEGMENTS = ["For You", "Explore", "New", "Artists"] as const;

export function MusicScreen({
  s,
  C,
  onBack,
  show,
  onPlay,
  tracks: remoteTracks,
  tracksSource,
  onOpenTrack,
  onOpenArtist,
}: Props) {
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>("For You");
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [chartMode, setChartMode] = useState<"none" | "100" | "50" | "releases">("none");

  const hasLiveTracks = tracksSource === "live";
  const baseTracks = hasLiveTracks && remoteTracks?.length ? remoteTracks : TRACKS || [];

  const catalogue = useMemo(() => {
    const fromApi = baseTracks.map((t: any, i: number) => ({
      id: String(t.id ?? `t-${i}`),
      title: t.title || "Track",
      artist: t.artist || t.artist_name || "Artist",
      color: t.color || C.elevated,
      audioUrl: t.audioUrl || t.audio_url,
      raw: t,
    }));
    // Fill ranks from named preview list so UI matches product reference without inventing live chart data.
    const ranked = PREVIEW_RANKS.map((r, i) => {
      const hit = fromApi.find(
        (t) =>
          String(t.title).toLowerCase() === r.title.toLowerCase() ||
          String(t.artist).toLowerCase() === r.artist.toLowerCase()
      );
      return {
        rank: i + 1,
        id: hit?.id || `rank-${i + 1}`,
        title: hit?.title || r.title,
        artist: hit?.artist || r.artist,
        color: hit?.color || C.elevated,
        audioUrl: hit?.audioUrl,
        raw: hit?.raw || { id: `rank-${i + 1}`, title: r.title, artist: r.artist, color: C.elevated },
      };
    });
    return ranked;
  }, [baseTracks, C.elevated]);

  const filtered = useMemo(() => {
    let rows = catalogue;
    if (chartMode === "50") rows = catalogue.slice(0, 50);
    if (chartMode === "100") rows = catalogue.slice(0, 100);
    if (chartMode === "releases") rows = catalogue.slice(0, 8);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      rows = rows.filter(
        (t) => t.title.toLowerCase().includes(needle) || t.artist.toLowerCase().includes(needle)
      );
    }
    if (segment === "New") rows = [...rows].reverse();
    if (segment === "Artists") {
      // Unique artists as rows
      const seen = new Set<string>();
      rows = rows.filter((t) => {
        const k = t.artist.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }
    return rows;
  }, [catalogue, chartMode, q, segment]);

  const play = async (track: any) => {
    if (onOpenTrack) onOpenTrack(track.raw || track);
    await onPlay(track.raw || track);
    if (!track.audioUrl && tracksSource !== "live") {
      show("Preview catalogue · stream starts when audio is on the dedicated backend.");
    }
  };

  const chip = (label: string, icon: keyof typeof Ionicons.glyphMap, active: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: active ? C.accent + "22" : C.card,
        borderWidth: 1,
        borderColor: active ? C.accent : C.border,
      }}
    >
      <Ionicons name={icon} size={14} color={active ? C.accent : C.text2} />
      <Text style={{ color: active ? C.accent : C.text, fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="chevron-back" size={18} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 15 }}>Home</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => show("Artist upload opens when dedicated storage is connected.")}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: C.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}
      >
        {chip("Search", "search", searchOpen, () => setSearchOpen((v) => !v))}
        {chip("Top 100", "bar-chart-outline", chartMode === "100", () =>
          setChartMode((m) => (m === "100" ? "none" : "100"))
        )}
        {chip("Top 50", "trending-up", chartMode === "50", () =>
          setChartMode((m) => (m === "50" ? "none" : "50"))
        )}
        {chip("Releases", "albums-outline", chartMode === "releases", () =>
          setChartMode((m) => (m === "releases" ? "none" : "releases"))
        )}
      </ScrollView>

      {searchOpen ? (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            height: 42,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.border,
            backgroundColor: C.elevated,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="search" size={16} color={C.text3} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search tracks or artists"
            placeholderTextColor={C.text3}
            style={{ flex: 1, color: C.text, fontSize: 14 }}
            autoFocus
          />
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: "800", flex: 1 }}>More to Explore</Text>
        <TouchableOpacity onPress={() => show("Full collections when catalogue API is live.")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 13 }}>All collections</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}
      >
        {[
          { title: "Explore Tracks", sub: "Find your next repeat", icon: "musical-note-outline" as const },
          { title: "Fresh Releases", sub: "Singles, EPs & albums", icon: "disc-outline" as const },
          { title: "Meet the Artists", sub: "Discover artists on Kilode", icon: "people-outline" as const },
        ].map((card) => (
          <TouchableOpacity
            key={card.title}
            onPress={() => {
              if (card.title.includes("Artist")) setSegment("Artists");
              else if (card.title.includes("Release")) setChartMode("releases");
              else setSegment("Explore");
            }}
            style={{
              width: 148,
              minHeight: 110,
              padding: 14,
              borderRadius: 16,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Ionicons name={card.icon} size={22} color={C.accent} />
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 14, marginTop: 12 }}>{card.title}</Text>
            <Text style={{ color: C.text3, fontSize: 11, marginTop: 4, lineHeight: 15 }}>{card.sub}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          padding: 4,
          borderRadius: 14,
          backgroundColor: C.elevated,
          borderWidth: 1,
          borderColor: C.border,
          flexDirection: "row",
        }}
      >
        {SEGMENTS.map((seg) => {
          const on = segment === seg;
          return (
            <TouchableOpacity
              key={seg}
              onPress={() => setSegment(seg)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 11,
                backgroundColor: on ? C.card : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ color: on ? C.text : C.text3, fontWeight: on ? "800" : "600", fontSize: 12 }}>{seg}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "800", flex: 1 }}>
          {chartMode === "100"
            ? "Kilode Top 100"
            : chartMode === "50"
              ? "Kilode Top 50"
              : chartMode === "releases"
                ? "Fresh releases"
                : segment === "Artists"
                  ? "Artists in catalogue"
                  : "Popular in the catalogue"}
        </Text>
        <TouchableOpacity onPress={() => setChartMode("100")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>Explore Top 100</Text>
        </TouchableOpacity>
      </View>

      {!hasLiveTracks ? (
        <Text style={{ color: C.text3, fontSize: 11, marginHorizontal: 16, marginTop: 6 }}>
          Preview ranks · not live listening charts until dedicated backend + play events are connected.
        </Text>
      ) : null}

      <View style={{ marginTop: 8 }}>
        {filtered.length === 0 ? (
          <View style={{ margin: 16, padding: 16, borderRadius: 14, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.text2, fontSize: 13 }}>No tracks match this filter.</Text>
          </View>
        ) : (
          filtered.map((t) => (
            <TouchableOpacity
              key={t.id + String(t.rank)}
              onPress={() => play(t)}
              activeOpacity={0.88}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                gap: 12,
              }}
            >
              <Text style={{ width: 22, color: C.text3, fontWeight: "700", fontSize: 13 }}>{t.rank}</Text>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: C.elevated,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="musical-note" size={18} color={C.text2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
                  {segment === "Artists" ? t.artist : t.title}
                </Text>
                <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                  {segment === "Artists" ? "Artist · catalogue" : t.artist}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => (segment === "Artists" ? onOpenArtist?.(t.artist) || show(t.artist) : play(t))}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: C.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={segment === "Artists" ? "chevron-forward" : "play"} size={14} color="#111" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        onPress={() => show("Personalised shelves need listening history on the dedicated backend.")}
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          padding: 14,
          borderRadius: 16,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: C.elevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="sparkles" size={18} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>Tailored to You</Text>
          <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>
            Adapts to what you save and play on this device
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.text3} />
      </TouchableOpacity>
    </ScrollView>
  );
}
