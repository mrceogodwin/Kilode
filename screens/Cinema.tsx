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

  const watching = FILMS[0];

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.deskHero}>
        <Text style={s.deskHeroIcon}>🎬</Text>
        <Text style={s.h1}>Cinema</Text>
        <Text style={s.sub}>Vote · discover · Friday screenings</Text>
      </View>

      {/* Watching Now hero */}
      <TouchableOpacity
        style={[s.postCard, { backgroundColor: "#111" }]}
        onPress={() => {
          setPlaying(watching);
          show(`Playing ${watching.title}`);
        }}
      >
        <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>WATCHING NOW</Text>
        <View
          style={{
            height: 140,
            borderRadius: 14,
            backgroundColor: "#1a1a1a",
            marginTop: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 42 }}>▶</Text>
        </View>
        <Text style={[s.roomName, { color: "#fff", marginTop: 10 }]}>{watching.title}</Text>
        <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 4 }}>
          {watching.runtime} · {watching.synopsis}
        </Text>
      </TouchableOpacity>

      {playing && playing.id !== watching.id ? (
        <View style={[s.postCard, { backgroundColor: "#0a0a0a" }]}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Now playing · {playing.title}</Text>
          <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setPlaying(null)}>
            <Text style={s.link}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>This week</Text>
        <TouchableOpacity onPress={() => show("Submit film · cinema poster")}> 
          <Text style={s.link}>Submit</Text>
        </TouchableOpacity>
      </View>

      {FILMS.map((f) => (
        <View key={f.id} style={s.postCard}>
          <Text style={s.roomName}>{f.title}</Text>
          <Text style={s.meta}>
            {f.runtime} · {votes[f.id]} votes
          </Text>
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
