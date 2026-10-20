import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { can } from "../lib/permissions";

const { width: W } = Dimensions.get("window");
const POSTER = (W - 32 - 20) / 3;

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  accountKind?: string;
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

export function CinemaScreen({ s, C, onBack, show, accountKind }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Movies");
  const canSubmit = can(accountKind, "cinema_submit");

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Cinema</Text>
        <TouchableOpacity
          onPress={() =>
            canSubmit
              ? show("Submit film URL when Cinema API is live.")
              : show("Cinema Poster accounts can submit films.")
          }
        >
          <Ionicons name="add-circle-outline" size={22} color={canSubmit ? C.accent : C.text3} />
        </TouchableOpacity>
      </View>

      {canSubmit ? (
        <TouchableOpacity
          onPress={() => show("Submit movie when Cinema API is live.")}
          style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={{ color: "#111", fontWeight: "800", fontSize: 14 }}>Submit a film</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginTop: 12, gap: 8 }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: tab === t ? C.accent : C.elevated,
              borderWidth: 1,
              borderColor: tab === t ? C.accent : C.border,
            }}
          >
            <Text style={{ color: tab === t ? "#111" : C.text2, fontWeight: "800", fontSize: 12 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
        <Image source={{ uri: FEATURED.imageUrl }} style={{ width: "100%", height: 200 }} resizeMode="cover" />
        <View style={{ padding: 14 }}>
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 18 }}>{FEATURED.title}</Text>
          <Text style={{ color: C.text3, marginTop: 4, fontSize: 13 }}>{FEATURED.meta}</Text>
          <TouchableOpacity
            onPress={() => show("Trailer plays when Cinema CDN is connected.")}
            style={{ marginTop: 12, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#111", fontWeight: "800", fontSize: 14 }}>Watch Trailer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 20, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", flex: 1 }}>Trending</Text>
        <TouchableOpacity onPress={() => show("Full catalogue when Cinema API is live.")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginTop: 10, gap: 10 }}>
        {TRENDING.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => show(`${m.title} · full player when Cinema is connected.`)}
            style={{ width: POSTER }}
          >
            <Image source={{ uri: m.imageUrl }} style={{ width: POSTER, height: POSTER * 1.4, borderRadius: 12, backgroundColor: C.elevated }} resizeMode="cover" />
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 6 }} numberOfLines={2}>{m.title}</Text>
            <Text style={{ color: C.text3, fontSize: 11 }}>★ {m.rating}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
