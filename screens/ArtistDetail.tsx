import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TrackRecord } from "./TrackDetail";

type Props = {
  s: any;
  C: any;
  artistName: string;
  tracks: TrackRecord[];
  onBack: () => void;
  onOpenTrack: (track: TrackRecord) => void;
  onPlay: (track: TrackRecord) => void;
  show: (m: string) => void;
};

/** Dedicated artist destination under Music. */
export function ArtistDetailScreen({
  s,
  C,
  artistName,
  tracks,
  onBack,
  onOpenTrack,
  onPlay,
  show,
}: Props) {
  const discography = tracks.filter(
    (t) => t.artist.toLowerCase() === artistName.toLowerCase()
  );
  const list = discography.length ? discography : tracks.slice(0, 5);

  return (
    <ScrollView style={s.flex} contentContainerStyle={[s.scrollPad, { paddingHorizontal: 16 }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 14 }} accessibilityRole="button">
        <Text style={s.link}>‹ Music</Text>
      </TouchableOpacity>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: C.elevated,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: C.text, fontSize: 32, fontWeight: "800" }}>
            {artistName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800" }}>{artistName}</Text>
        <Text style={[s.meta, { marginTop: 6 }]}>
          {discography.length ? `${discography.length} tracks in catalogue` : "Artist profile · preview"}
        </Text>
        <TouchableOpacity
          style={[s.primaryBtn, { marginTop: 14, paddingHorizontal: 28 }]}
          onPress={() => show("Follow artists will sync when the music API is live.")}
        >
          <Text style={s.primaryBtnText}>Follow</Text>
        </TouchableOpacity>
      </View>

      <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Discography</Text>
      {list.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}
          onPress={() => onOpenTrack(t)}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              backgroundColor: t.color || C.elevated,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="musical-notes" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "700" }} numberOfLines={1}>
              {t.title}
            </Text>
            <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>{t.artist}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              onPlay(t);
              show(`Selected ${t.title}. Streaming is not connected yet.`);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-circle-outline" size={28} color={C.accent} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
