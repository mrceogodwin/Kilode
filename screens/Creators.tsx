import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: W } = Dimensions.get("window");
const TILE = (W - 32 - 8) / 2;

type Props = { s: any; C: any; onBack: () => void; show: (m: string) => void };

const CREATORS = [
  {
    id: "c1",
    name: "Layi Wasabi",
    handle: "layiwasabi",
    meta: "Comedy · 1.2M followers",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
  },
  {
    id: "c2",
    name: "Bimpe Artistry",
    handle: "bimpeart",
    meta: "Makeup · 480k followers",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    cover: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
  },
  {
    id: "c3",
    name: "DJ Cuppy",
    handle: "djcuppy",
    meta: "Music · 3.1M followers",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
  },
  {
    id: "c4",
    name: "Mr Macaroni",
    handle: "mrmacaroni",
    meta: "Comedy · 2.4M followers",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    cover: "https://images.unsplash.com/photo-1516280440614-6697288d5b28?w=600&q=80",
  },
];

const CLIPS = [
  { id: "v1", title: "Studio session", imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80" },
  { id: "v2", title: "Lagos night",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80" },
  { id: "v3", title: "Behind the scenes", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80" },
  { id: "v4", title: "Live set", imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" },
];

export function CreatorsScreen({ s, C, onBack, show }: Props) {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Creators</Text>
        <TouchableOpacity onPress={() => show("Creator search when index is live.")}>
          <Ionicons name="search" size={20} color={C.text2} />
        </TouchableOpacity>
      </View>

      <Text style={{ color: C.text2, fontSize: 13, paddingHorizontal: 16, marginTop: 8 }}>
        Discover Nigerian creators across comedy, music, beauty and more.
      </Text>

      {CREATORS.map((c) => {
        const on = !!following[c.id];
        return (
          <View
            key={c.id}
            style={{
              marginHorizontal: 16,
              marginTop: 14,
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Image source={{ uri: c.cover }} style={{ width: "100%", height: 100 }} resizeMode="cover" />
            <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={{ uri: c.avatar }} style={{ width: 52, height: 52, borderRadius: 26, marginTop: -28, borderWidth: 2, borderColor: C.card }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{c.name}</Text>
                <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>@{c.handle}</Text>
                <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>{c.meta}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setFollowing((p) => ({ ...p, [c.id]: !p[c.id] }));
                  show(on ? `Unfollowed ${c.name}` : `Following ${c.name}`);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: on ? C.elevated : C.accent,
                  borderWidth: 1,
                  borderColor: on ? C.border : C.accent,
                }}
              >
                <Text style={{ color: on ? C.text : "#111", fontWeight: "800", fontSize: 12 }}>
                  {on ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Text style={{ color: C.text, fontSize: 16, fontWeight: "800", paddingHorizontal: 16, marginTop: 22, marginBottom: 12 }}>
        Creator clips
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 }}>
        {CLIPS.map((v) => (
          <TouchableOpacity
            key={v.id}
            activeOpacity={0.88}
            onPress={() => show(`${v.title} · player when Creator CDN is live.`)}
            style={{ width: TILE }}
          >
            <Image
              source={{ uri: v.imageUrl }}
              style={{ width: TILE, height: TILE * 1.15, borderRadius: 12, backgroundColor: C.elevated }}
              resizeMode="cover"
            />
            <View
              style={{
                position: "absolute",
                right: 8,
                bottom: 28,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "rgba(0,0,0,0.55)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="play" size={12} color="#fff" />
            </View>
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 6 }} numberOfLines={1}>
              {v.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
