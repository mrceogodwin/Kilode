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
const CARD_W = W * 0.72;

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

const PYMK = [
  { id: "z1", name: "Zino_king", meta: "12 mutual friends", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { id: "z2", name: "Lollyblaq", meta: "8 mutual friends", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" },
  { id: "z3", name: "Baddest_tee", meta: "5 mutual friends", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80" },
  { id: "z4", name: "TundeFlex", meta: "3 mutual friends", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
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
  liked,
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
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const carouselRef = useRef<ScrollView>(null);

  const heroMedia = news[0];
  const heroTrack = tracks[0];
  const carousel = [
    heroMedia
      ? {
          key: "m",
          kind: "Media" as const,
          title: heroMedia.title,
          sub: heroMedia.kicker || "Top story",
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
    {
      key: "e",
      kind: "Events" as const,
      title: "Lagos Summer Fest",
      sub: "Muri Okunola Park, VI",
      imageUrl: "https://images.unsplash.com/photo-1459749411175-047fc749d9b0?w=600&q=80",
      meta: "Nov 15",
      onPress: onOpenEvents,
    },
  ].filter(Boolean) as any[];

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setSlide(Math.round(x / (CARD_W + 12)));
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
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {/* Greeting */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "700" }}>
          {hourGreeting()}, {sessionName.split(" ")[0] || "there"}{" "}
          <Text>☀️</Text>
        </Text>
        <Text style={{ color: C.text3, fontSize: 13, marginTop: 3 }}>Discover. Connect. Create. Everything Kilode.</Text>
      </View>

      {/* Search */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.elevated,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Ionicons name="search" size={18} color={C.text3} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search anything on Kilode..."
            placeholderTextColor={C.text3}
            style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 14 }}
            onSubmitEditing={() => show(q.trim() ? `Search “${q.trim()}” when global search is live.` : "Type to search Kilode")}
          />
        </View>
        <TouchableOpacity
          onPress={() => show("Filters open when search index is live.")}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            backgroundColor: C.elevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="options-outline" size={20} color={C.accent} />
        </TouchableOpacity>
      </View>

      {/* System chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, gap: 8 }}
      >
        {RAIL.map((r) => {
          const on = r.id === "home";
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => goRail(r.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 999,
                backgroundColor: on ? C.accent : C.elevated,
                borderWidth: 1,
                borderColor: on ? C.accent : C.border,
              }}
            >
              <Ionicons name={r.icon} size={14} color={on ? "#111" : C.text2} />
              <Text style={{ color: on ? "#111" : C.text2, fontWeight: "800", fontSize: 13 }}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured carousel */}
      <ScrollView
        ref={carouselRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + 12}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 8 }}
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
              height: 168,
              borderRadius: 18,
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
                <Ionicons name="musical-notes" size={40} color="rgba(255,255,255,0.85)" />
              </View>
            )}
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: "rgba(0,0,0,0.55)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{card.kind}</Text>
                </View>
                {card.kind === "Music" ? (
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="play" size={14} color="#111" />
                  </View>
                ) : null}
              </View>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", marginTop: 6 }} numberOfLines={2}>
                {card.title}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 }} numberOfLines={1}>
                {card.sub} · {card.meta}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 }}>
        {carousel.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === slide ? 14 : 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: i === slide ? C.accent : C.border,
            }}
          />
        ))}
      </View>

      {/* Media rail */}
      <SectionHead
        C={C}
        icon="newspaper-outline"
        title="Media"
        sub="Top stories, trending & more"
        onSeeAll={() => onOpenMedia()}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {news.slice(0, 6).map((n: any) => (
          <TouchableOpacity
            key={n.id}
            activeOpacity={0.88}
            onPress={() => onOpenMedia(String(n.id))}
            style={{ width: 118 }}
          >
            {n.imageUrl ? (
              <Image source={{ uri: n.imageUrl }} style={{ width: 118, height: 90, borderRadius: 12, backgroundColor: C.elevated }} resizeMode="cover" />
            ) : (
              <View style={{ width: 118, height: 90, borderRadius: 12, backgroundColor: n.tone || C.elevated }} />
            )}
            <Text style={{ color: C.accent, fontSize: 9, fontWeight: "800", marginTop: 6, letterSpacing: 0.4 }} numberOfLines={1}>
              {(n.kicker || "MEDIA").split("·")[0].trim().toUpperCase()}
            </Text>
            <Text style={{ color: C.text, fontSize: 12, fontWeight: "700", marginTop: 2, lineHeight: 15 }} numberOfLines={2}>
              {n.title}
            </Text>
            <Text style={{ color: C.text3, fontSize: 10, marginTop: 2 }}>{n.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Music rail */}
      <SectionHead
        C={C}
        icon="musical-notes-outline"
        title="Music"
        sub="New releases, charts & genres"
        onSeeAll={onOpenMusic}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {tracks.slice(0, 5).map((t: any) => (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.88}
            onPress={() => onPlayTrack(t)}
            style={{ width: 110 }}
          >
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 12,
                backgroundColor: t.color || C.elevated,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
              <View
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
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
            </View>
            <Text style={{ color: C.text, fontSize: 12, fontWeight: "700", marginTop: 6 }} numberOfLines={1}>
              {t.title}
            </Text>
            <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
              {t.artist}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={onOpenMusic}
          style={{
            width: 110,
            height: 110,
            borderRadius: 12,
            backgroundColor: C.elevated,
            borderWidth: 1,
            borderColor: C.border,
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
          }}
        >
          <Ionicons name="grid-outline" size={22} color={C.accent} />
          <Text style={{ color: C.text, fontSize: 11, fontWeight: "700", marginTop: 8, textAlign: "center" }}>
            Genres & Charts
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Socials block */}
      <SectionHead
        C={C}
        icon="people-outline"
        title="Socials"
        sub="People, posts & communities"
        onSeeAll={onOpenSocials}
      />

      <View
        style={{
          marginHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: C.elevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: C.text, fontWeight: "800" }}>{(sessionName || "K").slice(0, 1)}</Text>
        </View>
        <TouchableOpacity
          onPress={onCompose}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 20,
            backgroundColor: C.elevated,
            borderWidth: 1,
            borderColor: C.border,
            justifyContent: "center",
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ color: C.text3, fontSize: 13 }}>What's on your mind?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCompose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: C.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <Text style={{ color: C.text2, fontSize: 12, fontWeight: "700", paddingHorizontal: 16, marginBottom: 10 }}>
        People you may know
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14, marginBottom: 14 }}>
        {PYMK.map((p) => (
          <View key={p.id} style={{ alignItems: "center", width: 76 }}>
            <Image source={{ uri: p.avatar }} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.elevated }} />
            <Text style={{ color: C.text, fontSize: 11, fontWeight: "700", marginTop: 6 }} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={{ color: C.text3, fontSize: 9, marginTop: 2 }} numberOfLines={1}>
              {p.meta}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFollowing((f) => ({ ...f, [p.id]: !f[p.id] }));
                show(following[p.id] ? `Unfollowed ${p.name}` : `Following ${p.name}`);
              }}
              style={{
                marginTop: 6,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: following[p.id] ? C.elevated : C.accent,
                borderWidth: 1,
                borderColor: following[p.id] ? C.border : C.accent,
              }}
            >
              <Text style={{ color: following[p.id] ? C.text : "#111", fontSize: 11, fontWeight: "800" }}>
                {following[p.id] ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* One social post preview */}
      {takes[0] ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onOpenPost(takes[0])}
          style={{
            marginHorizontal: 16,
            padding: 14,
            borderRadius: 16,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {takes[0].avatarUrl ? (
              <Image source={{ uri: takes[0].avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.elevated }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>{takes[0].name}</Text>
              <Text style={{ color: C.text3, fontSize: 11 }}>{takes[0].time} · Public</Text>
            </View>
          </View>
          <Text style={{ color: C.text, fontSize: 14, lineHeight: 20, marginTop: 10 }} numberOfLines={3}>
            {takes[0].text}
          </Text>
          {takes[0].mediaUrl ? (
            <Image
              source={{ uri: takes[0].mediaUrl }}
              style={{ width: "100%", height: 150, borderRadius: 12, marginTop: 10, backgroundColor: C.elevated }}
              resizeMode="cover"
            />
          ) : null}
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

function SectionHead({
  C,
  icon,
  title,
  sub,
  onSeeAll,
}: {
  C: any;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub: string;
  onSeeAll: () => void;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 22,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
        <Ionicons name={icon} size={18} color={C.accent} />
        <View>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>
          <Text style={{ color: C.text3, fontSize: 11, marginTop: 1 }}>{sub}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Text style={{ color: C.accent, fontWeight: "700", fontSize: 13 }}>See all</Text>
        <Ionicons name="chevron-forward" size={14} color={C.accent} />
      </TouchableOpacity>
    </View>
  );
}
