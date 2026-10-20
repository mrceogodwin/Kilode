import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { s: any; C: any; onBack: () => void; show: (m: string) => void };

const TABS = ["Discover", "My Communities"] as const;

const GROUPS = [
  {
    id: "g1",
    name: "Naija Creatives",
    meta: "12.4k members · Design & art",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80",
    color: "#E5C158",
  },
  {
    id: "g2",
    name: "Tech & Innovation",
    meta: "28.1k members · Builders",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    color: "#3B82F6",
  },
  {
    id: "g3",
    name: "Afrobeats Heads",
    meta: "45k members · Music",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    color: "#A855F7",
  },
  {
    id: "g4",
    name: "Lagos Founders",
    meta: "9.2k members · Startups",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80",
    color: "#10B981",
  },
  {
    id: "g5",
    name: "Film & Cinema NG",
    meta: "6.8k members · Nollywood",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80",
    color: "#F59E0B",
  },
];

export function CommunitiesScreen({ s, C, onBack, show }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Discover");
  const [joined, setJoined] = useState<Record<string, boolean>>({ g1: true });

  const mine = GROUPS.filter((g) => joined[g.id]);
  const list = tab === "My Communities" ? mine : GROUPS;

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
                <TouchableOpacity onPress={() => show("Create community when backend is live.")}>
          <Ionicons name="add-circle-outline" size={22} color={C.accent} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginTop: 14, gap: 8 }}>
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
            <Text style={{ color: tab === t ? "#111" : C.text2, fontWeight: "800", fontSize: 13 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {list.length === 0 ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <Ionicons name="people-outline" size={40} color={C.text3} />
          <Text style={{ color: C.text2, marginTop: 12, textAlign: "center" }}>
            You haven't joined any communities yet.
          </Text>
          <TouchableOpacity
            onPress={() => setTab("Discover")}
            style={{ marginTop: 16, backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 }}
          >
            <Text style={{ color: "#111", fontWeight: "800" }}>Discover</Text>
          </TouchableOpacity>
        </View>
      ) : (
        list.map((g) => {
          const isIn = !!joined[g.id];
          return (
            <View
              key={g.id}
              style={{
                marginHorizontal: 16,
                marginTop: 12,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View style={{ height: 88, backgroundColor: g.color }}>
                {g.imageUrl ? (
                  <Image source={{ uri: g.imageUrl }} style={{ width: "100%", height: "100%", opacity: 0.85 }} resizeMode="cover" />
                ) : null}
              </View>
              <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "800", fontSize: 16 }}>{g.name}</Text>
                  <Text style={{ color: C.text3, fontSize: 12, marginTop: 3 }}>{g.meta}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setJoined((p) => ({ ...p, [g.id]: !p[g.id] }));
                    show(isIn ? `Left ${g.name}` : `Joined ${g.name}`);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 999,
                    backgroundColor: isIn ? C.elevated : C.accent,
                    borderWidth: 1,
                    borderColor: isIn ? C.border : C.accent,
                  }}
                >
                  <Text style={{ color: isIn ? C.text : "#111", fontWeight: "800", fontSize: 13 }}>
                    {isIn ? "Joined" : "Join"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
