import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Share,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Platform,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { Audio } from "expo-av";
import { DESKS, CREATE, LISTINGS, STORIES, TAKES, ROOMS, NEWS, TRACKS, ACTIVITY } from "./data";
import { AuthProvider, useAuth, loadSocialsFeed, publishSocialPost } from "./lib/auth";
import { getBackendMode } from "./lib/config";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { AuthScreen } from "./screens/Auth";
import { KilodeWordmark } from "./components/KilodeWordmark";
import { MediaScreen } from "./screens/Media";
import { HomeScreen } from "./screens/Home";
import { SettingsScreen } from "./screens/Settings";
import { DeskDetailScreen } from "./screens/DeskDetail";
import { UserProfileScreen } from "./screens/UserProfile";
import { PostDetailScreen } from "./screens/PostDetail";
import { SocialsScreen } from "./screens/Socials";
import { EventsScreen } from "./screens/Events";
import { MarketScreen, PRODUCTS } from "./screens/Market";
import { JobsScreen, JOBS } from "./screens/Jobs";
import { CommunitiesScreen } from "./screens/Communities";
import { CreatorsScreen } from "./screens/Creators";
import { TrackDetailScreen } from "./screens/TrackDetail";
import { ArtistDetailScreen } from "./screens/ArtistDetail";
import { CommentsSheet } from "./screens/Comments";
import { KilodeTabBar } from "./components/ui";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "./components/ui/EmptyState";
import { ConnectionBanner } from "./components/ui/ConnectionBanner";
import { blockUser, submitReport, getBlockedUsers } from "./lib/moderation";
import { primaryDesksFor, capabilitiesFor, can, toolsFor, accountKindLabel } from "./lib/permissions";

const SYSTEM_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  "💼": "briefcase-outline", "🛍️": "bag-handle-outline", "🏠": "home-outline",
  "📅": "calendar-outline", "🎬": "film-outline", "🎵": "musical-notes-outline",
  "💬": "chatbubble-ellipses-outline", "📢": "megaphone-outline", "📚": "book-outline",
  "⚽": "football-outline", "💻": "laptop-outline", "▶️": "play-circle-outline", "✏️": "create-outline",
};
const systemIconName = (emoji: string): keyof typeof Ionicons.glyphMap => SYSTEM_ICON[emoji] || "apps-outline";

