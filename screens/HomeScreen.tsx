import React from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LISTINGS, STORIES } from "../data";
import { playMusicTrack } from "../lib/musicPlayer";

type Props = {
  s: any;
  C: any;
  takes: any[];
  tracks: any[];
  news: any[];
  rooms: any[];
  homeChip: number;
  setHomeChip: (n: number) => void;
  slide: number;
  setSlide: (n: number) => void;
  joined: Record<string, boolean>;
  setJoined: (j: Record<string, boolean>) => void;
  refreshing: boolean;
  onRefresh: () => void;
  go: (t: string) => void;
  show: (m: string) => void;
  setMoreOpen: (v: boolean) => void;
  setComposeOpen: (v: boolean) => void;
  setSelectedProfile: (p: any) => void;
  setSelectedArticleId: (id: string | null) => void;
};

export function HomeScreen({
  s, C, takes, tracks, news, rooms, joined, setJoined, refreshing, onRefresh,
  go, show, setMoreOpen, setComposeOpen, setSelectedProfile, setSelectedArticleId,
}: Props) {
  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;
  const featuredTrack = tracks[0];
  const featuredTake = takes[0];
  const featuredNews = news[0];
  const events = LISTINGS.events || [];
  const products = LISTINGS.market || [];

  const section = (title: string, action: string, onPress: () => void, icon?: string) => (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon ? <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: C.accentSoft }}><Text style={{ color: C.accent, fontSize: 15 }}>{icon}</Text></View> : null}
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25 }}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={action + " " + title}>
        <Text style={{ color: C.text2, fontSize: 12, fontWeight: "600" }}>{action} ›</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={rc}
    >
      {/* Stories: compact, familiar and immediately interactive. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 13, paddingBottom: 12 }}>
        {STORIES.map((st, index) => (
          <TouchableOpacity
            key={st.id}
            style={{ alignItems: "center", width: 52 }}
            onPress={() => st.id === "s0" ? setComposeOpen(true) : setSelectedProfile({ name: st.label, handle: st.label.toLowerCase(), role: "Kilode member" })}
            accessibilityRole="button"
            accessibilityLabel={st.id === "s0" ? "Add a story" : st.label + "'s story"}
          >
            <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: C.accent, padding: 2 }}>
              <View style={{ flex: 1, borderRadius: 23, backgroundColor: index === 0 ? C.elevated : ["#382451", "#173A5A", "#543024", "#2D463D"][index % 4], alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: C.text, fontSize: index === 0 ? 25 : 17, fontWeight: "700" }}>{st.av}</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={{ color: C.text2, fontSize: 11, marginTop: 5, fontWeight: "500" }}>{st.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slim post composer. */}
      <TouchableOpacity
        onPress={() => setComposeOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Create a post"
        style={{ marginHorizontal: 14, marginBottom: 14, padding: 9, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: C.accent, fontWeight: "800", fontSize: 14 }}>K!</Text>
        </View>
        <Text style={{ color: C.text3, fontSize: 14, flex: 1 }}>What’s on your mind?</Text>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#17130A", fontSize: 16, fontWeight: "800" }}>↗</Text>
        </View>
      </TouchableOpacity>

      {/* One strong music feature replaces the tall, rotating generic banner. */}
      {featuredTrack ? (
        <View
          style={{ marginHorizontal: 14, marginBottom: 18, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: C.border }}
        >
          <LinearGradient colors={["#31134C", "#171020", C.card]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 142, padding: 16, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ alignSelf: "flex-start", borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: "rgba(255,255,255,0.12)", marginBottom: 10 }}>
                <Text style={{ color: "#F3D777", fontSize: 11, fontWeight: "700" }}>♫  MUSIC SPOTLIGHT</Text>
              </View>
              <Text numberOfLines={2} style={{ color: "#FFFFFF", fontSize: 22, lineHeight: 26, fontWeight: "800", letterSpacing: -0.5 }}>{featuredTrack.title}</Text>
              <Text numberOfLines={1} style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, marginTop: 3 }}>{featuredTrack.artist || "Kilode Music"}</Text>
              <TouchableOpacity
                onPress={async () => {
                  const result = await playMusicTrack(featuredTrack);
                  if (!result.ok) show(result.message || "Playback unavailable.");
                  else show("Playing " + featuredTrack.title);
                }}
                style={{ alignSelf: "flex-start", marginTop: 12, backgroundColor: C.accent, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 8 }}
              >
                <Text style={{ color: "#17130A", fontSize: 12, fontWeight: "800" }}>▶  Play track</Text>
              </TouchableOpacity>
            </View>
            <LinearGradient colors={["#E5C158", "#A64BCE", "#31134C"]} style={{ width: 104, height: 104, borderRadius: 15, alignItems: "center", justifyContent: "center", transform: [{ rotate: "3deg" }] }}>
              <View style={{ width: 66, height: 66, borderRadius: 33, borderWidth: 1, borderColor: "rgba(255,255,255,0.6)", backgroundColor: "rgba(10,10,10,0.52)", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#FFFFFF", fontSize: 34 }}>♫</Text>
              </View>
            </LinearGradient>
          </LinearGradient>
        </View>
      ) : null}

      {/* Trending tracks: one short horizontal strip. */}
      {tracks.length > 0 ? (
        <View style={{ marginBottom: 18 }}>
          <View style={{ paddingHorizontal: 16 }}>
            {section("Trending Music", "See all", () => go("music"), "♫")}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
            {tracks.slice(0, 8).map((track: any, index: number) => (
              <TouchableOpacity
                key={track.id || track.title}
                onPress={async () => {
                  const result = await playMusicTrack(track);
                  if (!result.ok) show(result.message || "Playback unavailable.");
                  else show("Playing " + track.title);
                }}
                style={{ width: 124 }}
                accessibilityRole="button"
                accessibilityLabel={"Play " + track.title}
              >
                <LinearGradient colors={[track.color || "#5B2B82", C.card]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 104, borderRadius: 13, padding: 9, justifyContent: "space-between", overflow: "hidden" }}>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700" }}>#{index + 1}</Text>
                  <View style={{ alignSelf: "flex-end", width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 12 }}>▶</Text>
                  </View>
                </LinearGradient>
                <Text numberOfLines={1} style={{ color: C.text, fontSize: 12, fontWeight: "700", marginTop: 6 }}>{track.title}</Text>
                <Text numberOfLines={1} style={{ color: C.text2, fontSize: 11, marginTop: 2 }}>{track.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* One compact social card, with the existing post/media actions kept connected. */}
      {featuredTake ? (
        <View style={{ marginHorizontal: 14, marginBottom: 18, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          {section("From Your People", "Open Socials", () => go("socials"), "◉")}
          <TouchableOpacity onPress={() => go("socials")} activeOpacity={0.85} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: C.accent, fontWeight: "800" }}>{String(featuredTake.name || "K").slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>{featuredTake.name || "Kilode member"}</Text>
              <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }}>{featuredTake.time || "Recently"} · {featuredTake.role || "Socials"}</Text>
            </View>
            <Text style={{ color: C.text3, fontSize: 18 }}>···</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => go("socials")} style={{ marginTop: 9 }}>
            <Text numberOfLines={3} style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{featuredTake.text}</Text>
          </TouchableOpacity>
          {featuredTake.mediaUrl ? (
            <TouchableOpacity onPress={() => go("socials")} activeOpacity={0.9} style={{ marginTop: 10 }}>
              <Image source={{ uri: featuredTake.mediaUrl }} resizeMode="cover" style={{ width: "100%", height: 142, borderRadius: 12, backgroundColor: C.elevated }} />
            </TouchableOpacity>
          ) : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 18, marginTop: 10 }}>
            <Text style={{ color: C.text2, fontSize: 12 }}>♡  {featuredTake.likes || 0}</Text>
            <Text style={{ color: C.text2, fontSize: 12 }}>○  {featuredTake.comments || 0}</Text>
            <TouchableOpacity onPress={() => go("socials")}><Text style={{ color: C.text2, fontSize: 12 }}>↗  Share</Text></TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Media stays compact and opens the existing Media screen. */}
      {featuredNews ? (
        <View style={{ marginHorizontal: 14, marginBottom: 18 }}>
          {section("Media", "All stories", () => go("media"), "▤")}
          <TouchableOpacity onPress={() => { setSelectedArticleId(String(featuredNews.id)); go("media"); }} activeOpacity={0.88} style={{ flexDirection: "row", gap: 11, padding: 10, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
            {featuredNews.imageUrl ? (
              <Image source={{ uri: featuredNews.imageUrl }} resizeMode="cover" style={{ width: 94, height: 88, borderRadius: 10, backgroundColor: featuredNews.tone || C.elevated }} />
            ) : (
              <LinearGradient colors={[featuredNews.tone || "#42331A", C.elevated]} style={{ width: 94, height: 88, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: C.text, fontSize: 24 }}>▤</Text>
              </LinearGradient>
            )}
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "700", marginBottom: 4 }}>{featuredNews.kicker || "FEATURED"}</Text>
              <Text numberOfLines={3} style={{ color: C.text, fontSize: 13, lineHeight: 18, fontWeight: "700" }}>{featuredNews.title}</Text>
              <Text style={{ color: C.text3, fontSize: 11, marginTop: 5 }}>{featuredNews.time || "Latest"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Events and Market use their existing desk data and route to their own systems. */}
      {events.length > 0 ? (
        <View style={{ marginHorizontal: 14, marginBottom: 18 }}>
          {section("Upcoming Events", "See all", () => go("events"), "▣")}
          <TouchableOpacity onPress={() => go("events")} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
            <LinearGradient colors={["#5C247E", "#D04A9A"]} style={{ width: 58, height: 62, borderRadius: 11, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}>{events[0].tag || "EVENT"}</Text>
              <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "800" }}>♪</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>{events[0].title}</Text>
              <Text numberOfLines={2} style={{ color: C.text2, fontSize: 12, marginTop: 3 }}>{events[0].meta}</Text>
            </View>
            <Text style={{ color: C.text2, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {products.length > 0 ? (
        <View style={{ marginBottom: 18 }}>
          <View style={{ paddingHorizontal: 16 }}>
            {section("Market", "Explore", () => go("market"), "◇")}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
            {products.slice(0, 6).map((product: any, index: number) => (
              <TouchableOpacity key={product.id} onPress={() => go("market")} style={{ width: 150, borderRadius: 13, overflow: "hidden", borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
                <LinearGradient colors={[["#44464A", "#29252B", "#36322B"][index % 3], C.elevated]} style={{ height: 78, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#F1F1F1", fontSize: 25 }}>{index % 3 === 0 ? "◇" : index % 3 === 1 ? "◉" : "▱"}</Text>
                </LinearGradient>
                <View style={{ padding: 9 }}>
                  <Text numberOfLines={1} style={{ color: C.text, fontSize: 12, fontWeight: "700" }}>{product.title}</Text>
                  <Text numberOfLines={1} style={{ color: C.accent, fontSize: 11, fontWeight: "700", marginTop: 4 }}>{product.price || "View listing"}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {rooms.length > 0 ? (
        <View style={{ marginHorizontal: 14, marginBottom: 8 }}>
          {section("Communities", "Discover", () => setMoreOpen(true), "◎")}
          {rooms.slice(0, 2).map((room: any) => {
            const isJoined = !!joined[room.id];
            return (
              <View key={room.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: C.text, fontSize: 12, fontWeight: "800" }}>{room.av || "K"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>{room.name}</Text>
                  <Text numberOfLines={1} style={{ color: C.text3, fontSize: 11, marginTop: 2 }}>{room.live ? "Live · " : ""}{room.meta}</Text>
                </View>
                <TouchableOpacity onPress={() => { setJoined({ ...joined, [room.id]: !isJoined }); show(isJoined ? "Left " + room.name : "Joined " + room.name); }} style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: C.border, backgroundColor: isJoined ? C.accentSoft : C.elevated }}>
                  <Text style={{ color: isJoined ? C.accent : C.text2, fontSize: 11, fontWeight: "700" }}>{isJoined ? "Joined" : "Join"}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : null}
      <TouchableOpacity onPress={() => setMoreOpen(true)} style={{ marginHorizontal: 14, marginTop: 8, paddingVertical: 12, alignItems: "center" }}>
        <Text style={{ color: C.text3, fontSize: 12 }}>Discover more on Kilode  ·  More ›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
