import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { can } from "../lib/permissions";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  onPlay: (track: any) => void;
  onOpenTrack?: (track: any) => void;
  onOpenArtist?: (artistName: string) => void;
  accountKind?: string;
};

const TABS = ["Home", "Discover", "Charts", "Artists"] as const;

const FEATURED = {
  name: "Ayra Starr",
  meta: "R&B · Afrobeats · 2.8M followers",
  imageUrl: "https://images.unsplash.com/photo-1516280440614-6697288d5b28?w=800&q=80",
};

const CHARTS = [
  { rank: 1, title: "Calm Down", artist: "Rema", color: "#D97706" },
  { rank: 2, title: "Beautiful Things", artist: "Burna Boy", color: "#4B5563" },
  { rank: 3, title: "Lonely At The Top", artist: "Asake", color: "#B45309" },
  { rank: 4, title: "Ojuelegba Nights", artist: "Simi Sola", color: "#7C3AED" },
  { rank: 5, title: "Water & Light", artist: "Ayo Blue", color: "#2563EB" },
];

const GENRES = [
  { id: "afro", label: "Afrobeats", color: "#E5C158" },
  { id: "hip", label: "Hip Hop", color: "#3B82F6" },
  { id: "rnb", label: "R&B", color: "#A855F7" },
  { id: "amapiano", label: "Amapiano", color: "#10B981" },
];

export function MusicScreen({ s, C, onBack, show, onPlay, onOpenTrack, onOpenArtist, accountKind }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Home");
  const [following, setFollowing] = useState(false);
  const tracks = TRACKS || [];
  const canList = can(accountKind, "music_list");

  const openTrack = (t: any) => {
    if (onOpenTrack) onOpenTrack(t);
    else {
      onPlay(t);
      show(`Playing ${t.title} · full stream when Music API is live`);
    }
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button">
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
                <TouchableOpacity
          onPress={() =>
            canList
              ? show("Track submit form opens when Music list API is live.")
              : show("Artist accounts can list tracks. Switch account type or register as Artist.")
          }
        >
          <Ionicons name="add-circle-outline" size={22} color={canList ? C.accent : C.text3} />
        </TouchableOpacity>
      </View>

      {canList ? (
        <TouchableOpacity
          onPress={() => show("Drop track when Music list API is live.")}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: C.accentSoft,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: 999,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 14 }}>Drop a track</Text>
        </TouchableOpacity>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: tab === t ? C.accentSoft : "transparent",
              borderWidth: 1,
              borderColor: tab === t ? C.accent : C.border,
            }}
          >
            <Text style={{ color: tab === t ? C.accent : C.text2, fontWeight: "600", fontSize: 13 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => (onOpenArtist ? onOpenArtist(FEATURED.name) : show(FEATURED.name))}
        style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
      >
        <Image source={{ uri: FEATURED.imageUrl }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
        <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "600", fontSize: 14, letterSpacing: -0.15 }}>{FEATURED.name}</Text>
            <Text style={{ color: C.text3, fontSize: 12, marginTop: 3 }}>{FEATURED.meta}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setFollowing((f) => !f);
              show(following ? `Unfollowed ${FEATURED.name}` : `Following ${FEATURED.name}`);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: following ? C.elevated : C.accent,
              borderWidth: 1,
              borderColor: following ? C.border : C.accent,
            }}
          >
            <Text style={{ color: following ? C.text : "#111", fontWeight: "800", fontSize: 12 }}>
              {following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, flex: 1 }}>Top charts</Text>
        <TouchableOpacity onPress={() => setTab("Charts")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>See all</Text>
        </TouchableOpacity>
      </View>

      {(tab === "Charts" || tab === "Home" ? CHARTS : CHARTS.slice(0, 3)).map((row) => {
        const payload = { id: `c${row.rank}`, title: row.title, artist: row.artist, color: row.color };
        return (
          <TouchableOpacity
            key={row.rank}
            onPress={() => openTrack(payload)}
            style={{
              marginHorizontal: 16,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 10,
              borderRadius: 14,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Text style={{ color: C.text3, fontWeight: "800", width: 20 }}>{row.rank}</Text>
            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: row.color, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-notes" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "600", fontSize: 13, letterSpacing: -0.1 }}>{row.title}</Text>
              <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>{row.artist}</Text>
            </View>
            <Ionicons name="play-circle" size={28} color={C.accent} />
          </TouchableOpacity>
        );
      })}

      <Text style={{ color: C.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2, paddingHorizontal: 16, marginTop: 18, marginBottom: 9 }}>Genres</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 }}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => show(`${g.label} catalogue when Music API is live.`)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: g.color }} />
            <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>From Kilode</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {tracks.map((t: any) => (
          <TouchableOpacity key={t.id} onPress={() => openTrack(t)} style={{ width: 120 }}>
            <View style={{ width: 120, height: 120, borderRadius: 14, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 6 }} numberOfLines={1}>{t.title}</Text>
            <Text style={{ color: C.text3, fontSize: 11 }} numberOfLines={1}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}
