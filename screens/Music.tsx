import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  onPlay: (track: any) => void;
  onOpenTrack?: (track: any) => void;
  onOpenArtist?: (artistName: string) => void;
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

export function MusicScreen({ s, C, onBack, show, onPlay, onOpenTrack, onOpenArtist }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Home");
  const [following, setFollowing] = useState(false);
  const tracks = TRACKS || [];

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
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Music</Text>
        <TouchableOpacity onPress={() => show("Music search when catalogue is live.")}>
          <Ionicons name="search" size={20} color={C.text2} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: tab === t ? C.accent : "transparent",
              borderWidth: 1,
              borderColor: tab === t ? C.accent : C.border,
            }}
          >
            <Text style={{ color: tab === t ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured artist — Figma card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => (onOpenArtist ? onOpenArtist(FEATURED.name) : show(FEATURED.name))}
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          height: 168,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: C.elevated,
        }}
      >
        <Image source={{ uri: FEATURED.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, backgroundColor: "rgba(0,0,0,0.35)", padding: 16, justifyContent: "flex-end" }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 }}>Featured Artist</Text>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 4 }}>{FEATURED.name}</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 }}>{FEATURED.meta}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => {
                const t = tracks[0] || { id: "f1", title: FEATURED.name, artist: FEATURED.name, color: "#E5C158" };
                openTrack(t);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: C.accent,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
              }}
            >
              <Ionicons name="play" size={14} color="#111" />
              <Text style={{ color: "#111", fontWeight: "800", fontSize: 13 }}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFollowing((v) => !v);
                show(following ? `Unfollowed ${FEATURED.name}` : `Following ${FEATURED.name}`);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
                backgroundColor: following ? "rgba(255,255,255,0.15)" : "transparent",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{following ? "Following" : "Follow"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Top Charts */}
      <View style={{ paddingHorizontal: 16, marginTop: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>Top Charts</Text>
        <TouchableOpacity onPress={() => setTab("Charts")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 13 }}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
        {(tab === "Charts" ? CHARTS : CHARTS.slice(0, 3)).map((row) => {
          const match = tracks.find((t: any) => String(t.title).toLowerCase().includes(row.title.toLowerCase().slice(0, 6)));
          const payload = match || { id: `c${row.rank}`, title: row.title, artist: row.artist, color: row.color };
          return (
            <TouchableOpacity
              key={row.rank}
              onPress={() => openTrack(payload)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ color: C.text3, fontWeight: "800", fontSize: 16, width: 22 }}>{row.rank}</Text>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: row.color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="musical-notes" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }}>{row.title}</Text>
                <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>{row.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => show(`More options for ${row.title}`)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="ellipsis-vertical" size={16} color={C.text3} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Genres */}
      <Text style={{ color: C.text, fontSize: 16, fontWeight: "800", paddingHorizontal: 16, marginTop: 22, marginBottom: 12 }}>
        Genres
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 }}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => show(`${g.label} catalogue when Music API is live.`)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: g.color,
            }}
          >
            <Text style={{ color: g.id === "afro" ? "#111" : "#fff", fontWeight: "800", fontSize: 14 }}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* New drops from seed */}
      {(tab === "Home" || tab === "Discover") && tracks.length > 0 ? (
        <>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "800", paddingHorizontal: 16, marginTop: 22, marginBottom: 12 }}>
            New on Kilode
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {tracks.slice(0, 8).map((t: any) => (
              <TouchableOpacity key={t.id} onPress={() => openTrack(t)} style={{ width: 120 }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 14,
                    backgroundColor: t.color || C.elevated,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
                  <View
                    style={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: C.accent,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="play" size={12} color="#111" />
                  </View>
                </View>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 8 }} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                  {t.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : null}

      {tab === "Artists" ? (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {[FEATURED.name, "Rema", "Burna Boy", "Asake", "Simi Sola"].map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => (onOpenArtist ? onOpenArtist(name) : show(name))}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: C.text, fontWeight: "800" }}>{name.slice(0, 1)}</Text>
              </View>
              <Text style={{ color: C.text, fontWeight: "700", flex: 1 }}>{name}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
