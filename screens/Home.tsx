import React, { useMemo, useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

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
  onOpenJobs: () => void;
  events?: any[];
  market?: any[];
  jobs?: any[];
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
  onOpenJobs,
  events = [],
  market = [],
  jobs = [],
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
  const [submittedSearch, setSubmittedSearch] = useState("");
  const carouselRef = useRef<ScrollView>(null);

  const discoveryFeed = useMemo(() => {
    const stamp = (item: any) => {
      const raw = item.createdAt || item.created_at || item.published_at || item.date || item.time;
      const parsed = raw ? Date.parse(String(raw)) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const lanes = [
      takes.map((item: any) => ({
        id: `social-${item.id}`, kind: "Socials", title: item.name || item.handle || "Kilode member",
        subtitle: item.text || item.body || "Shared a post", icon: "people-outline" as const, accent: "#E56B6F",
        date: stamp(item), onPress: () => onOpenPost(item),
      })),
      news.map((item: any) => ({
        id: `media-${item.id}`, kind: "Media", title: item.title || "Story",
        subtitle: item.kicker || item.author || "Open article", icon: "newspaper-outline" as const, accent: "#E56B6F",
        date: stamp(item), onPress: () => onOpenMedia(String(item.id)),
      })),
      tracks.map((item: any) => ({
        id: `music-${item.id}`, kind: "Music", title: item.title || "Track",
        subtitle: item.artist || "Open music", icon: "musical-notes-outline" as const, accent: "#F08A4B",
        date: stamp(item), onPress: () => onPlayTrack(item),
      })),
      events.map((item: any) => ({
        id: `event-${item.id}`, kind: "Events", title: item.title || "Event",
        subtitle: item.meta || item.venue || "Open events", icon: "calendar-outline" as const, accent: "#F2C94C",
        date: stamp(item), onPress: onOpenEvents,
      })),
      market.map((item: any) => ({
        id: `market-${item.id}`, kind: "Market", title: item.title || "Listing",
        subtitle: item.price || item.meta || "Open Market", icon: "bag-handle-outline" as const, accent: "#F08A4B",
        date: stamp(item), onPress: onOpenMarket,
      })),
      jobs.map((item: any) => ({
        id: `job-${item.id}`, kind: "Jobs", title: item.title || "Role",
        subtitle: item.meta || [item.company, item.location].filter(Boolean).join(" · ") || "Open Jobs",
        icon: "briefcase-outline" as const, accent: "#F2C94C", date: stamp(item), onPress: onOpenJobs,
      })),
    ];
    const interleaved: any[] = [];
    const max = Math.max(0, ...lanes.map((lane) => lane.length));
    for (let i = 0; i < max; i += 1) {
      for (const lane of lanes) if (lane[i]) interleaved.push(lane[i]);
    }
    return interleaved
      .sort((a, b) => b.date - a.date)
      .slice(0, 8);
  }, [takes, news, tracks, events, market, jobs, onOpenPost, onOpenMedia, onPlayTrack, onOpenEvents, onOpenMarket, onOpenJobs]);

  const heroMedia = news[0];
  const heroTrack = tracks[0];
  const heroEvent = events[0];
  const heroSocial = takes[0];
  const carousel = [
    {
      key: "m", kind: "Media" as const,
      title: heroMedia?.title || "Stories worth your time",
      sub: heroMedia?.kicker || "Latest from Media",
      imageUrl: heroMedia?.imageUrl as string | undefined,
      onPress: () => heroMedia ? onOpenMedia(String(heroMedia.id)) : onOpenMedia(),
      icon: "newspaper-outline" as const, color: "#E56B6F",
    },
    {
      key: "t", kind: "Music" as const,
      title: heroTrack?.title || "Discover new sounds",
      sub: heroTrack?.artist || "Play from Music",
      imageUrl: undefined as string | undefined,
      onPress: () => heroTrack ? onPlayTrack(heroTrack) : onOpenMusic(),
      icon: "musical-notes-outline" as const, color: "#F08A4B",
    },
    {
      key: "e", kind: "Events" as const,
      title: heroEvent?.title || "What's happening",
      sub: heroEvent?.meta || heroEvent?.venue || "Explore events",
      imageUrl: heroEvent?.imageUrl as string | undefined,
      onPress: onOpenEvents,
      icon: "calendar-outline" as const, color: "#F2C94C",
    },
    {
      key: "s", kind: "Socials" as const,
      title: heroSocial?.text || heroSocial?.body || "Join the conversation",
      sub: heroSocial?.name || heroSocial?.handle || "From Socials",
      imageUrl: undefined as string | undefined,
      onPress: () => heroSocial ? onOpenPost(heroSocial) : onOpenSocials(),
      icon: "people-outline" as const, color: "#E56B6F",
    },
  ];

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
    else if (id === "jobs") onOpenJobs();
    else onOpenSystem(id);
  };

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >

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
            onSubmitEditing={() => {
              const term = q.trim();
              if (!term) { show("Enter a search term"); setSubmittedSearch(""); return; }
              setSubmittedSearch(term);
            }}
            returnKeyType="search"
          />
        </View>
      </View>

      {submittedSearch ? (() => {
        const term = submittedSearch.toLowerCase();
        const results = [
          ...news.filter((item: any) => `${item.title || ""} ${item.kicker || ""}`.toLowerCase().includes(term)).map((item: any) => ({
            id: `media-${item.id}`, kind: "Media", title: item.title || "Story", subtitle: item.kicker || item.time || "Open story",
            onPress: () => onOpenMedia(String(item.id)),
          })),
          ...tracks.filter((item: any) => `${item.title || ""} ${item.artist || ""}`.toLowerCase().includes(term)).map((item: any) => ({
            id: `music-${item.id}`, kind: "Music", title: item.title || "Track", subtitle: item.artist || "Open track",
            onPress: () => onPlayTrack(item),
          })),
          ...takes.filter((item: any) => `${item.name || ""} ${item.handle || ""} ${item.text || ""} ${item.body || ""}`.toLowerCase().includes(term)).map((item: any) => ({
            id: `social-${item.id}`, kind: "Socials", title: item.name || item.author?.name || "Kilode member", subtitle: item.text || item.body || "Open post",
            onPress: () => onOpenPost(item),
          })),
          ...events.filter((item: any) => `${item.title || ""} ${item.meta || ""}`.toLowerCase().includes(term)).map((item: any) => ({
            id: `event-${item.id}`, kind: "Events", title: item.title || "Event", subtitle: item.meta || "Open events",
            onPress: onOpenEvents,
          })),
          ...market.filter((item: any) => `${item.title || ""} ${item.price || ""} ${item.meta || ""}`.toLowerCase().includes(term)).map((item: any) => ({
            id: `market-${item.id}`, kind: "Market", title: item.title || "Listing", subtitle: item.price || item.meta || "Open Market",
            onPress: onOpenMarket,
          })),
          ...jobs.filter((item: any) => `${item.title || ""} ${item.company || ""} ${item.location || ""} ${item.meta || ""}`.toLowerCase().includes(term)).map((item: any) => ({
            id: `job-${item.id}`, kind: "Jobs", title: item.title || "Role", subtitle: item.meta || [item.company, item.location].filter(Boolean).join(" · ") || "Open Jobs",
            onPress: onOpenJobs,
          })),
        ].slice(0, 8);
        return (
          <View style={{ marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: "800", flex: 1 }}>Results for “{submittedSearch}”</Text>
              <TouchableOpacity onPress={() => { setSubmittedSearch(""); setQ(""); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={18} color={C.text2} />
              </TouchableOpacity>
            </View>
            {results.length ? results.map((item: any) => (
              <TouchableOpacity key={item.id} onPress={item.onPress} style={{ paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.border }}>
                <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800" }}>{item.kind}</Text>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: "700", marginTop: 2 }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }} numberOfLines={2}>{item.subtitle}</Text>
              </TouchableOpacity>
            )) : <Text style={{ color: C.text2, fontSize: 12, paddingVertical: 8 }}>No matches in the content currently available on this preview.</Text>}
          </View>
        );
      })() : null}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
        {RAIL.map((r, index) => {
          const on = r.id === "home";
          const colors = ["#E6A94A", "#E56B6F", "#F08A4B", "#F2C94C"];
          const tint = on ? C.accent : colors[index % colors.length];
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => goRail(r.id)}
              activeOpacity={0.82}
              style={{
                width: "23.5%",
                minHeight: 62,
                flexGrow: 1,
                flexBasis: "22%",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                paddingHorizontal: 3,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: on ? C.accent : C.border,
              }}
            >
              <View style={{ width: 27, height: 27, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: tint + "20" }}>
                <Ionicons name={r.icon} size={15} color={tint} />
              </View>
              <Text style={{ color: on ? C.accent : C.text2, fontWeight: "600", fontSize: 9, textAlign: "center" }} numberOfLines={1}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {carousel.map((card) => (
          <TouchableOpacity
            key={card.key}
            activeOpacity={0.88}
            onPress={card.onPress}
            style={{
              width: "48%",
              minHeight: 104,
              flexGrow: 1,
              flexBasis: "46%",
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
              padding: 11,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: card.color + "20", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={card.icon} size={15} color={card.color} />
              </View>
              <Ionicons name="arrow-forward-outline" size={13} color={C.text3} />
            </View>
            <View style={{ marginTop: 9 }}>
              <Text style={{ color: card.color, fontSize: 9, fontWeight: "700", letterSpacing: 0.45 }}>{card.kind.toUpperCase()}</Text>
              <Text style={{ color: C.text, fontSize: 12, lineHeight: 15, fontWeight: "600", marginTop: 3 }} numberOfLines={2}>{card.title}</Text>
              <Text style={{ color: C.text3, fontSize: 10, marginTop: 3 }} numberOfLines={1}>{card.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 18, marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2, flex: 1 }}>Across Kilode</Text>
        <Text style={{ color: C.text3, fontSize: 11 }}>For You</Text>
      </View>
      <View style={{ marginHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, overflow: "hidden" }}>
        {discoveryFeed.length ? discoveryFeed.map((item: any, index: number) => (
          <TouchableOpacity key={item.id} activeOpacity={0.78} onPress={item.onPress} style={{ minHeight: 66, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: index === discoveryFeed.length - 1 ? 0 : 1, borderBottomColor: C.border }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: item.accent + "18", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={item.icon} size={16} color={item.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: item.accent, fontSize: 10, fontWeight: "700", letterSpacing: 0.35 }}>{item.kind}</Text>
              <Text style={{ color: C.text, fontSize: 13, fontWeight: "600", marginTop: 2 }} numberOfLines={1}>{item.title}</Text>
              <Text style={{ color: C.text2, fontSize: 11, lineHeight: 15, marginTop: 2 }} numberOfLines={2}>{item.subtitle}</Text>
            </View>
            <Ionicons name={item.kind === "Music" ? "play-circle-outline" : "chevron-forward"} size={18} color={C.text3} />
          </TouchableOpacity>
        )) : (
          <View style={{ padding: 16 }}>
            <Text style={{ color: C.text2, fontSize: 13 }}>New content will appear here as Kilode systems publish it.</Text>
          </View>
        )}
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
              <LinearGradient colors={["#353946", "#242833", "#111318"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 100, height: 100, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
                <Ionicons name="musical-notes" size={24} color="rgba(255,255,255,0.92)" />
              </LinearGradient>
              <Text style={{ color: C.text, fontSize: 11, fontWeight: "700", marginTop: 5 }} numberOfLines={1}>{t.title}</Text>
              <Text style={{ color: C.text3, fontSize: 10, marginTop: 1 }} numberOfLines={1}>{t.artist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <SectionHead C={C} title="Events" onSeeAll={onOpenEvents} />
      {events.length === 0 ? (
        <TouchableOpacity onPress={onOpenEvents} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>No events loaded · open Events</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginHorizontal: 16, gap: 8 }}>
          {events.slice(0, 3).map((e: any) => (
            <TouchableOpacity
              key={String(e.id)}
              onPress={onOpenEvents}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 14,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
                gap: 10,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="calendar-outline" size={18} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }} numberOfLines={1}>{e.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }} numberOfLines={1}>{e.meta}</Text>
              </View>
              {e.price ? <Text style={{ color: C.accent, fontWeight: "700", fontSize: 11 }}>{e.price}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <SectionHead C={C} title="Market" onSeeAll={onOpenMarket} />
      {market.length === 0 ? (
        <TouchableOpacity onPress={onOpenMarket} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>No listings loaded · open Market</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {market.slice(0, 6).map((m: any) => (
            <TouchableOpacity
              key={String(m.id)}
              onPress={onOpenMarket}
              style={{ width: 120, padding: 10, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
            >
              <View style={{ height: 64, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <Ionicons name="bag-handle-outline" size={22} color={C.accent} />
              </View>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 12 }} numberOfLines={2}>{m.title}</Text>
              <Text style={{ color: C.accent, fontWeight: "700", fontSize: 11, marginTop: 4 }}>{m.price || m.meta || ""}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <SectionHead C={C} title="Jobs" onSeeAll={onOpenJobs} />
      {jobs.length === 0 ? (
        <TouchableOpacity onPress={onOpenJobs} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>No roles loaded · open Jobs</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginHorizontal: 16, gap: 8 }}>
          {jobs.slice(0, 3).map((j: any) => (
            <TouchableOpacity
              key={String(j.id)}
              onPress={onOpenJobs}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 14,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
                gap: 10,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="briefcase-outline" size={18} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }} numberOfLines={1}>{j.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }} numberOfLines={1}>{j.meta || [j.company, j.location].filter(Boolean).join(" · ")}</Text>
              </View>
              {(j.price || j.salary) ? <Text style={{ color: C.accent, fontWeight: "700", fontSize: 11 }}>{j.price || j.salary}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
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

      {takes.length ? takes.slice(0, 3).map((take: any) => (
        <TouchableOpacity
          key={String(take.id)}
          activeOpacity={0.9}
          onPress={() => onOpenPost(take)}
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            padding: 12,
            borderRadius: 14,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 13 }}>{take.name || take.author?.name || "Kilode member"}</Text>
          <Text style={{ color: C.text, fontSize: 13, lineHeight: 18, marginTop: 6 }} numberOfLines={3}>{take.text || take.body || ""}</Text>
          {take.mediaUrl ? (
            <Image source={{ uri: take.mediaUrl }} style={{ width: "100%", height: 130, borderRadius: 10, marginTop: 8, backgroundColor: C.elevated }} resizeMode="cover" />
          ) : null}
        </TouchableOpacity>
      )) : (
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
      <Text style={{ color: C.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2, flex: 1 }}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={{ color: C.accent, fontWeight: "600", fontSize: 12 }}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}
