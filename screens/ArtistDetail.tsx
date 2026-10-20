import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isFollowingArtist, toggleArtistFollow } from "../lib/supabase";
import type { TrackRecord } from "./TrackDetail";

type Props = {
  s: any;
  C: any;
  artist: any;
  tracks: TrackRecord[];
  userId?: string;
  onBack: () => void;
  onOpenTrack: (track: TrackRecord) => void;
  onPlay: (track: TrackRecord) => void;
  show: (m: string) => void;
};

/** Artist destination. Only matching tracks are shown; never fill discography with unrelated content. */
export function ArtistDetailScreen({ s, C, artist, tracks, userId, onBack, onOpenTrack, onPlay, show }: Props) {
  const artistName = typeof artist === "string" ? artist : (artist?.display_name || artist?.handle || "Artist");
  const artistId = typeof artist === "object" && artist ? artist.id : undefined;
  const avatar = typeof artist === "object" && artist ? artist.avatar_url : undefined;
  const bio = typeof artist === "object" && artist ? artist.bio : undefined;
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followReady, setFollowReady] = useState(false);
  const discography = tracks.filter((t) => String(t.artist || "").toLowerCase() === artistName.toLowerCase());

  useEffect(() => {
    let active = true;
    setFollowReady(false);
    if (!artistId || !userId) { setFollowing(false); setFollowReady(true); return () => { active = false; }; }
    isFollowingArtist(userId, artistId).then((result) => {
      if (!active) return;
      setFollowing(result.ok && result.following);
      setFollowReady(true);
    }).catch(() => { if (active) setFollowReady(true); });
    return () => { active = false; };
  }, [artistId, userId]);

  const handleFollow = async () => {
    if (!userId) { show("Sign in to follow artists."); return; }
    if (!artistId) { show("This artist profile is not linked to a live account yet."); return; }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const result = await toggleArtistFollow(userId, artistId);
      if (!result.ok || typeof result.following !== "boolean") {
        show(result.error || "Could not update your follow. Please try again.");
        return;
      }
      setFollowing(result.following);
      show(result.following ? `Following ${artistName}` : `Unfollowed ${artistName}`);
    } catch {
      show("Could not update your follow. Check your connection and retry.");
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={[s.scrollPad, { paddingHorizontal: 16 }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 14 }} accessibilityRole="button">
        <Text style={s.link}>‹ Music</Text>
      </TouchableOpacity>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        {avatar ? <Image source={{ uri: avatar }} style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.elevated, marginBottom: 12 }} /> : (
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Text style={{ color: C.text, fontSize: 32, fontWeight: "800" }}>{artistName.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800" }}>{artistName}</Text>
        {typeof artist === "object" && artist?.handle ? <Text style={[s.meta, { marginTop: 4 }]}>@{artist.handle}</Text> : null}
        {bio ? <Text style={{ color: C.text2, textAlign: "center", fontSize: 13, lineHeight: 19, marginTop: 8 }}>{bio}</Text> : null}
        <Text style={[s.meta, { marginTop: 6 }]}>{discography.length ? `${discography.length} matching tracks` : "No published tracks available here yet"}</Text>
        <TouchableOpacity disabled={followLoading || !followReady} style={[s.primaryBtn, { marginTop: 14, paddingHorizontal: 28, opacity: followLoading || !followReady ? 0.65 : 1 }]} onPress={handleFollow} accessibilityRole="button">
          {followLoading ? <ActivityIndicator color="#111" /> : <Text style={s.primaryBtnText}>{following ? "Following" : "Follow"}</Text>}
        </TouchableOpacity>
      </View>
      <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Discography</Text>
      {discography.map((t) => (
        <View key={t.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => onOpenTrack(t)} style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
            {(t as any).imageUrl || (t as any).cover_url ? <Image source={{ uri: (t as any).imageUrl || (t as any).cover_url }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: t.color || C.elevated }} /> : (
              <View style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="musical-notes" size={20} color="#fff" /></View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "700" }} numberOfLines={1}>{t.title}</Text>
              <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>{t.artist}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onPlay(t); show(`Selected ${t.title}. Streaming is not connected yet.`); }} accessibilityRole="button" accessibilityLabel={`Play ${t.title}`} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="play-circle-outline" size={28} color={C.accent} />
          </TouchableOpacity>
        </View>
      ))}
      {!discography.length ? <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18 }}>Only tracks explicitly matched to this artist are shown. Published catalogue integration is still pending.</Text> : null}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
