import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  s: any; C: any; sessionName: string; news: any[]; tracks: any[]; takes: any[];
  liked: Record<string, boolean>; onLikePost: (id: string) => void; onCommentPost: (post: any) => void; onSharePost: (post: any) => void;
  refreshing: boolean; onRefresh: () => void;
  onOpenMedia: (id?: string) => void; onOpenMusic: () => void; onOpenEvents: () => void;
  onOpenMarket: () => void; onOpenJobs: () => void; events?: any[]; market?: any[]; jobs?: any[];
  onOpenSystem: (id: string) => void; onOpenSocials: () => void; onOpenPost: (p: any) => void;
  onOpenItem: (system: string, item: any) => void; onOpenProfile: (u: any) => void;
  onCompose: () => void; onPlayTrack: (t: any) => void; show: (m: string) => void;
  searchOpen: boolean; onCloseSearch: () => void;
};

const SYSTEMS = [
  { id: "all", label: "All", icon: "home" as const },
  { id: "socials", label: "Socials", icon: "people-outline" as const },
  { id: "media", label: "Media", icon: "newspaper-outline" as const },
  { id: "music", label: "Music", icon: "musical-notes-outline" as const },
  { id: "events", label: "Events", icon: "calendar-outline" as const },
  { id: "market", label: "Market", icon: "bag-handle-outline" as const },
  { id: "jobs", label: "Jobs", icon: "briefcase-outline" as const },
  { id: "communities", label: "Communities", icon: "people-circle-outline" as const },
  { id: "cinema", label: "Cinema", icon: "film-outline" as const },
  { id: "creators", label: "Creators", icon: "videocam-outline" as const },
  { id: "ads", label: "Ads", icon: "megaphone-outline" as const },
  { id: "myspace", label: "My Space", icon: "person-circle-outline" as const },
];

function firstText(...values: any[]) {
  const found = values.find((v) => typeof v === "string" && v.trim());
  return found || "";
}

const iconFor = (kind: string): any =>
  ({
    Socials: "people-outline",
    Media: "newspaper-outline",
    Music: "musical-notes-outline",
    Events: "calendar-outline",
    Market: "bag-handle-outline",
    Jobs: "briefcase-outline",
  } as any)[kind] || "apps-outline";

