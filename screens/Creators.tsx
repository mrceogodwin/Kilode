import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { s: any; C: any; onBack: () => void; show: (m: string) => void };

const FILTERS = ["Featured", "Beauty", "Comedy", "Lifestyle"];

const CREATORS = [
  {
    id: "cr1",
    name: "Layi Wasabi",
    role: "Content Creator · 1.2M followers",
    bio: "Funny videos, real life, no filters. 🇳🇬",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    clips: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    ],
    views: ["124k", "98k"],
  },
  {
    id: "cr2",
    name: "Bimpe Artistry",
    role: "Beauty Creator · 856k followers",
    bio: "Skincare | Beauty | Lifestyle ✨",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80",
    clips: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80",
    ],
    views: ["88k", "72k"],
  },
];

export function CreatorsScreen({ s, C, onBack, show }: Props) {
  const [filter, setFilter] = useState("Featured");
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: C.accent, fontWeight: "600" }}>‹ Home</Text></TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Creators</Text>
        <Ionicons name="search" size={20} color={C.text2} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: filter === f ? C.accent : "transparent",
              borderWidth: 1,
              borderColor: filter === f ? C.accent : C.border,
            }}
          >
            <Text style={{ color: filter === f ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {CREATORS.map((cr) => (
        <View
          key={cr.id}
          style={{
            marginHorizontal: 16,
            marginTop: 14,
            padding: 14,
            borderRadius: 18,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image source={{ uri: cr.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{cr.name}</Text>
              <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>{cr.role}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setFollowing((p) => ({ ...p, [cr.id]: !p[cr.id] }));
                show(following[cr.id] ? `Unfollowed ${cr.name}` : `Following ${cr.name}`);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: following[cr.id] ? C.border : C.accent,
                backgroundColor: following[cr.id] ? C.elevated : "transparent",
              }}
            >
              <Text style={{ color: following[cr.id] ? C.text : C.accent, fontWeight: "700", fontSize: 12 }}>
                {following[cr.id] ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: C.text2, fontSize: 13, marginTop: 10 }}>{cr.bio}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            {cr.clips.map((uri, i) => (
              <TouchableOpacity key={i} style={{ flex: 1, height: 120, borderRadius: 12, overflow: "hidden" }} onPress={() => show("Creator clip playback when media CDN is connected.")}>
                <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                <View style={{ position: "absolute", bottom: 6, left: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="play" size={12} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{cr.views[i]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
