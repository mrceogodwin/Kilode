import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FILMS } from "../data";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
};

export function CinemaScreen({ s, C, onBack, show }: Props) {
  const [playing, setPlaying] = useState<(typeof FILMS)[0] | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(FILMS.map((f) => [f.id, f.votes]))
  );

  const featured = FILMS[0];
  const rest = FILMS.slice(1);

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={[s.scrollPad, { paddingHorizontal: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }} accessibilityRole="button">
        <Text style={s.link}>‹ Home</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 13, fontWeight: "600", color: C.text3, letterSpacing: 0.4, textTransform: "uppercase" }}>
        Entertainment
      </Text>
      <Text style={[s.h1, { marginTop: 4 }]}>Cinema</Text>
      <Text style={[s.sub, { marginBottom: 16 }]}>Vote · discover · Friday screenings</Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setPlaying(featured);
          show(`Trailer for ${featured.title} is not connected yet.`);
        }}
        style={{ marginBottom: 20 }}
      >
        <View
          style={{
            height: 200,
            borderRadius: 16,
            backgroundColor: C.elevated,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Ionicons name="play-circle" size={56} color={C.accent} />
          <Text
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              fontSize: 10,
              fontWeight: "700",
              color: C.accent,
              letterSpacing: 0.8,
            }}
          >
            FEATURED
          </Text>
        </View>
        <Text style={[s.roomName, { marginTop: 10, fontSize: 17 }]}>{featured.title}</Text>
        <Text style={[s.meta, { marginTop: 4, lineHeight: 18 }]}>
          {featured.runtime} · {featured.synopsis}
        </Text>
      </TouchableOpacity>

      {playing ? (
        <View
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: C.elevated,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Text style={{ color: C.text, fontWeight: "700" }}>Selected · {playing.title}</Text>
          <Text style={{ color: C.text2, marginTop: 6, fontSize: 13, lineHeight: 19 }}>
            Video playback is not connected yet. Selection only.
          </Text>
          <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setPlaying(null)}>
            <Text style={s.link}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={[s.sectionTitle, { marginBottom: 12 }]}>This week</Text>
      {rest.map((f) => (
        <TouchableOpacity
          key={f.id}
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 14,
            alignItems: "center",
          }}
          onPress={() => {
            setPlaying(f);
            show(`Trailer for ${f.title} is not connected yet.`);
          }}
        >
          <View
            style={{
              width: 64,
              height: 88,
              borderRadius: 10,
              backgroundColor: C.elevated,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="film-outline" size={22} color={C.text3} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.roomName} numberOfLines={2}>
              {f.title}
            </Text>
            <Text style={s.meta} numberOfLines={2}>
              {f.runtime} · {f.synopsis}
            </Text>
            <TouchableOpacity
              style={{ marginTop: 6, alignSelf: "flex-start" }}
              onPress={() => {
                setVotes((v) => ({ ...v, [f.id]: (v[f.id] || 0) + 1 }));
                show("Vote saved on device");
              }}
            >
              <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>
                Vote · {votes[f.id] ?? f.votes}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
