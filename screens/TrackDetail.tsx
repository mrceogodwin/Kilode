import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type TrackRecord = {
  id: string;
  title: string;
  artist: string;
  color?: string;
  plays?: string;
};

type Props = {
  s: any;
  C: any;
  track: TrackRecord;
  related?: TrackRecord[];
  onBack: () => void;
  onPlay: (track: TrackRecord) => void;
  onOpenArtist: (artistName: string) => void;
  onOpenTrack: (track: TrackRecord) => void;
  show: (m: string) => void;
};

/** Dedicated track destination — not the Music landing page. */
export function TrackDetailScreen({
  s,
  C,
  track,
  related = [],
  onBack,
  onPlay,
  onOpenArtist,
  onOpenTrack,
  show,
}: Props) {
  return (
    <ScrollView style={s.flex} contentContainerStyle={[s.scrollPad, { paddingHorizontal: 16 }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 14 }} accessibilityRole="button">
        <Text style={s.link}>‹ Music</Text>
      </TouchableOpacity>

      <View
        style={{
          height: 220,
          borderRadius: 18,
          backgroundColor: track.color || C.elevated,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.9)" />
      </View>

      <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 }}>{track.title}</Text>
      <TouchableOpacity onPress={() => onOpenArtist(track.artist)} accessibilityRole="button">
        <Text style={{ color: C.accent, fontSize: 15, fontWeight: "700", marginTop: 6 }}>{track.artist}</Text>
      </TouchableOpacity>
      {track.plays ? <Text style={[s.meta, { marginTop: 6 }]}>{track.plays} plays · catalogue preview</Text> : null}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
        <TouchableOpacity
          style={[s.primaryBtn, { flex: 1 }]}
          onPress={() => {
            onPlay(track);
            show(`Selected ${track.title}. Streaming is not connected yet.`);
          }}
          accessibilityRole="button"
        >
          <Text style={s.primaryBtnText}>Select track</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.ghostBtn, { paddingHorizontal: 16 }]}
          onPress={() => show("Save/favourites will sync when the music API is live.")}
        >
          <Ionicons name="heart-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <Text style={[s.sectionTitle, { marginTop: 28, marginBottom: 12 }]}>More like this</Text>
      {related
        .filter((r) => r.id !== track.id)
        .slice(0, 6)
        .map((r) => (
          <TouchableOpacity
            key={r.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}
            onPress={() => onOpenTrack(r)}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: r.color || C.elevated,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="musical-note" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
                {r.title}
              </Text>
              <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                {r.artist}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.text3} />
          </TouchableOpacity>
        ))}

      <Text style={[s.meta, { marginTop: 16, marginBottom: 24 }]}>
        Audio streams and charts require the live music catalogue API.
      </Text>
    </ScrollView>
  );
}
