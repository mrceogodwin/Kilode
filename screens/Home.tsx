import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: W } = Dimensions.get("window");
const CARD_W = W * 0.68;

type Props = {
  s: any;
  C: any;
  sessionName: string;
  news: any[];
  tracks: any[];
  takes: any[];
  liked: Record<string, boolean>;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenMedia: (id?: string) => void;
  onOpenMusic: () => void;
  onOpenEvents: () => void;
  onOpenMarket: () => void;
  onOpenSystem: (id: string) => void;
  onOpenSocials: () => void;
  onOpenPost: (p: any) => void;
  onOpenProfile: (u: any) => void;
  onCompose: () => void;
  onPlayTrack: (t: any) => void;
  show: (m: string) => void;
};

const RAIL = [
  { id: "home", label: "Home", icon: "home" as const },
  { id: "media", label: "Media", icon: "newspaper-outline" as const },
  { id: "socials", label: "Socials", icon: "people-outline" as const },
  { id: "music", label: "Music", icon: "musical-notes-outline" as const },
  { id: "events", label: "Events", icon: "calendar-outline" as const },
  { id: "market", label: "Market", icon: "bag-handle-outline" as const },
  { id: "jobs", label: "Jobs", icon: "briefcase-outline" as const },
  { id: "communities", label: "Communities", icon: "people-circle-outline" as const },
  { id: "cinema", label: "Cinema", icon: "film-outline" as const },
  { id: "creators", label: "Creators", icon: "videocam-outline" as const },
  { id: "ads", label: "Ads & Business", icon: "megaphone-outline" as const },
  { id: "myspace", label: "My Space", icon: "person-circle-outline" as const },
];

function hourGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({
  s,
  C,
  sessionName,
  news,
  tracks,
  takes,
  refreshing,
  onRefresh,
  onOpenMedia,
  onOpenMusic,
  onOpenEvents,
  onOpenMarket,
  onOpenSystem,
  onOpenSocials,
  onOpenPost,
  onOpenProfile,
  onCompose,
  onPlayTrack,
  show,
}: Props) {
  const [slide, setSlide] = useState(0);
  const [q, setQ] = useState("");
  const carouselRef = useRef<ScrollView>(null);

  const heroMedia = news[0];
  const heroTrack = tracks[0];
  const carousel = [
    heroMedia
      ? {
          key: "m",
          kind: "Media" as const,
          title: heroMedia.title,
          sub: heroMedia.kicker || "Story",
          imageUrl: heroMedia.imageUrl,
          meta: heroMedia.time || "Now",
          onPress: () => onOpenMedia(String(heroMedia.id)),
        }
      : null,
    heroTrack
      ? {
          key: "t",
          kind: "Music" as const,
          title: heroTrack.title,
          sub: heroTrack.artist || "Featured",
          imageUrl: undefined as string | undefined,
          color: heroTrack.color || "#5A4728",
          meta: "Play",
          onPress: () => onPlayTrack(heroTrack),
        }
      : null,
  ].filter(Boolean) as any[];

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSlide(Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 10)));
  };

  const goRail = (id: string) => {
    if (id === "home") return;
    if (id === "media") onOpenMedia();
    else if (id === "socials") onOpenSocials();
    else if (id === "music") onOpenMusic();
    else if (id === "events") onOpenEvents();
    else if (id === "market") onOpenMarket();
    else onOpenSystem(id);
  };

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 2 }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>
          {hourGreeting()}, {sessionName.split(" ")[0] || "there"}
        </Text>
      </View>

      <View style={{ marginHorizontal: 16, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.elevated,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.border,
            paddingHorizontal: 12,
            height: 40,
          }}
        >
          <Ionicons name="search" size={16} color={C.text3} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search Kilode"
            placeholderTextColor={C.text3}
            style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 14 }}
            onSubmitEditing={() => show(q.trim() ? "Search is not connected yet." : "Enter a search term")}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 6 }}>
        {RAIL.map((r) => {
          const on = r.id === "home";
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => goRail(r.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: on ? C.accent : C.elevated,
                borderWidth: 1,
                borderColor: on ? C.accent : C.border,
              }}
            >
              <Ionicons name={r.icon} size={13} color={on ? "#111" : C.text2} />
              <Text style={{ color: on ? "#111" : C.text2, fontWeight: "700", fontSize: 12 }}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        ref={carouselRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + 10}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 12 }}
        onScroll={onCarouselScroll}
        scrollEventThrottle={16}
      >
        {carousel.map((card) => (
          <TouchableOpacity
            key={card.key}
            activeOpacity={0.9}
            onPress={card.onPress}
            style={{
              width: CARD_W,
              height: 148,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: card.color || C.elevated,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            {card.imageUrl ? (
              <Image source={{ uri: card.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: card.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-notes" size={32} color="rgba(255,255,255,0.85)" />
              </View>
            )}
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: "rgba(0,0,0,0.55)" }}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700" }}>{card.kind}</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800", marginTop: 2 }} numberOfLines={2}>
                {card.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 8 }}>
        {carousel.map((_, i) => (
          <View key={i} style={{ width: i === slide ? 12 : 4, height: 4, borderRadius: 2, backgroundColor: i === slide ? C.accent : C.border }} />
        ))}
      </View>

      <SectionHead C={C} title="Media" onSeeAll={() => onOpenMedia()} />
      {news.length === 0 ? (
        <TouchableOpacity onPress={() => onOpenMedia()} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>No stories loaded · open Media</Text>
        </TouchableOpacity>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {news.slice(0, 6).map((n: any) => (
          <TouchableOpacity key={n.id} activeOpacity={0.88} onPress={() => onOpenMedia(String(n.id))} style={{ width: 108 }}>
            {n.imageUrl ? (
              <Image source={{ uri: n.imageUrl }} style={{ width: 108, height: 80, borderRadius: 10, backgroundColor: C.elevated }} resizeMode="cover" />
            ) : (
              <View style={{ width: 108, height: 80, borderRadius: 10, backgroundColor: C.elevated }} />
            )}
            <Text style={{ color: C.text, fontSize: 11, fontWeight: "700", marginTop: 5, lineHeight: 14 }} numberOfLines={2}>
              {n.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      )}

      <SectionHead C={C} title="Music" onSeeAll={onOpenMusic} />
      {tracks.length === 0 ? (
        <TouchableOpacity onPress={onOpenMusic} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>No tracks loaded · open Music</Text>
        </TouchableOpacity>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {tracks.slice(0, 6).map((t: any) => (
          <TouchableOpacity key={t.id} activeOpacity={0.88} onPress={() => onPlayTrack(t)} style={{ width: 100 }}>
            <View style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-notes" size={24} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={{ color: C.text, fontSize: 11, fontWeight: "700", marginTop: 5 }} numberOfLines={1}>{t.title}</Text>
            <Text style={{ color: C.text3, fontSize: 10, marginTop: 1 }} numberOfLines={1}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      )}

      <SectionHead C={C} title="Socials" onSeeAll={onOpenSocials} />
      <TouchableOpacity
        onPress={onCompose}
        style={{
          marginHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: C.elevated,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.card, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 12 }}>{(sessionName || "K").slice(0, 1)}</Text>
        </View>
        <Text style={{ color: C.text3, fontSize: 13, flex: 1 }}>What's on your mind?</Text>
      </TouchableOpacity>

      {takes[0] ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onOpenPost(takes[0])}
          style={{
            marginHorizontal: 16,
            padding: 12,
            borderRadius: 14,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 13 }}>{takes[0].name}</Text>
          <Text style={{ color: C.text, fontSize: 13, lineHeight: 18, marginTop: 6 }} numberOfLines={3}>{takes[0].text}</Text>
          {takes[0].mediaUrl ? (
            <Image source={{ uri: takes[0].mediaUrl }} style={{ width: "100%", height: 130, borderRadius: 10, marginTop: 8, backgroundColor: C.elevated }} resizeMode="cover" />
          ) : null}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onOpenSocials} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>No posts in feed · open Socials</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function SectionHead({ C, title, onSeeAll }: { C: any; title: string; onSeeAll: () => void }) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 18, marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
      <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", flex: 1 }}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}