export function HomeScreen({
  s, C, sessionName, news, tracks, takes, liked, onLikePost, onCommentPost, onSharePost,
  refreshing, onRefresh, onOpenMedia, onOpenMusic, onOpenEvents, onOpenMarket, onOpenJobs,
  events = [], market = [], jobs = [], onOpenSystem, onOpenSocials, onOpenPost, onOpenItem,
  onOpenProfile, onCompose, onPlayTrack, show, searchOpen, onCloseSearch,
}: Props) {
  const [system, setSystem] = useState("all");
  const [q, setQ] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const width = Dimensions.get("window").width;

  const goSystem = (id: string) => {
    if (id === "all") { setSystem("all"); return; }
    if (id === "socials") onOpenSocials();
    else if (id === "media") onOpenMedia();
    else if (id === "music") onOpenMusic();
    else if (id === "events") onOpenEvents();
    else if (id === "market") onOpenMarket();
    else if (id === "jobs") onOpenJobs();
    else onOpenSystem(id);
  };

  const feed = useMemo(() => {
    const timeOf = (x: any) => {
      const raw = x.createdAt || x.created_at || x.time;
      const n = raw ? Date.parse(String(raw)) : 0;
      if (Number.isFinite(n) && n > 0) return n;
      return 0;
    };
    const rows: any[] = [
      ...takes.map((x) => ({
        id: "social-" + x.id,
        kind: "Socials",
        raw: x,
        date: timeOf(x),
        title: firstText(x.name, x.handle, "Kilode member"),
        body: firstText(x.text, x.body, x.content),
        image: firstText(x.mediaUrl, x.imageUrl),
        sub: firstText(x.handle, x.time, "Socials") + (x.localOnly ? " · on this device" : ""),
        onPress: () => onOpenPost(x),
      })),
      ...news.map((x) => ({
        id: "media-" + x.id,
        kind: "Media",
        raw: x,
        date: timeOf(x),
        title: firstText(x.title, "Story"),
        body: firstText(x.kicker, x.summary, x.body),
        image: firstText(x.imageUrl, x.image_url),
        sub: firstText(x.author, x.time, "Media"),
        onPress: () => onOpenMedia(String(x.id)),
      })),
      ...tracks.map((x) => ({
        id: "music-" + x.id,
        kind: "Music",
        raw: x,
        date: timeOf(x),
        title: firstText(x.title, "Track"),
        body: firstText(x.artist, x.artist_name),
        image: firstText(x.coverUrl, x.imageUrl),
        sub: firstText(x.artist, "Music"),
        onPress: () => onPlayTrack(x),
      })),
      ...events.map((x) => ({
        id: "event-" + x.id,
        kind: "Events",
        raw: x,
        date: timeOf(x),
        title: firstText(x.title, "Event"),
        body: firstText(x.meta, x.venue),
        image: "",
        sub: firstText(x.time, "Events"),
        onPress: () => onOpenItem("Events", x),
      })),
      ...market.map((x) => ({
        id: "market-" + x.id,
        kind: "Market",
        raw: x,
        date: timeOf(x),
        title: firstText(x.title, "Listing"),
        body: firstText(x.price, x.meta),
        image: "",
        sub: firstText(x.meta, "Market"),
        onPress: () => onOpenItem("Market", x),
      })),
      ...jobs.map((x) => ({
        id: "job-" + x.id,
        kind: "Jobs",
        raw: x,
        date: timeOf(x),
        title: firstText(x.title, "Role"),
        body: firstText(x.meta, x.price),
        image: "",
        sub: firstText(x.meta, "Jobs"),
        onPress: () => onOpenItem("Jobs", x),
      })),
    ];
    return rows.sort((a, b) => b.date - a.date);
  }, [takes, news, tracks, events, market, jobs, onOpenPost, onOpenMedia, onPlayTrack, onOpenItem]);

  const filtered = system === "all" ? feed : feed.filter((x) => x.kind.toLowerCase() === system);
  const searchResults = submittedSearch
    ? feed.filter((x) => [x.title, x.body, x.kind, x.sub].join(" ").toLowerCase().includes(submittedSearch.toLowerCase())).slice(0, 12)
    : [];
  const list = submittedSearch ? searchResults : filtered;

  const featured = [
    ...(tracks[0] ? [{ kind: "Music", title: firstText(tracks[0].title), sub: firstText(tracks[0].artist), onPress: () => onPlayTrack(tracks[0]) }] : []),
    ...(news[0] ? [{ kind: "Media", title: firstText(news[0].title), sub: firstText(news[0].kicker), onPress: () => onOpenMedia(String(news[0].id)) }] : []),
    ...(takes[0] ? [{ kind: "Socials", title: firstText(takes[0].text, takes[0].name), sub: firstText(takes[0].handle), onPress: () => onOpenPost(takes[0]) }] : []),
    ...(events[0] ? [{ kind: "Events", title: firstText(events[0].title), sub: firstText(events[0].meta), onPress: () => onOpenItem("Events", events[0]) }] : []),
  ].slice(0, 4);

  return (
    <ScrollView
      style={s.flex}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 4 }}>
        {(featured.length ? featured : [{ kind: "Kilode", title: "Discover Kilode", sub: "Socials · Media · Music", onPress: () => {} }]).map((card, index, arr) => (
          <TouchableOpacity
            key={card.kind + index}
            activeOpacity={0.9}
            onPress={card.onPress}
            style={{ width: width * 0.88, height: 150, marginRight: 10, borderRadius: 15, overflow: "hidden", borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated }}
          >
            <LinearGradient colors={["#3A3020", "#1B1A18", "#101116"]} style={{ position: "absolute", width: "100%", height: "100%" }} />
            <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.85)"]} style={{ position: "absolute", width: "100%", height: "100%" }} />
            <View style={{ flex: 1, justifyContent: "flex-end", padding: 16 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>{String(card.kind).toUpperCase()} · FEATURED</Text>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 4 }} numberOfLines={2}>{card.title}</Text>
              <Text style={{ color: "#F0F0F0", fontSize: 12, marginTop: 2 }} numberOfLines={1}>{card.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, gap: 8 }}>
        {SYSTEMS.map((item) => {
          const active = item.id === system;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => goSystem(item.id)}
              style={{ width: 92, minHeight: 68, padding: 10, borderRadius: 13, backgroundColor: active ? C.accent + "18" : C.card, borderWidth: active ? 1.5 : 1, borderColor: active ? C.accent : C.border, justifyContent: "space-between" }}
            >
              <Ionicons name={item.icon} size={19} color={active ? C.accent : C.text2} />
              <Text style={{ color: active ? C.accent : C.text, fontSize: 11, fontWeight: active ? "800" : "600" }} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        onPress={onCompose}
        activeOpacity={0.85}
        style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 10, padding: 10, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: C.text, fontWeight: "800" }}>{(sessionName || "K").slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={{ color: C.text3, fontSize: 13, flex: 1 }}>What's on your mind?</Text>
        <Ionicons name="image-outline" size={20} color={C.text2} />
        <Ionicons name="add-circle-outline" size={22} color={C.text2} />
      </TouchableOpacity>

      {searchOpen ? (
        <View style={{ marginHorizontal: 12, marginBottom: 10, paddingHorizontal: 12, height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.accent + "66", backgroundColor: C.elevated, flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="search" size={16} color={C.accent} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            onSubmitEditing={() => setSubmittedSearch(q.trim())}
            placeholder="Search Kilode"
            placeholderTextColor={C.text3}
            style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 14 }}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => { setSubmittedSearch(q.trim()); }}>
            <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>Go</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onCloseSearch(); setQ(""); setSubmittedSearch(""); }} style={{ marginLeft: 10 }}>
            <Ionicons name="close" size={18} color={C.text2} />
          </TouchableOpacity>
        </View>
      ) : null}

      {list.length === 0 ? (
        <View style={{ margin: 16, padding: 16, borderRadius: 14, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text2, fontSize: 13 }}>Nothing here yet. Pull to refresh or create a post.</Text>
        </View>
      ) : (
        list.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={item.onPress}
            style={{ marginHorizontal: 12, marginBottom: 10, padding: 12, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
              <View style={{ width: 35, height: 35, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "25" }}>
                <Ionicons name={iconFor(item.kind)} size={17} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }}>{item.kind} · {item.sub}</Text>
              </View>
            </View>
            {!!item.body && (
              <Text style={{ color: C.text, fontSize: 14, lineHeight: 20, marginTop: 9 }} numberOfLines={4}>{item.body}</Text>
            )}
            {!!item.image && (
              <Image source={{ uri: item.image }} style={{ width: "100%", height: 160, borderRadius: 10, marginTop: 10, backgroundColor: C.elevated }} resizeMode="cover" />
            )}
            {item.kind === "Socials" ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 22, marginTop: 10 }}>
                <TouchableOpacity onPress={() => onLikePost(String(item.raw.id))} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Ionicons name={liked[String(item.raw.id)] ? "heart" : "heart-outline"} size={18} color={liked[String(item.raw.id)] ? "#FF4965" : C.text3} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onCommentPost(item.raw)}>
                  <Ionicons name="chatbubble-outline" size={17} color={C.text3} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onSharePost(item.raw)}>
                  <Ionicons name="share-social-outline" size={17} color={C.text3} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700" }}>Open {item.kind}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
