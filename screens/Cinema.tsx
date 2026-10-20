import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: W } = Dimensions.get("window");
const POSTER = (W - 32 - 20) / 3;

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
};

const TABS = ["Movies", "TV Shows", "Trailers"] as const;

const FEATURED = {
  title: "The Black Book",
  meta: "Drama · 2024 · 1h 52m",
  imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&q=80",
};

const TRENDING = [
  { id: "c1", title: "The Black Book", rating: "4.8", imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80" },
  { id: "c2", title: "Freedom Way", rating: "4.5", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80" },
  { id: "c3", title: "King of Boys", rating: "4.3", imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80" },
  { id: "c4", title: "Living in Bondage", rating: "4.1", imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80" },
];

export function CinemaScreen({ s, C, onBack, show }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Movies");

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Cinema</Text>
        <TouchableOpacity onPress={() => show("Cinema search when catalogue is live.")}>
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

      {/* Featured */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: C.elevated,
          height: 220,
        }}
      >
        <Image source={{ uri: FEATURED.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, backgroundColor: "rgba(0,0,0,0.4)", padding: 16, justifyContent: "flex-end" }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{FEATURED.title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>{FEATURED.meta}</Text>
          <TouchableOpacity
            onPress={() => show("Trailer plays when Cinema CDN is connected.")}
            style={{
              marginTop: 14,
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: C.accent,
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
            }}
          >
            <Ionicons name="play" size={16} color="#111" />
            <Text style={{ color: "#111", fontWeight: "800", fontSize: 14 }}>Watch Trailer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>
          {tab === "Trailers" ? "Latest trailers" : tab === "TV Shows" ? "Series" : "Trending Movies"}
        </Text>
        <TouchableOpacity onPress={() => show("Full catalogue when Cinema API is live.")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 13 }}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
        {TRENDING.map((m) => (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.88}
            onPress={() => show(`${m.title} · full player when Cinema is connected.`)}
            style={{ width: POSTER }}
          >
            <Image
              source={{ uri: m.imageUrl }}
              style={{ width: POSTER, height: POSTER * 1.4, borderRadius: 12, backgroundColor: C.elevated }}
              resizeMode="cover"
            />
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 8 }} numberOfLines={2}>
              {m.title}
            </Text>
            <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700", marginTop: 3 }}>★ {m.rating}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ color: C.text3, fontSize: 12, textAlign: "center", marginTop: 28, paddingHorizontal: 24 }}>
        Streaming is not connected yet. Trailers and titles are preview content only.
      </Text>
    </ScrollView>
  );
}
