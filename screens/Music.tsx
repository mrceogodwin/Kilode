import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { TRACKS } from "../data";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  onPlay: (track: any) => void;
};

const CHARTS = [
  { rank: 1, title: "Ojuelegba Nights", artist: "Simi Sola", plays: "12.4k" },
  { rank: 2, title: "Danfo Dreams", artist: "Kemi Wave", plays: "9.1k" },
  { rank: 3, title: "Eko Energy", artist: "Femi + Liza", plays: "7.8k" },
  { rank: 4, title: "Water & Light", artist: "Ayo Blue", plays: "6.2k" },
  { rank: 5, title: "Island Rain", artist: "Bola Keys", plays: "5.1k" },
];

const ARTISTS = [
  { id: "a1", name: "Simi Sola", meta: "Afrobeats · Lagos", color: "#F97316" },
  { id: "a2", name: "Kemi Wave", meta: "Amapiano · PH", color: "#7C3AED" },
  { id: "a3", name: "Ayo Blue", meta: "R&B · Abuja", color: "#2563EB" },
];

export function MusicScreen({ s, C, onBack, show, onPlay }: Props) {
  const [tab, setTab] = useState<"new" | "charts" | "artists">("new");

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.deskHero}>
        <Text style={s.deskHeroIcon}>🎵</Text>
        <Text style={s.h1}>Music</Text>
        <Text style={s.sub}>Drops · charts · artists</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {(["new", "charts", "artists"] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipOn]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextOn]}>
              {t === "new" ? "New drops" : t === "charts" ? "Charts" : "Artists"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === "new" ? (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>This week</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
            {TRACKS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[s.trackCard, { backgroundColor: t.color || C.accent }]}
                onPress={() => {
                  show(`Selected “${t.title}”. Audio playback is not connected in this preview yet.`);
                }}
              >
                <Text style={s.trackPlay}>▶</Text>
                <Text style={s.trackTitle} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={s.trackArtist} numberOfLines={1}>
                  {t.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Push a link</Text>
          </View>
          <TouchableOpacity style={[s.primaryBtn, { marginHorizontal: 14 }]} onPress={() => show("Track submission and paid promotion need the music and payment services connected.")}> 
            <Text style={s.primaryBtnText}>Submit track URL</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {tab === "charts" ? (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Naija charts</Text>
          </View>
          {CHARTS.map((c) => (
            <TouchableOpacity
              key={c.rank}
              style={s.roomRow}
              onPress={() => {
                show(`Selected “${c.title}”. Audio playback is not connected in this preview yet.`);
              }}
            >
              <View style={[s.roomAv, { backgroundColor: C.elevated }]}>
                <Text style={s.roomAvText}>{c.rank}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.roomName}>{c.title}</Text>
                <Text style={s.meta}>{c.artist}</Text>
              </View>
              <Text style={[s.meta, { fontWeight: "700", color: C.accent }]}>{c.plays}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      {tab === "artists" ? (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Featured artists</Text>
          </View>
          {ARTISTS.map((a) => (
            <TouchableOpacity key={a.id} style={s.roomRow} onPress={() => show(`${a.name} · artist profiles and follow sync are not connected yet.`)}>
              <View style={[s.roomAv, { backgroundColor: a.color }]}>
                <Text style={[s.roomAvText, { color: "#fff" }]}>{a.name.slice(0, 1)}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.roomName}>{a.name}</Text>
                <Text style={s.meta}>{a.meta}</Text>
              </View>
              <View style={s.followBtn}>
                <Text style={s.followBtnText}>Follow</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      <TouchableOpacity style={[s.ghostBtn, { marginHorizontal: 14, alignItems: "center", marginTop: 16 }]} onPress={onBack}>
        <Text style={s.ghostBtnText}>Back home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
