import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  s: any; C: any; sessionName: string; news: any[]; tracks: any[]; takes: any[];
  liked: Record<string, boolean>; refreshing: boolean; onRefresh: () => void;
  onOpenMedia: (id?: string) => void; onOpenMusic: () => void; onOpenEvents: () => void;
  onOpenMarket: () => void; onOpenJobs: () => void; events?: any[]; market?: any[]; jobs?: any[];
  onOpenSystem: (id: string) => void; onOpenSocials: () => void; onOpenPost: (p: any) => void; onOpenItem: (system: string, item: any) => void;
  onOpenProfile: (u: any) => void; onCompose: () => void; onPlayTrack: (t: any) => void;
  show: (m: string) => void;
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

const iconFor = (kind: string): any => ({
  Socials: "people-outline", Media: "newspaper-outline", Music: "musical-notes-outline",
  Events: "calendar-outline", Market: "bag-handle-outline", Jobs: "briefcase-outline",
}[kind] || "apps-outline");

function firstText(...values: any[]) {
  const found = values.find((v) => typeof v === "string" && v.trim());
  return found || "";
}

export function HomeScreen({
  s, C, sessionName, news, tracks, takes, liked, refreshing, onRefresh,
  onOpenMedia, onOpenMusic, onOpenEvents, onOpenMarket, onOpenJobs,
  events = [], market = [], jobs = [], onOpenSystem, onOpenSocials, onOpenPost, onOpenItem,
  onOpenProfile, onCompose, onPlayTrack, show,
}: Props) {
  const [system, setSystem] = useState("all");
  const [q, setQ] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

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
      const raw = x.createdAt || x.created_at || x.published_at || x.starts_at || x.date || x.time;
      const n = raw ? Date.parse(String(raw)) : 0;
      if (Number.isFinite(n) && n > 0) return n;
      // Seed/preview items often carry relative labels such as "2h ago".
      const relative = String(raw || "").match(/(\d+)\s*(m|min|h|hr|d|day)s?(?:\s*ago)?$/i);
      if (relative) {
        const amount = Number(relative[1]);
        const unit = relative[2].toLowerCase();
        const ms = unit.startsWith("m") ? 60_000 : unit.startsWith("h") ? 3_600_000 : 86_400_000;
        return Date.now() - amount * ms;
      }
      return 0;
    };
    const rows: any[] = [
      ...takes.map((x) => ({ id: "social-" + x.id, kind: "Socials", raw: x, date: timeOf(x), title: firstText(x.name, x.author?.name, x.handle, "Kilode member"), body: firstText(x.text, x.body, x.content), image: firstText(x.mediaUrl, x.imageUrl, x.image_url), sub: firstText(x.handle, x.author?.handle, x.time, "Socials"), onPress: () => onOpenPost(x) })),
      ...news.map((x) => ({ id: "media-" + x.id, kind: "Media", raw: x, date: timeOf(x), title: firstText(x.title, "Story"), body: firstText(x.kicker, x.summary, x.body, x.author), image: firstText(x.imageUrl, x.image_url, x.image), sub: firstText(x.author, x.time, "Media"), onPress: () => onOpenMedia(String(x.id)) })),
      ...tracks.map((x) => ({ id: "music-" + x.id, kind: "Music", raw: x, date: timeOf(x), title: firstText(x.title, "Track"), body: firstText(x.description, x.artist, x.artist_name, "Open Music"), image: firstText(x.coverUrl, x.cover_url, x.imageUrl), sub: firstText(x.artist, x.artist_name, x.time, "Music"), onPress: () => onPlayTrack(x) })),
      ...events.map((x) => ({ id: "event-" + x.id, kind: "Events", raw: x, date: timeOf(x), title: firstText(x.title, "Event"), body: firstText(x.venue, x.meta, x.location, "Open Events"), image: firstText(x.imageUrl, x.image_url, x.cover_url), sub: firstText(x.time, x.date, "Events"), onPress: () => onOpenItem("Events", x) })),
      ...market.map((x) => ({ id: "market-" + x.id, kind: "Market", raw: x, date: timeOf(x), title: firstText(x.title, "Listing"), body: firstText(x.price, x.price_label, x.meta, x.category, "Open Market"), image: firstText(x.imageUrl, x.image_url, x.image, x.cover_url), sub: firstText(x.location, x.category, "Market"), onPress: () => onOpenItem("Market", x) })),
      ...jobs.map((x) => ({ id: "job-" + x.id, kind: "Jobs", raw: x, date: timeOf(x), title: firstText(x.title, "Opportunity"), body: firstText(x.salary, x.salary_label, x.meta, x.location, x.location_label, "Open Jobs"), image: firstText(x.imageUrl, x.image_url, x.image), sub: firstText(x.company, x.location, x.location_label, "Jobs"), onPress: () => onOpenItem("Jobs", x) })),
    ];
    return rows.sort((a, b) => b.date - a.date);
  }, [takes, news, tracks, events, market, jobs, onOpenPost, onOpenMedia, onPlayTrack, onOpenItem, onOpenEvents, onOpenMarket, onOpenJobs]);

  const filtered = system === "all" ? feed : feed.filter((x) => x.kind.toLowerCase() === system.toLowerCase());
  const searchResults = submittedSearch ? feed.filter((x) => [x.title, x.body, x.kind, x.sub].join(" ").toLowerCase().includes(submittedSearch.toLowerCase())).slice(0, 8) : [];

  // Four genuinely distinct feature slides; never render five decorative dots for one card.
  const featuredCards = [
    ...(tracks[0] ? [{ kind: "Music", raw: tracks[0], title: firstText(tracks[0].title, "New release"), sub: firstText(tracks[0].artist, tracks[0].artist_name, "Music on Kilode"), image: firstText(tracks[0].imageUrl, tracks[0].coverUrl, tracks[0].cover_url), onPress: () => onPlayTrack(tracks[0]) }] : []),
    ...(news[0] ? [{ kind: "Media", raw: news[0], title: firstText(news[0].title, "Top story"), sub: firstText(news[0].kicker, news[0].author, "Latest from Media"), image: firstText(news[0].imageUrl, news[0].image_url, news[0].image), onPress: () => onOpenMedia(String(news[0].id)) }] : []),
    ...(events[0] ? [{ kind: "Events", raw: events[0], title: firstText(events[0].title, "What's happening"), sub: firstText(events[0].venue, events[0].meta, "Discover events"), image: firstText(events[0].imageUrl, events[0].image_url, events[0].cover_url), onPress: () => onOpenItem("Events", events[0]) }] : []),
    ...(takes[0] ? [{ kind: "Socials", raw: takes[0], title: firstText(takes[0].text, takes[0].body, takes[0].name, "What's happening on Socials"), sub: firstText(takes[0].handle, takes[0].author?.name, "Community post"), image: firstText(takes[0].mediaUrl, takes[0].imageUrl, takes[0].image_url), onPress: () => onOpenPost(takes[0]) }] : []),
  ].slice(0, 4);

  const renderFeedCard = (item: any) => {
    const social = item.kind === "Socials";
    const wideImage = social && !!item.image;
    const compactImage = !wideImage && !!item.image;
    const tint = item.kind === "Music" ? "#C66BFF" : item.kind === "Events" ? "#D5B94A" : item.kind === "Market" ? "#E6B94A" : item.kind === "Jobs" ? "#69A9FF" : C.accent;
    return (
      <TouchableOpacity key={item.id} activeOpacity={0.9} onPress={item.onPress}
        style={{ marginHorizontal: 12, marginBottom: 10, padding: 12, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View style={{ width: 35, height: 35, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: tint + "25" }}>
            <Ionicons name={iconFor(item.kind)} size={17} color={tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{item.title}</Text>
            <Text style={{ color: C.text3, fontSize: 11, marginTop: 2 }}>{item.kind} · {item.sub}</Text>
          </View>
          <TouchableOpacity onPress={() => show(item.kind + " options")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={18} color={C.text3} />
          </TouchableOpacity>
        </View>
        {wideImage ? (
          <>
            {!!item.body && <Text style={{ color: C.text, fontSize: 14, lineHeight: 20, marginTop: 9 }} numberOfLines={3}>{item.body}</Text>}
            <Image source={{ uri: item.image }} style={{ width: "100%", height: 164, borderRadius: 10, marginTop: 10, backgroundColor: C.elevated }} resizeMode="cover" />
          </>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 9 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              {!!item.body && <Text style={{ color: C.text, fontSize: 13, lineHeight: 18 }} numberOfLines={3}>{item.body}</Text>}
              {!item.body && <Text style={{ color: C.text3, fontSize: 12 }}>Open {item.kind}</Text>}
            </View>
            {!!item.image && <Image source={{ uri: item.image }} style={{ width: 94, height: 76, borderRadius: 9, backgroundColor: C.elevated }} resizeMode="cover" />}
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 22, marginTop: 10 }}>
          <TouchableOpacity onPress={() => show("Like interaction is being connected")} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name={liked[item.id] ? "heart" : "heart-outline"} size={18} color={liked[item.id] ? "#FF4965" : C.text3} />
            <Text style={{ color: C.text3, fontSize: 11 }}>{item.raw.likes_count ?? item.raw.likes ?? ""}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="chatbubble-outline" size={17} color={C.text3} />
            <Text style={{ color: C.text3, fontSize: 11 }}>{item.raw.comments_count ?? item.raw.comments ?? ""}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="share-social-outline" size={17} color={C.text3} />
            <Text style={{ color: C.text3, fontSize: 11 }}>{item.raw.shares_count ?? ""}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Ionicons name="bookmark-outline" size={18} color={C.text3} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={s.flex} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 22 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}>
      {/* Four-card mobile feature carousel, each slide has a real destination. */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 4 }}>
        {featuredCards.map((card, index) => (
          <TouchableOpacity key={card.kind} activeOpacity={0.9} onPress={card.onPress}
            style={{ width: 0.94 * require("react-native").Dimensions.get("window").width, height: 174, marginRight: 10, borderRadius: 15, overflow: "hidden", borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated }}>
            {card.image ? <Image source={{ uri: card.image }} style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" /> : <LinearGradient colors={["#3C3517", "#17191D", "#101116"]} style={{ position: "absolute", width: "100%", height: "100%" }} />}
            <LinearGradient colors={["rgba(0,0,0,0.04)", "rgba(0,0,0,0.86)"]} style={{ position: "absolute", width: "100%", height: "100%" }} />
            <View style={{ flex: 1, justifyContent: "flex-end", padding: 16 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>{card.kind.toUpperCase()}  ·  FEATURED</Text>
              <Text style={{ color: "#FFFFFF", fontSize: 23, lineHeight: 28, fontWeight: "800", marginTop: 5 }} numberOfLines={2}>{card.title}</Text>
              <Text style={{ color: "#F0F0F0", fontSize: 12, marginTop: 3 }} numberOfLines={1}>{card.sub}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 9 }}>
                <View style={{ backgroundColor: C.accent, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name={card.kind === "Music" ? "play" : "arrow-forward"} size={13} color="#171717" />
                  <Text style={{ color: "#171717", fontSize: 11, fontWeight: "800" }}>{card.kind === "Music" ? "Listen Now" : "Explore"}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ flexDirection: "row", gap: 5 }}>{featuredCards.map((_, dot) => <View key={dot} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot === index ? C.accent : "#8C8C8C" }} />)}</View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* One horizontal rail; the remaining systems are reachable by swiping. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4, gap: 12 }}>
        {SYSTEMS.map((item) => {
          const active = item.id === system;
          return <TouchableOpacity key={item.id} onPress={() => goSystem(item.id)}
            style={{ width: 66, alignItems: "center", gap: 5 }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: active ? C.accent + "20" : C.card, borderWidth: active ? 2 : 1, borderColor: active ? C.accent : C.border }}>
              <Ionicons name={item.icon} size={23} color={active ? C.accent : C.text2} />
            </View>
            <Text style={{ color: active ? C.accent : C.text2, fontSize: 10, fontWeight: active ? "800" : "500" }} numberOfLines={1}>{item.label}</Text>
          </TouchableOpacity>;
        })}
      </ScrollView>

      {/* Compact composer, then a single unified feed. */}
      <TouchableOpacity onPress={onCompose} activeOpacity={0.85}
        style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 12, padding: 10, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: "800" }}>{(sessionName || "K").slice(0,1).toUpperCase()}</Text>
        </View>
        <Text style={{ color: C.text3, fontSize: 13, flex: 1 }}>What's on your mind?</Text>
        <Ionicons name="image-outline" size={21} color={C.text2} />
        <Ionicons name="videocam-outline" size={21} color={C.text2} />
        <Ionicons name="add-circle-outline" size={24} color={C.text2} />
      </TouchableOpacity>

      {!!submittedSearch && <View style={{ marginHorizontal: 12, marginBottom: 10, padding: 11, borderRadius: 12, backgroundColor: C.elevated, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ flex: 1, color: C.text, fontWeight: "700", fontSize: 13 }}>Search: {submittedSearch} · {searchResults.length} results</Text>
        <TouchableOpacity onPress={() => { setSubmittedSearch(""); setQ(""); }}><Ionicons name="close" size={18} color={C.text2} /></TouchableOpacity>
      </View>}
      <View style={{ marginHorizontal: 12, marginBottom: 10, paddingHorizontal: 12, height: 40, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated, flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="search" size={16} color={C.text3} />
        <TextInput value={q} onChangeText={setQ} onSubmitEditing={() => { if (!q.trim()) { show("Enter a search term"); return; } setSubmittedSearch(q.trim()); }} returnKeyType="search"
          placeholder="Search Kilode" placeholderTextColor={C.text3} style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 13 }} />
        {!!q && <TouchableOpacity onPress={() => { setQ(""); setSubmittedSearch(""); }}><Ionicons name="close-circle" size={17} color={C.text3} /></TouchableOpacity>}
      </View>


      {/* Compact discovery rails sit below Search; the mixed feed remains the main Home stream. */}
      {!submittedSearch && <View style={{ marginTop: 2, marginBottom: 4 }}>
        {tracks.length > 0 && <View style={{ marginHorizontal: 12, marginBottom: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 10 }}>
            <Ionicons name="musical-notes-outline" size={17} color={C.accent} />
            <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginLeft: 7, flex: 1 }}>Music</Text>
            <TouchableOpacity onPress={onOpenMusic} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingLeft: 8 }}>
              <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>MORE</Text><Ionicons name="arrow-forward" size={13} color={C.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
            {tracks.slice(0, 5).map((track, index) => {
              const cover = firstText(track.imageUrl, track.coverUrl, track.cover_url, track.image_url);
              return <TouchableOpacity key={String(track.id ?? index)} onPress={() => onPlayTrack(track)} activeOpacity={0.85} style={{ width: 112 }}>
                {cover ? <Image source={{ uri: cover }} style={{ width: 112, height: 94, borderRadius: 10, backgroundColor: C.elevated }} resizeMode="cover" /> :
                  <View style={{ width: 112, height: 94, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="musical-notes" size={26} color={C.accent} /></View>}
                <Text numberOfLines={1} style={{ color: C.text, fontSize: 12, fontWeight: "700", marginTop: 6 }}>{firstText(track.title, "Untitled track")}</Text>
                <Text numberOfLines={1} style={{ color: C.text3, fontSize: 10, marginTop: 2 }}>{firstText(track.artist, track.artist_name, "Kilode Music")}</Text>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </View>}
        {news.length > 0 && <View style={{ marginHorizontal: 12, marginBottom: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 10 }}>
            <Ionicons name="newspaper-outline" size={17} color={C.accent} />
            <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginLeft: 7, flex: 1 }}>Media</Text>
            <TouchableOpacity onPress={() => onOpenMedia()} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingLeft: 8 }}>
              <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>MORE</Text><Ionicons name="arrow-forward" size={13} color={C.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
            {news.slice(0, 4).map((article, index) => {
              const cover = firstText(article.imageUrl, article.image_url, article.image);
              return <TouchableOpacity key={String(article.id ?? index)} onPress={() => onOpenMedia(String(article.id))} activeOpacity={0.85} style={{ width: 218, borderRadius: 11, overflow: "hidden", borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated }}>
                {cover ? <Image source={{ uri: cover }} style={{ width: 218, height: 102, backgroundColor: C.elevated }} resizeMode="cover" /> : <View style={{ width: 218, height: 72, alignItems: "center", justifyContent: "center" }}><Ionicons name="newspaper-outline" size={23} color={C.accent} /></View>}
                <View style={{ padding: 9 }}>
                  <Text numberOfLines={2} style={{ color: C.text, fontSize: 12, lineHeight: 16, fontWeight: "800" }}>{firstText(article.title, "Latest story")}</Text>
                  {!!firstText(article.kicker, article.summary) && <Text numberOfLines={2} style={{ color: C.text3, fontSize: 10, lineHeight: 14, marginTop: 4 }}>{firstText(article.kicker, article.summary)}</Text>}
                </View>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </View>}
        {events.length > 0 && <View style={{ marginHorizontal: 12, marginBottom: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 10 }}>
            <Ionicons name="calendar-outline" size={17} color={C.accent} />
            <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginLeft: 7, flex: 1 }}>Events</Text>
            <TouchableOpacity onPress={onOpenEvents} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingLeft: 8 }}>
              <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>MORE</Text><Ionicons name="arrow-forward" size={13} color={C.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
            {events.slice(0, 4).map((event, index) => {
              const cover = firstText(event.imageUrl, event.image_url, event.cover_url);
              return <TouchableOpacity key={String(event.id ?? index)} onPress={() => onOpenItem("Events", event)} activeOpacity={0.85} style={{ width: 174, padding: 9, borderRadius: 11, borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated }}>
                {!!cover && <Image source={{ uri: cover }} style={{ width: "100%", height: 82, borderRadius: 8, marginBottom: 7 }} resizeMode="cover" />}
                <Text numberOfLines={2} style={{ color: C.text, fontSize: 12, lineHeight: 16, fontWeight: "800" }}>{firstText(event.title, "Upcoming event")}</Text>
                <Text numberOfLines={1} style={{ color: C.text3, fontSize: 10, marginTop: 4 }}>{firstText(event.venue, event.location, event.meta, event.date, "Explore event")}</Text>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </View>}
        {market.length > 0 && <View style={{ marginHorizontal: 12, marginBottom: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 10 }}>
            <Ionicons name="bag-handle-outline" size={17} color={C.accent} />
            <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginLeft: 7, flex: 1 }}>Market</Text>
            <TouchableOpacity onPress={onOpenMarket} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingLeft: 8 }}>
              <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>MORE</Text><Ionicons name="arrow-forward" size={13} color={C.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
            {market.slice(0, 5).map((product, index) => {
              const cover = firstText(product.imageUrl, product.image_url, product.image, product.cover_url);
              return <TouchableOpacity key={String(product.id ?? index)} onPress={() => onOpenItem("Market", product)} activeOpacity={0.85} style={{ width: 132 }}>
                {cover ? <Image source={{ uri: cover }} style={{ width: 132, height: 94, borderRadius: 10, backgroundColor: C.elevated }} resizeMode="cover" /> : <View style={{ width: 132, height: 94, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="bag-handle-outline" size={25} color={C.accent} /></View>}
                <Text numberOfLines={1} style={{ color: C.text, fontSize: 12, fontWeight: "700", marginTop: 6 }}>{firstText(product.title, "Market listing")}</Text>
                <Text numberOfLines={1} style={{ color: C.accent, fontSize: 11, fontWeight: "700", marginTop: 2 }}>{firstText(product.price, product.price_label, product.category, "View listing")}</Text>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </View>}
      </View>}

      {(submittedSearch ? searchResults : filtered).length ? (submittedSearch ? searchResults : filtered).map(renderFeedCard) : (
        <View style={{ marginHorizontal: 12, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, alignItems: "center" }}>
          <Ionicons name="sparkles-outline" size={25} color={C.accent} />
          <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 8 }}>{system === "all" ? "Your Kilode feed starts here" : "Nothing here yet"}</Text>
          <Text style={{ color: C.text3, fontSize: 12, textAlign: "center", marginTop: 5, lineHeight: 17 }}>New content published by each architecture will appear here automatically when its feed is connected.</Text>
        </View>
      )}
    </ScrollView>
  );
}
