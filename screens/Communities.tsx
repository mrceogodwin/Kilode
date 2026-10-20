import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { s: any; C: any; onBack: () => void; show: (m: string) => void };

const COMMUNITIES = [
  { id: "c1", name: "Naija Creatives", members: "12.4k", color: "#22C55E", imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&q=80" },
  { id: "c2", name: "Tech & Innovation", members: "8.7k", color: "#3B82F6", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&q=80" },
  { id: "c3", name: "Music Lovers", members: "15.2k", color: "#F59E0B", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80" },
  { id: "c4", name: "Business & Startups", members: "10.1k", color: "#8B5CF6", imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&q=80" },
  { id: "c5", name: "Fashion & Style", members: "9.8k", color: "#EC4899", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=120&q=80" },
  { id: "c6", name: "Travel Nigeria", members: "6.3k", color: "#14B8A6", imageUrl: "https://images.unsplash.com/photo-1523805005080-653759a082e1?w=120&q=80" },
];

export function CommunitiesScreen({ s, C, onBack, show }: Props) {
  const [tab, setTab] = useState<"discover" | "mine">("discover");
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: C.accent, fontWeight: "600" }}>‹ Home</Text></TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Communities</Text>
        <Ionicons name="search" size={20} color={C.text2} />
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginTop: 14, gap: 8 }}>
        {(["discover", "mine"] as const).map((t) => (
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
            <Text style={{ color: tab === t ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>
              {t === "discover" ? "Discover" : "My Communities"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(tab === "discover" ? COMMUNITIES : COMMUNITIES.filter((c) => joined[c.id])).map((c) => (
        <View
          key={c.id}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            padding: 12,
            borderRadius: 16,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {c.imageUrl ? (
            <Image source={{ uri: c.imageUrl }} style={{ width: 48, height: 48, borderRadius: 14 }} />
          ) : (
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.color }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{c.name}</Text>
            <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>{c.members} members</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setJoined((p) => ({ ...p, [c.id]: !p[c.id] }));
              show(joined[c.id] ? `Left ${c.name}` : `Joined ${c.name}`);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: joined[c.id] ? C.elevated : C.accent,
              borderWidth: 1,
              borderColor: joined[c.id] ? C.border : C.accent,
            }}
          >
            <Text style={{ color: joined[c.id] ? C.text : "#111", fontWeight: "800", fontSize: 12 }}>
              {joined[c.id] ? "Joined" : "Join"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {tab === "mine" && !Object.values(joined).some(Boolean) ? (
        <Text style={{ color: C.text2, textAlign: "center", marginTop: 40 }}>Join a community to see it here.</Text>
      ) : null}
    </ScrollView>
  );
}
