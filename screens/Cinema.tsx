import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.deskHero}>
        <Text style={s.deskHeroIcon}>🎬</Text>
        <Text style={s.h1}>Cinema</Text>
        <Text style={s.sub}>Vote · discover · Friday screenings</Text>
      </View>

      {playing ? (
        <View style={[s.deskHero, { marginTop: 8, backgroundColor: "#000" }]}>
          <View style={{ width: "100%", height: 160, backgroundColor: "#111", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: 40 }}>▶</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{playing.title}</Text>
          </View>
          <Text style={[s.h2, { color: "#fff" }]}>{playing.title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{playing.runtime} · {playing.synopsis}</Text>
          <TouchableOpacity
            style={[s.ghostBtn, { marginTop: 14, borderColor: "rgba(255,255,255,0.3)" }]}
            onPress={() => {
              setPlaying(null);
              show("Stopped");
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Close player</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>This week</Text>
      </View>
      {FILMS.map((f) => (
        <View key={f.id} style={s.postCard}>
          <Text style={s.roomName}>{f.title}</Text>
          <Text style={s.meta}>{f.runtime} · {votes[f.id]} votes</Text>
          <Text style={[s.postBody, { marginTop: 6 }]}>{f.synopsis}</Text>
          <View style={[s.rowGap, { marginTop: 12, paddingHorizontal: 0 }]}>
            <TouchableOpacity
              style={[s.primaryBtn, { flex: 1 }]}
              onPress={() => {
                setPlaying(f);
                show(`Playing ${f.title}`);
              }}
            >
              <Text style={s.primaryBtnText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.ghostBtn}
              onPress={() => {
                setVotes((v) => ({ ...v, [f.id]: (v[f.id] || 0) + 1 }));
                show("Vote counted");
              }}
            >
              <Text style={s.ghostBtnText}>Vote</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={[s.ghostBtn, { marginHorizontal: 14, alignItems: "center", marginTop: 12 }]} onPress={onBack}>
        <Text style={s.ghostBtnText}>Back home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