function isDeviceSession(session: { token?: string; localOnly?: boolean } | null | undefined) {
  if (!session) return false;
  return !!session.localOnly || session.token === "guest" || (session.token || "").startsWith("local:");
}

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  useEffect(() => {
    const homePreview = Platform.OS === "web" && typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("preview") === "home";
    if (homePreview && !authLoading && !session) signInGuest("Guest");
  }, [authLoading, session, signInGuest]);
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (system === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

  const [tab, setTab] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentTake, setCommentTake] = useState<any | null>(null);
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [boot, setBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<"live" | "mock" | "error">("mock");
  const [takes, setTakes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedDeskItem, setSelectedDeskItem] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [displayName, setDisplayName] = useState("");
  const [displayHandle, setDisplayHandle] = useState("");
  const [blocked, setBlocked] = useState<string[]>([]);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  const playTrack = useCallback(async (track: any) => {
    setNowPlaying(track);
    if (!track?.previewUrl) {
      setIsPlaying(false);
      show("No playable audio preview is attached to this track yet.");
      return;
    }
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => undefined);
        await soundRef.current.unloadAsync().catch(() => undefined);
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const created = await Audio.Sound.createAsync({ uri: track.previewUrl }, { shouldPlay: true, volume: 1 }, status => {
        if (status.isLoaded) setIsPlaying(status.isPlaying);
      });
      soundRef.current = created.sound;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      show("Audio preview could not load. Check your connection and try again.");
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!soundRef.current) {
      if (nowPlaying?.previewUrl) await playTrack(nowPlaying);
      else show("This track has no audio preview attached yet.");
      return;
    }
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) await soundRef.current.pauseAsync();
      else if (status.isLoaded) await soundRef.current.playAsync();
    } catch {
      show("Could not change playback state.");
    }
  }, [nowPlaying, playTrack]);
  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false);
    setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null); setSelectedTrack(null); setSelectedArtist(null);
  };

  const loadAll = useCallback(async () => {
    if (Platform.OS === "web") {
      setTakes(TAKES); setRooms(ROOMS); setNews(NEWS); setTracks(TRACKS); setActivity(ACTIVITY);
      setSource("mock"); return "mock" as const;
    }
    const [t, r, n, tr, a] = await Promise.all([getBackendMode() === "supabase" ? loadSocialsFeed() : fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity(session?.token)]);
    setTakes(Array.isArray(t.data) ? t.data : []); setRooms(Array.isArray(r.data) ? r.data : []);
    setNews(Array.isArray(n.data) ? n.data : []); setTracks(Array.isArray(tr.data) ? tr.data : []);
    setActivity(Array.isArray(a.data) ? a.data : []);
    const sources = [t, r, n, tr].map((x) => x.source);
    const next = sources.every((v) => v === "live") ? "live" : sources.some((v) => v === "error") ? "error" : "mock";
    setSource(next as any); return next as any;
  }, [session?.token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await getBlockedUsers(); if (!cancelled) setBlocked(b);
      await loadAll(); if (!cancelled) setBoot(false);
    })();
    return () => { cancelled = true; };
  }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await loadAll(); show("Refreshed"); } catch { show("Could not refresh."); }
    finally { setRefreshing(false); }
  };

  if (session && (authLoading || boot)) {
    return (<SafeAreaView style={[s.root, s.center, { backgroundColor: C.bg }]}><ActivityIndicator color={C.accent} size="large" /><Text style={[s.sub, { marginTop: 12 }]}>Loading Kilode…</Text></SafeAreaView>);
  }
  if (!session) {
    return (<AuthScreen isDark={isDark} C={C} onSignIn={signIn} onSignUp={signUp} onGuest={() => { signInGuest("Guest"); show("Guest mode"); }} onGoogle={() => show("Google sign-in isn't connected yet.")} show={show} />);
  }

  const deviceSession = isDeviceSession(session as any);

  const Header = ({ title }: { title?: string }) => (
    <View style={s.header}>
      <View style={s.headerLeft}>{title ? <Text style={s.headerTitle}>{title}</Text> : <KilodeWordmark size="small" />}</View>
      <View style={[s.headerRight, { gap: 6 }]}>
        <TouchableOpacity style={s.iconBtn} onPress={() => show("Search from Home search bar.")} accessibilityLabel="Search"><Ionicons name="search-outline" size={18} color={C.text} /></TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} onPress={() => go("activity")} accessibilityLabel="Notifications"><Ionicons name="notifications-outline" size={18} color={C.text} /></TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} onPress={() => setThemeMode(isDark ? "light" : "dark")} accessibilityLabel="Theme"><Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={C.text} /></TouchableOpacity>
        <TouchableOpacity style={s.avatar} onPress={() => go("myspace")} accessibilityLabel="Profile"><Text style={s.avatarText}>{(session.name || "K").slice(0, 1).toUpperCase()}</Text></TouchableOpacity>
      </View>
    </View>
  );

  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;
  const eventList = (LISTINGS.events || []).map((e: any) => ({ id: e.id, title: e.title, meta: e.meta, price: e.price, tag: e.tag }));

  const body = () => {
    if (settingsOpen) return <SettingsScreen s={s} C={C} isDark={isDark} sessionHandle={session.handle || ""} sessionKind={session.kind || "member"} localOnly={deviceSession} onBack={() => setSettingsOpen(false)} onDeleteAccount={async () => ({ ok: false, error: "Account deletion is not connected to the dedicated backend yet." })} show={show} />;
    if (selectedPost) return (
      <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} following={!!following[String(selectedPost.handle || selectedPost.name)]}
        onBack={() => setSelectedPost(null)}
        onLike={() => setLiked((p) => ({ ...p, [String(selectedPost.id)]: !p[String(selectedPost.id)] }))}
        onComment={() => setCommentTake(selectedPost)}
        onFollow={() => setFollowing((p) => ({ ...p, [String(selectedPost.handle || selectedPost.name)]: !p[String(selectedPost.handle || selectedPost.name)] }))}
        onReport={async () => { await submitReport("post", String(selectedPost.id), "other"); show("Report saved."); }}
        onBlock={async () => { const h = String(selectedPost.handle || selectedPost.name); await blockUser(h); setBlocked((p) => p.includes(h) ? p : [...p, h]); setSelectedPost(null); show("Blocked @" + h); }}
        show={show} />
    );
    if (selectedProfile) return (
      <UserProfileScreen s={s} C={C} user={selectedProfile} posts={takes.filter((p: any) => String(p.handle || p.name) === String(selectedProfile.handle || selectedProfile.name))}
        isFollowing={!!following[String(selectedProfile.handle || selectedProfile.name)]}
        onBack={() => setSelectedProfile(null)}
        onToggleFollow={() => setFollowing((p) => ({ ...p, [String(selectedProfile.handle || selectedProfile.name)]: !p[String(selectedProfile.handle || selectedProfile.name)] }))}
        onOpenPost={(post) => { setSelectedProfile(null); setSelectedPost(post); }} />
    );
    if (selectedTrack) return (<TrackDetailScreen s={s} C={C} track={selectedTrack} related={tracks} onBack={() => setSelectedTrack(null)} onPlay={playTrack} onOpenArtist={(n) => { setSelectedTrack(null); setSelectedArtist(n); }} onOpenTrack={setSelectedTrack} show={show} />);
    if (selectedArtist) return (<ArtistDetailScreen s={s} C={C} artistName={selectedArtist} tracks={tracks} onBack={() => setSelectedArtist(null)} onOpenTrack={(t) => { setSelectedArtist(null); setSelectedTrack(t); }} onPlay={setNowPlaying} show={show} />);
    if (selectedDeskItem) return <DeskDetailScreen s={s} C={C} system={String(selectedDeskItem.system || selectedDeskItem.type || tab)} item={selectedDeskItem} onBack={() => setSelectedDeskItem(null)} show={show} />;
    if (tab === "media") return <MediaScreen s={s} C={C} news={news} initialArticleId={selectedArticleId} onBack={() => go("home")} show={show} />;
    if (tab === "events") return <EventsScreen s={s} C={C} events={eventList} onBack={() => go("home")} show={show} />;
    if (tab === "market") return <MarketScreen s={s} C={C} onBack={() => go("home")} show={show} accountKind={session.kind} />;
    if (tab === "jobs") return <JobsScreen s={s} C={C} onBack={() => go("home")} show={show} accountKind={session.kind} />;
    if (tab === "chat") return <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "communities") return <CommunitiesScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "creators") return <CreatorsScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "music") return <MusicScreen s={s} C={C} onBack={() => go("home")} show={show} onPlay={setNowPlaying} onOpenTrack={setSelectedTrack} onOpenArtist={setSelectedArtist} accountKind={session.kind} />;
    if (tab === "cinema") return <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} accountKind={session.kind} />;
    if (tab === "activity") {
      const chips = ["All", "Likes", "Comments", "Follows"];
      return (
        <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 28 }} refreshControl={rc} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, paddingTop: 4, marginBottom: 8 }}><Text style={{ color: C.text, fontSize: 22, fontWeight: "800" }}>Notifications</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
            {chips.map((f, i) => (
              <View key={f} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: i === 0 ? C.accent : "transparent", borderWidth: 1, borderColor: i === 0 ? C.accent : C.border }}>
                <Text style={{ color: i === 0 ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{f}</Text>
              </View>
            ))}
          </ScrollView>
          {(activity.length ? activity : [
            { id: "n1", icon: "❤️", text: "Rema liked your post", time: "2m", unread: true, lane: "socials" },
            { id: "n2", icon: "💬", text: "Ayra commented on your take", time: "18m", unread: true, lane: "socials" },
            { id: "n3", icon: "👤", text: "Burna Boy started following you", time: "1h", unread: false, lane: "socials" },
            { id: "n4", icon: "🎵", text: "New drop in Afrobeats charts", time: "3h", unread: false, lane: "music" },
            { id: "n5", icon: "📅", text: "Lagos Music Festival is this weekend", time: "5h", unread: false, lane: "events" },
          ]).map((a: any) => (
            <TouchableOpacity key={a.id} onPress={() => go(a.lane || "home")} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 12, marginBottom: 8, padding: 12, borderRadius: 14, backgroundColor: a.unread ? C.elevated : C.card, borderWidth: 1, borderColor: a.unread ? C.accent + "44" : C.border }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 18 }}>{a.icon}</Text></View>
              <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: a.unread ? "700" : "600", fontSize: 14 }}>{a.text}</Text><Text style={{ color: C.text3, fontSize: 11, marginTop: 3 }}>{a.time}</Text></View>
              {a.unread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent }} /> : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }
    if (tab === "socials") {
      return (
        <SocialsScreen s={s} C={C} takes={takes} blocked={blocked} liked={liked} following={following} sessionName={session.name || "K"}
          refreshing={refreshing} onRefresh={onRefresh} onCompose={() => setComposeOpen(true)}
          onOpenPost={setSelectedPost} onOpenProfile={setSelectedProfile}
          onLike={(id) => setLiked((p) => ({ ...p, [id]: !p[id] }))} onComment={setCommentTake}
          onFollow={(key, name) => { setFollowing((p) => ({ ...p, [key]: !p[key] })); show(following[key] ? `Unfollowed ${name}` : `Following ${name}`); }}
          onReport={async (id) => { await submitReport("post", id, "other"); show("Reported locally"); }}
          onBlock={async (handle) => { await blockUser(handle); setBlocked((p) => p.includes(handle) ? p : [...p, handle]); show(`Blocked @${handle}`); }}
          show={show} />
      );
    }
    if (tab === "myspace") {
      const desks = primaryDesksFor(session.kind);
      return (
        <ScrollView style={s.flex} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", marginBottom: 16 }}>My Space</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: C.text, fontSize: 28, fontWeight: "800" }}>{(session.name || "K").slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>{displayName || session.name}</Text>
              <Text style={{ color: C.text2, marginTop: 2 }}>@{displayHandle || session.handle}</Text>
              <Text style={{ color: C.accent, fontSize: 12, fontWeight: "700", marginTop: 4 }}>{accountKindLabel(session.kind)}</Text>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: deviceSession ? "rgba(229,193,88,0.15)" : "rgba(34,197,94,0.15)" }}>
                  <Text style={{ color: deviceSession ? C.accent : "#22C55E", fontSize: 10, fontWeight: "800" }}>
                    {deviceSession ? "Device session" : "Live account"}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={{ borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => show("Profile editor opens next.")}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 22 }}>
            <View style={{ alignItems: "center" }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 18 }}>{takes.length || 0}</Text><Text style={s.meta}>Posts</Text></View>
            <View style={{ alignItems: "center" }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 18 }}>—</Text><Text style={s.meta}>Followers</Text></View>
            <View style={{ alignItems: "center" }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 18 }}>—</Text><Text style={s.meta}>Following</Text></View>
          </View>
          <Text style={{ color: C.text3, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginTop: 22, marginBottom: 10 }}>
            {accountKindLabel(session.kind).toUpperCase()} TOOLS
          </Text>
          <View style={{ gap: 8 }}>
            {toolsFor(session.kind).map((tool) => (
              <TouchableOpacity
                key={tool.id}
                onPress={() => {
                  if (tool.tab === "compose") { setComposeOpen(true); return; }
                  go(tool.tab);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: C.elevated,
                  borderWidth: 1,
                  borderColor: C.border,
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }}>{tool.label}</Text>
                  <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>{tool.hint}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.text3} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: C.text3, fontSize: 11, marginTop: 10 }}>
            Open systems: {desks.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(" · ") || "—"}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
            {["Saved", "Activity", "Settings"].map((label) => (
              <TouchableOpacity key={label} onPress={() => label === "Settings" ? setSettingsOpen(true) : label === "Activity" ? go("activity") : show("Saved when sync is live.")}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: "center" }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => { signOut(); show("Signed out"); }}>
            <Text style={{ color: C.danger || "#ff6b6b", fontWeight: "700" }}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    if (DESKS.some((d) => d.id === tab) && !["events", "market", "jobs", "chat", "creators", "communities"].includes(tab)) {
      const d = DESKS.find((x) => x.id === tab);
      const items = LISTINGS[tab] || [];
      return (
        <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
          <View style={s.deskHero}><Text style={s.h1}>{d?.label || tab}</Text><Text style={s.sub}>{d?.blurb}</Text></View>
          {items.map((item: any) => (
            <TouchableOpacity key={item.id} style={s.roomRow} onPress={() => setSelectedDeskItem(item)}>
              <View style={s.flex}><Text style={s.roomName}>{item.title}</Text><Text style={s.meta}>{item.meta}</Text></View>
              {item.price ? <Text style={{ color: C.accent, fontWeight: "700" }}>{item.price}</Text> : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    return (
      <HomeScreen
        s={s} C={C} sessionName={session.name || "there"} news={news} tracks={tracks} takes={takes} liked={liked}
        events={LISTINGS.events || []} market={PRODUCTS} jobs={JOBS}
        refreshing={refreshing} onRefresh={onRefresh}
        onOpenMedia={(id) => { if (id) setSelectedArticleId(id); go("media"); }}
        onOpenMusic={() => go("music")} onOpenEvents={() => go("events")} onOpenMarket={() => go("market")}
        onOpenJobs={() => go("jobs")}
        onOpenSystem={(id) => go(id)}
        onOpenSocials={() => go("socials")} onOpenPost={(p) => setSelectedPost(p)} onOpenProfile={(u) => setSelectedProfile(u)}
        onCompose={() => setComposeOpen(true)} onPlayTrack={(t) => setSelectedTrack(t)} show={show}
      />
    );
  };

  const headerTitle =
    settingsOpen ? "Settings"
    : tab === "activity" ? "Notifications"
    : tab === "myspace" ? "My Space"
    : tab === "media" ? "Media"
    : tab === "events" ? "Events"
    : tab === "market" ? "Market"
    : tab === "jobs" ? "Jobs"
    : tab === "chat" ? "Chat"
    : tab === "communities" ? "Communities"
    : tab === "creators" ? "Creators"
    : tab === "cinema" ? "Cinema"
    : tab === "music" ? "Music"
    : DESKS.find((d) => d.id === tab)?.label;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      {Platform.OS !== "web" ? <ConnectionBanner source={source} isDark={isDark} localOnly={deviceSession} /> : null}
      <View style={s.flex}>{body()}</View>
      {nowPlaying ? (
        <View style={[s.player, { gap: 10 }]}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent, alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="musical-notes" size={16} color="#fff" />
          </View>
          <View style={s.flex}>
            <Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text>
            <Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}{nowPlaying.previewKind === "sample" ? " · sample audio" : ""}</Text>
            {isPlaying ? <View style={{ flexDirection: "row", gap: 3, marginTop: 4, alignItems: "flex-end" }}><View style={{ width: 3, height: 6, borderRadius: 2, backgroundColor: C.accent }} /><View style={{ width: 3, height: 11, borderRadius: 2, backgroundColor: C.accent }} /><View style={{ width: 3, height: 8, borderRadius: 2, backgroundColor: C.accent }} /><View style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: C.accent }} /></View> : null}
          </View>
          <TouchableOpacity onPress={togglePlayback} accessibilityRole="button" accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}><Ionicons name={isPlaying ? "pause" : "play"} size={21} color={C.accent} /></TouchableOpacity>
          <TouchableOpacity onPress={async () => { if (soundRef.current) { await soundRef.current.stopAsync().catch(() => undefined); await soundRef.current.unloadAsync().catch(() => undefined); soundRef.current = null; } setNowPlaying(null); setIsPlaying(false); }} accessibilityRole="button" accessibilityLabel="Close player"><Ionicons name="close" size={18} color={C.text2} /></TouchableOpacity>
        </View>
      ) : null}
      <KilodeTabBar
        active={tab === "home" ? "home" : tab === "media" ? "media" : tab === "socials" ? "socials" : tab === "myspace" ? "myspace" : "more"}
        onTab={(id) => { if (id === "more") { setMoreOpen(true); return; } go(id); }}
        onCreate={() => setCreateOpen(true)}
        isDark={isDark}
      />
      <Modal visible={composeOpen} transparent animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setComposeOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Create Post</Text><TouchableOpacity onPress={() => setComposeOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <TextInput multiline autoFocus style={{ minHeight: 120, backgroundColor: C.input, borderRadius: 16, padding: 14, color: C.text, borderWidth: 1, borderColor: C.border, fontSize: 16, textAlignVertical: "top" }} placeholder="What's on your mind?" placeholderTextColor={C.text3} value={composeText} onChangeText={setComposeText} />
            <TouchableOpacity style={[s.primaryBtn, { marginTop: 14, opacity: composeText.trim() && !posting ? 1 : 0.5 }]} disabled={!composeText.trim() || posting}
              onPress={async () => {
                if (!session.token || session.token === "guest") { show("Sign in to publish."); return; }
                setPosting(true);
                try {
                  if (session.userId && getBackendMode() === "supabase") {
                    const r = await publishSocialPost(composeText, session.userId);
                    if (r.source === "live" && r.data) {
                      setTakes((p) => [r.data, ...p]);
                      setComposeText(""); setComposeOpen(false); go("socials"); show("Posted live");
                    } else {
                      show(r.error || "Could not publish to the live feed.");
                    }
                  } else {
                    const r = await postTake(composeText, session.token);
                    if (r.ok && (r as any).data) {
                      setTakes((p) => [(r as any).data, ...p]);
                      setComposeText(""); setComposeOpen(false); go("socials");
                      show(r.source === "live" ? "Posted live" : "Added to preview");
                    } else show((r as any).error || "Could not post.");
                  }
                } catch (e) { show(e instanceof Error ? e.message : "Could not post."); }
                finally { setPosting(false); }
              }}>
              <Text style={s.primaryBtnText}>{posting ? "Posting…" : "Post"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>More on Kilode</Text><TouchableOpacity onPress={() => setMoreOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <View style={s.deskGrid}>
              {[...DESKS, { id: "creators", label: "Creators", icon: "✏️" }, { id: "communities", label: "Communities", icon: "💬" }, { id: "chat", label: "Chat", icon: "💬" }, { id: "myspace", label: "My Space", icon: "🏠" }].map((d) => (
                <TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}>
                  <Ionicons name={systemIconName(d.icon)} size={22} color={C.accent} />
                  <Text style={s.deskGridLabel}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Create</Text><TouchableOpacity onPress={() => setCreateOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <View style={s.deskGrid}>{CREATE.map((o) => {
              const allowed = !(o as any).capability || can(session.kind, (o as any).capability);
              return (
              <TouchableOpacity key={o.label} style={[s.deskGridItem, !allowed && { opacity: 0.4 }]} onPress={() => {
                if (!allowed) { show(`Your account type cannot ${o.label.toLowerCase()} yet.`); return; }
                if (o.label === "Post") { setCreateOpen(false); setComposeOpen(true); return; }
                setCreateOpen(false); go(o.tab);
              }}>
                <Text style={{ fontSize: 22 }}>{o.icon}</Text><Text style={s.deskGridLabel}>{o.label}</Text>
              </TouchableOpacity>
              );
            })}</View>
          </View>
        </View>
      </Modal>
      <CommentsSheet visible={!!commentTake} onClose={() => setCommentTake(null)} takeId={commentTake?.id || ""} takeAuthor={commentTake?.name || ""} takeText={commentTake?.text || ""} token={session.token} C={C} isDark={isDark} show={show} />
      {toast ? <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View> : null}
    </SafeAreaView>
  );
}

export function KilodeRoot() {
  return <AuthProvider><KilodeApp /></AuthProvider>;
}
