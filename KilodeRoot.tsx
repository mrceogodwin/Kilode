import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Share,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Platform,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DESKS, CREATE, LISTINGS, STORIES, TAKES, ROOMS, NEWS, TRACKS, ACTIVITY } from "./data";
import { AuthProvider, useAuth, loadSocialsFeed, publishSocialPost } from "./lib/auth";
import { getBackendMode } from "./lib/config";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, fetchEvents, fetchMarketListings, fetchJobs, postTake } from "./lib/api";
import { getSupabase, listRecentArticles, listRecentTracks, listRecentEvents, listRecentMarketListings, listRecentJobs, togglePostLike, updateOwnProfile, fetchOwnProfile } from "./lib/supabase";
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
import { primaryDesksFor, capabilitiesFor, can, toolsFor, accountKindLabel, workspaceFor } from "./lib/permissions";

const SYSTEM_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  "💼": "briefcase-outline", "🛍️": "bag-handle-outline", "🏠": "home-outline",
  "📅": "calendar-outline", "🎬": "film-outline", "🎵": "musical-notes-outline",
  "💬": "chatbubble-ellipses-outline", "📢": "megaphone-outline", "📚": "book-outline",
  "⚽": "football-outline", "💻": "laptop-outline", "▶️": "play-circle-outline", "✏️": "create-outline",
};
const systemIconName = (emoji: string): keyof typeof Ionicons.glyphMap => SYSTEM_ICON[emoji] || "apps-outline";

const PREVIEW_POSTS_KEY = "@kilode/preview-posts";

async function readPreviewPosts(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(PREVIEW_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function savePreviewPost(post: any): Promise<void> {
  const current = await readPreviewPosts();
  const next = [post, ...current.filter((item) => String(item.id) !== String(post.id))].slice(0, 100);
  await AsyncStorage.setItem(PREVIEW_POSTS_KEY, JSON.stringify(next));
}

function mergePreviewPosts(seed: any[], saved: any[]): any[] {
  const ids = new Set<string>();
  return [...saved, ...seed].filter((item) => {
    const id = String(item.id);
    if (ids.has(id)) return false;
    ids.add(id);
    return true;
  });
}

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
  const [homeSearchOpen, setHomeSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createContext, setCreateContext] = useState("home");
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
  const [events, setEvents] = useState<any[]>(LISTINGS.events || []);
  const [eventsLive, setEventsLive] = useState(false);
  const [marketItems, setMarketItems] = useState<any[]>(PRODUCTS);
  const [jobItems, setJobItems] = useState<any[]>(JOBS);
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
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
  const [profileBio, setProfileBio] = useState("");
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (session.userId && getBackendMode() === "supabase") {
          const profile = await fetchOwnProfile(session.userId);
          if (!active) return;
          setDisplayName(profile?.display_name || session.name || "");
          setDisplayHandle(profile?.handle || session.handle || "");
          setProfileBio(profile?.bio || "");
          return;
        }
        const raw = await AsyncStorage.getItem("@kilode/profile:" + (session.userId || session.handle));
        if (!active) return;
        if (raw) {
          const profile = JSON.parse(raw);
          setDisplayName(profile.displayName || session.name || "");
          setDisplayHandle(profile.handle || session.handle || "");
          setProfileBio(profile.bio || "");
        } else {
          setDisplayName(session.name || "");
          setDisplayHandle(session.handle || "");
          setProfileBio("");
        }
      } catch {
        if (active) {
          setDisplayName(session.name || "");
          setDisplayHandle(session.handle || "");
        }
      }
    })();
    return () => { active = false; };
  }, [session.userId, session.handle, session.name]);

  const show = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); }, []);

  const playTrack = useCallback(async (track: any) => {
    setNowPlaying(track);
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => undefined);
        await soundRef.current.unloadAsync().catch(() => undefined);
        soundRef.current = null;
      }
      if (!track?.previewUrl) {
        setIsPlaying(false);
        show("No playable audio preview is attached to this track yet.");
        return;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const created = await Audio.Sound.createAsync({ uri: track.previewUrl }, { shouldPlay: true, volume: 1, progressUpdateIntervalMillis: 250 }, status => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setPlaybackProgress(status.durationMillis ? status.positionMillis / status.durationMillis : 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackProgress(0);
          }
        }
      });
      soundRef.current = created.sound;
      setIsPlaying(created.status.isLoaded ? created.status.isPlaying : true);
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

  useEffect(() => () => {
    if (soundRef.current) {
      void soundRef.current.stopAsync().catch(() => undefined);
      void soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
  }, []);

  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false);
    setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null); setSelectedTrack(null); setSelectedArtist(null);
  };

  const loadAll = useCallback(async () => {
    // One data-loading path feeds both the native screens and the web visual preview.
    // Supabase reads are used when configured; the custom API is used otherwise.
    const supabaseMode = getBackendMode() === "supabase";
    const [t, r, n, tr, a, ev, market, jobs, savedPreviewPosts] = await Promise.all([
      supabaseMode ? loadSocialsFeed(session?.userId) : fetchTakes(),
      fetchRooms(),
      supabaseMode
        ? listRecentArticles().then((x) => ({ ...x, source: x.ok ? "live" as const : "error" as const }))
        : fetchNews(),
      supabaseMode
        ? listRecentTracks().then((x) => ({ ...x, source: x.ok ? "live" as const : "error" as const }))
        : fetchTracks(),
      fetchActivity(session?.token),
      supabaseMode
        ? listRecentEvents().then((x) => ({ ...x, source: x.ok ? "live" as const : "error" as const }))
        : fetchEvents(),
      supabaseMode
        ? listRecentMarketListings().then((x) => ({ ...x, source: x.ok ? "live" as const : "error" as const }))
        : fetchMarketListings(),
      supabaseMode
        ? listRecentJobs().then((x) => ({ ...x, source: x.ok ? "live" as const : "error" as const }))
        : fetchJobs(),
      readPreviewPosts(),
    ]);
    // Live empty lists remain empty; seed data is only a fallback when a source is not live.
    setTakes(t.source === "live" && Array.isArray(t.data) ? t.data : mergePreviewPosts(TAKES, savedPreviewPosts));
    if (t.source === "live" && Array.isArray(t.data)) {
      setLiked(Object.fromEntries(t.data.filter((post: any) => post.likedByMe).map((post: any) => [String(post.id), true])));
    }
    setRooms(r.source === "live" && Array.isArray(r.data) ? r.data : ROOMS);
    setNews(n.source === "live" && Array.isArray(n.data) ? n.data : NEWS);
    setTracks(tr.source === "live" && Array.isArray(tr.data) ? tr.data : TRACKS);
    setEvents(ev.source === "live" && Array.isArray(ev.data) ? ev.data : (LISTINGS.events || []));
    setEventsLive(ev.source === "live");
    setMarketItems(market.source === "live" && Array.isArray(market.data) ? market.data : PRODUCTS);
    setJobItems(jobs.source === "live" && Array.isArray(jobs.data) ? jobs.data : JOBS);
    setActivity(a.source === "live" && Array.isArray(a.data) ? a.data : ACTIVITY);
    const sources = [t, n, tr, ev, market, jobs].map((x) => x.source);
    const next = sources.every((v) => v === "live") ? "live" : sources.some((v) => v === "error") ? "error" : "mock";
    setSource(next as any); return next as any;
  }, [session?.token]);

  const handleLikePost = async (postId: string) => {
    const id = String(postId);
    if (getBackendMode() === "supabase") {
      if (!session?.userId || session.localOnly || session.token === "guest") {
        show("Sign in to your live Kilode account to like posts.");
        return;
      }
      try {
        const result = await togglePostLike(id, session.userId);
        if (!result.ok || typeof result.liked !== "boolean") {
          show(result.error || "Could not update like.");
          return;
        }
        setLiked((previous) => ({ ...previous, [id]: result.liked! }));
        setTakes((previous) => previous.map((post) => {
          if (String(post.id) !== id) return post;
          const currentLikes = Number(post.likes_count ?? post.likes ?? 0);
          return { ...post, likes: Math.max(0, currentLikes + (result.liked ? 1 : -1)), likes_count: Math.max(0, currentLikes + (result.liked ? 1 : -1)), likedByMe: result.liked };
        }));
      } catch {
        show("Could not update like. Check your connection and try again.");
      }
      return;
    }
    const nextLiked = !liked[id];
    setLiked((previous) => ({ ...previous, [id]: nextLiked }));
    setTakes((previous) => previous.map((post) => {
      if (String(post.id) !== id) return post;
      const currentLikes = Number(post.likes_count ?? post.likes ?? 0);
      return { ...post, likes: Math.max(0, currentLikes + (nextLiked ? 1 : -1)), likes_count: Math.max(0, currentLikes + (nextLiked ? 1 : -1)), likedByMe: nextLiked };
    }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await getBlockedUsers(); if (!cancelled) setBlocked(b);
      await loadAll(); if (!cancelled) setBoot(false);
    })();
    return () => { cancelled = true; };
  }, [loadAll]);

  // One debounced Realtime subscription refreshes all currently supported
  // backend-backed Home sources. Pull-to-refresh remains the fallback if Realtime
  // is not enabled in the Supabase project.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { void loadAll(); }, 220);
    };
    const channel = sb.channel("kilode-shared-discovery")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_replies" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "tracks" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "market_listings" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, scheduleRefresh)
      .subscribe();
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void sb.removeChannel(channel);
    };
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
        <TouchableOpacity style={s.iconBtn} onPress={() => { if (tab !== "home") { go("home"); setHomeSearchOpen(true); return; } setHomeSearchOpen((open) => !open); }} accessibilityRole="button" accessibilityLabel="Search"><Ionicons name="search-outline" size={18} color={C.text} /></TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} onPress={() => go("activity")} accessibilityLabel="Notifications"><Ionicons name="notifications-outline" size={18} color={C.text} /></TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} onPress={() => setThemeMode(isDark ? "light" : "dark")} accessibilityLabel="Theme"><Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={C.text} /></TouchableOpacity>
        <TouchableOpacity style={s.avatar} onPress={() => go("myspace")} accessibilityLabel="Profile"><Text style={s.avatarText}>{(session.name || "K").slice(0, 1).toUpperCase()}</Text></TouchableOpacity>
      </View>
    </View>
  );

  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;
  const eventList = (events || []).map((e: any) => ({ id: e.id, title: e.title, meta: e.meta, price: e.price, tag: e.tag, date: e.date, category: e.category }));

  const body = () => {
    if (settingsOpen) return <SettingsScreen s={s} C={C} isDark={isDark} sessionHandle={session.handle || ""} sessionKind={session.kind || "member"} localOnly={deviceSession} onBack={() => setSettingsOpen(false)} onDeleteAccount={async () => ({ ok: false, error: "Account deletion is not connected to the dedicated backend yet." })} show={show} />;
    if (selectedPost) return (
      <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} following={!!following[String(selectedPost.handle || selectedPost.name)]}
        onBack={() => setSelectedPost(null)}
        onLike={() => { void handleLikePost(String(selectedPost.id)); }}
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
    if (selectedArtist) return (<ArtistDetailScreen s={s} C={C} artistName={selectedArtist} tracks={tracks} onBack={() => setSelectedArtist(null)} onOpenTrack={(t) => { setSelectedArtist(null); setSelectedTrack(t); }} onPlay={playTrack} show={show} />);
    if (selectedDeskItem) return <DeskDetailScreen s={s} C={C} system={String(selectedDeskItem.system || selectedDeskItem.type || tab)} item={selectedDeskItem} onBack={() => setSelectedDeskItem(null)} show={show} />;
    if (tab === "media") return <MediaScreen s={s} C={C} news={news} initialArticleId={selectedArticleId} onBack={() => go("home")} show={show} />;
    if (tab === "events") return <EventsScreen s={s} C={C} events={eventList} liveData={eventsLive} onBack={() => go("home")} show={show} />;
    if (tab === "market") return <MarketScreen s={s} C={C} products={marketItems} onBack={() => go("home")} show={show} accountKind={session.kind} />;
    if (tab === "jobs") return <JobsScreen s={s} C={C} jobs={jobItems} onBack={() => go("home")} show={show} accountKind={session.kind} />;
    if (tab === "chat") return <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "communities") return <CommunitiesScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "creators") return <CreatorsScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "music") return <MusicScreen s={s} C={C} onBack={() => go("home")} show={show} onPlay={playTrack} onOpenTrack={setSelectedTrack} onOpenArtist={setSelectedArtist} accountKind={session.kind} tracks={tracks} />;
    if (tab === "cinema") return <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} accountKind={session.kind} />;
    if (tab === "activity") {
      const chips = ["All", "Likes", "Comments", "Follows"];
      return (
        <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 28 }} refreshControl={rc} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, paddingTop: 4, marginBottom: 8 }}><Text style={{ color: C.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.3 }}>Notifications</Text></View>
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
          onLike={(id) => { void handleLikePost(id); }} onComment={setCommentTake}
          onFollow={(key, name) => { setFollowing((p) => ({ ...p, [key]: !p[key] })); show(following[key] ? `Unfollowed ${name}` : `Following ${name}`); }}
          onReport={async (id) => { await submitReport("post", id, "other"); show("Reported locally"); }}
          onBlock={async (handle) => { await blockUser(handle); setBlocked((p) => p.includes(handle) ? p : [...p, handle]); show(`Blocked @${handle}`); }}
          show={show} />
      );
    }
    if (tab === "myspace") {
      const desks = primaryDesksFor(session.kind);
      const workspace = workspaceFor(session.kind);
      return (
        <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={{ color: C.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.35 }}>{workspace.title}</Text>
          <Text style={{ color: C.text2, fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 16 }}>{workspace.subtitle}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: C.text, fontSize: 28, fontWeight: "800" }}>{(session.name || "K").slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: "600", letterSpacing: -0.15 }}>{displayName || session.name}</Text>
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
            <TouchableOpacity style={{ borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => { setDisplayName(displayName || session.name || ""); setDisplayHandle(displayHandle || session.handle || ""); setProfileEditorOpen(true); }}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 22 }}>
            <View style={{ alignItems: "center" }}><Text style={{ color: C.text, fontWeight: "600", fontSize: 16 }}>{takes.length || 0}</Text><Text style={s.meta}>Posts</Text></View>
            <View style={{ alignItems: "center" }}><Text style={{ color: C.text, fontWeight: "600", fontSize: 16 }}>—</Text><Text style={s.meta}>Followers</Text></View>
            <View style={{ alignItems: "center" }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 18 }}>—</Text><Text style={s.meta}>Following</Text></View>
          </View>
          <Text style={{ color: C.text3, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginTop: 22, marginBottom: 10 }}>
            {workspace.primaryLabel.toUpperCase()}
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
        s={s} C={C} sessionName={session.name || "there"} news={news} tracks={tracks} takes={takes} liked={liked} onLikePost={handleLikePost} onCommentPost={(post) => setCommentTake(post)} onSharePost={(post) => { void Share.share({ message: [post.text || post.body || "", post.handle ? `@${post.handle}` : ""].filter(Boolean).join("\n") || "Check out this post on Kilode." }).catch(() => show("Could not share this post.")); }}
        events={events} market={marketItems} jobs={jobItems}
        refreshing={refreshing} onRefresh={onRefresh}
        onOpenMedia={(id) => { if (id) setSelectedArticleId(id); go("media"); }}
        onOpenMusic={() => go("music")} onOpenEvents={() => go("events")} onOpenMarket={() => go("market")}
        onOpenJobs={() => go("jobs")}
        onOpenSystem={(id) => go(id)}
        onOpenItem={(system, item) => setSelectedDeskItem({ ...item, system })}
        onOpenSocials={() => go("socials")} onOpenPost={(p) => setSelectedPost(p)} onOpenProfile={(u) => setSelectedProfile(u)}
        onCompose={() => setComposeOpen(true)} onPlayTrack={playTrack} show={show}
        searchOpen={homeSearchOpen} onCloseSearch={() => setHomeSearchOpen(false)}
      />
    );
  };

  const contextCreateLabel: Record<string, string> = {
    music: "Track", events: "Event", market: "Market", jobs: "Job", cinema: "Film", ads: "Ad", media: "Article", communities: "Community", creators: "Creator",
  };
  const contextCreateAction = contextCreateLabel[createContext];
  const createOptions = contextCreateAction ? CREATE.filter((option) => option.label === contextCreateAction) : CREATE;

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
      <View style={s.flex}>{body()}</View>
      {!settingsOpen && !selectedPost && !selectedProfile && !selectedTrack && !selectedArtist && !selectedDeskItem && !["activity", "myspace"].includes(tab) && (
        <TouchableOpacity
          onPress={() => {
            if (tab === "socials") { setComposeOpen(true); return; }
            setCreateContext(tab);
            setCreateOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={tab === "socials" ? "Write a post" : `Create for ${tab}`}
          activeOpacity={0.88}
          style={{
            position: "absolute",
            right: 18,
            bottom: nowPlaying ? 158 : 86,
            zIndex: 20,
            width: 54,
            height: 54,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: C.accent,
            borderWidth: 2,
            borderColor: isDark ? "#D7F0DD" : "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.22,
            shadowRadius: 10,
            elevation: 9,
          }}
        >
          <Ionicons
            name={({ socials: "create-outline", music: "musical-notes-outline", events: "calendar-outline", market: "bag-handle-outline", jobs: "briefcase-outline", media: "newspaper-outline", cinema: "film-outline", creators: "videocam-outline", communities: "people-outline", ads: "megaphone-outline" } as Record<string, keyof typeof Ionicons.glyphMap>)[tab] || "add"}
            size={23}
            color={isDark ? "#101512" : "#FFFFFF"}
          />
        </TouchableOpacity>
      )}
      {nowPlaying ? (
        <View style={[s.player, { gap: 10 }]}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent, alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="musical-notes" size={16} color="#fff" />
          </View>
          <View style={s.flex}>
            <Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text>
            <Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}{nowPlaying.previewKind === "sample" ? " · sample audio" : ""}</Text>
            <View style={{ height: 2, backgroundColor: C.border, borderRadius: 2, marginTop: 5, overflow: "hidden" }}>
              <View style={{ height: 2, width: (String(Math.round(playbackProgress * 100)) + "%") as `${number}%`, backgroundColor: C.accent }} />
            </View>
            {isPlaying ? <View style={{ flexDirection: "row", gap: 3, marginTop: 4, alignItems: "flex-end" }}><View style={{ width: 3, height: 6, borderRadius: 2, backgroundColor: C.accent }} /><View style={{ width: 3, height: 11, borderRadius: 2, backgroundColor: C.accent }} /><View style={{ width: 3, height: 8, borderRadius: 2, backgroundColor: C.accent }} /><View style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: C.accent }} /></View> : null}
          </View>
          <TouchableOpacity onPress={togglePlayback} accessibilityRole="button" accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}><Ionicons name={isPlaying ? "pause" : "play"} size={21} color={C.accent} /></TouchableOpacity>
          <TouchableOpacity onPress={async () => { if (soundRef.current) { await soundRef.current.stopAsync().catch(() => undefined); await soundRef.current.unloadAsync().catch(() => undefined); soundRef.current = null; } setNowPlaying(null); setIsPlaying(false); setPlaybackProgress(0); }} accessibilityRole="button" accessibilityLabel="Close player"><Ionicons name="close" size={18} color={C.text2} /></TouchableOpacity>
        </View>
      ) : null}
      <KilodeTabBar
        active={tab === "home" ? "home" : tab === "media" ? "media" : tab === "socials" ? "socials" : tab === "myspace" ? "myspace" : "more"}
        onTab={(id) => { if (id === "more") { setMoreOpen(true); return; } go(id); }}
        onCreate={() => { setCreateContext(tab); setCreateOpen(true); }}
        isDark={isDark}
        accent={C.accent}
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
                if (getBackendMode() === "supabase" && !session.userId) {
                  show("Sign in to your live Kilode account to publish to the shared feed.");
                  return;
                }
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
                      const created = (r as any).data;
                      if (r.source !== "live") {
                        await savePreviewPost({ ...created, previewOnly: true });
                      }
                      setTakes((p) => [created, ...p.filter((item) => String(item.id) !== String(created.id))]);
                      setComposeText(""); setComposeOpen(false); go("socials");
                      show(r.source === "live" ? "Posted live" : "Saved on this device · preview only");
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
      <Modal visible={profileEditorOpen} transparent animationType="slide" onRequestClose={() => setProfileEditorOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setProfileEditorOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle}>Edit profile</Text>
                <Text style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>Update how people see you on Kilode.</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileEditorOpen(false)} accessibilityRole="button" accessibilityLabel="Close profile editor" style={s.iconBtn}>
                <Ionicons name="close" size={20} color={C.text2} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: C.text2, fontSize: 12, marginBottom: 6 }}>Display name</Text>
            <TextInput value={displayName} onChangeText={setDisplayName} maxLength={60} placeholder="Your name" placeholderTextColor={C.text3}
              returnKeyType="next" style={{ color: C.text, backgroundColor: C.input, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 12 }} />
            <Text style={{ color: C.text2, fontSize: 12, marginBottom: 6 }}>Username</Text>
            <TextInput value={displayHandle} onChangeText={setDisplayHandle} autoCapitalize="none" autoCorrect={false} maxLength={30} placeholder="username" placeholderTextColor={C.text3}
              returnKeyType="next" style={{ color: C.text, backgroundColor: C.input, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 12 }} />
            <Text style={{ color: C.text2, fontSize: 12, marginBottom: 6 }}>Bio · up to 160 characters</Text>
            <TextInput value={profileBio} onChangeText={setProfileBio} maxLength={160} multiline placeholder="A little about you" placeholderTextColor={C.text3}
              style={{ color: C.text, backgroundColor: C.input, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, minHeight: 78, textAlignVertical: "top", marginBottom: 14 }} />
            <TouchableOpacity disabled={profileSaving} accessibilityRole="button" onPress={async () => {
              const nextName = displayName.trim();
              const nextHandle = displayHandle.trim().replace(/^@/, "").toLowerCase();
              const nextBio = profileBio.trim();
              if (nextName.length < 2 || nextName.length > 60) { show("Display name must be 2–60 characters."); return; }
              if (!/^[a-z0-9_]{3,30}$/.test(nextHandle)) { show("Username must be 3–30 letters, numbers, or underscores."); return; }
              if (nextBio.length > 160) { show("Bio must be 160 characters or fewer."); return; }
              setProfileSaving(true);
              try {
                if (!deviceSession && session.userId && getBackendMode() === "supabase") {
                  const result = await updateOwnProfile(session.userId, { handle: nextHandle, display_name: nextName, bio: nextBio || null });
                  if (!result.ok) { show(result.error || "Could not save your profile."); return; }
                } else {
                  await AsyncStorage.setItem("@kilode/profile:" + (session.userId || session.handle), JSON.stringify({ displayName: nextName, handle: nextHandle, bio: nextBio }));
                }
                setDisplayName(nextName);
                setDisplayHandle(nextHandle);
                setProfileBio(nextBio);
                setProfileEditorOpen(false);
                show(getBackendMode() === "supabase" && !deviceSession ? "Profile updated." : "Profile saved on this device.");
              } catch {
                show("Could not save your profile. Please try again.");
              } finally {
                setProfileSaving(false);
              }
            }} style={{ alignItems: "center", justifyContent: "center", backgroundColor: C.accent, borderRadius: 13, paddingVertical: 13, opacity: profileSaving ? 0.65 : 1 }}>
              <Text style={{ color: isDark ? "#101512" : "#FFFFFF", fontSize: 14, fontWeight: "800" }}>{profileSaving ? "Saving…" : "Save profile"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle}>{createContext === "home" ? "Create on Kilode" : "Create in " + (headerTitle || createContext)}</Text>
                <Text style={{ color: C.text2, fontSize: 12, marginTop: 4 }}>{contextCreateAction ? "Quick action for this screen." : "Choose where to start."}</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateOpen(false)} accessibilityRole="button" accessibilityLabel="Close create menu" style={s.iconBtn}><Ionicons name="close" size={20} color={C.text2} /></TouchableOpacity>
            </View>
            <View style={{ gap: 2 }}>
              {createOptions.map((o) => {
                const allowed = !(o as any).capability || can(session.kind, (o as any).capability);
                const iconName: keyof typeof Ionicons.glyphMap = ({
                  Post: "create-outline", Track: "musical-notes-outline", Film: "film-outline",
                  Job: "briefcase-outline", Market: "bag-handle-outline", Event: "calendar-outline", Ad: "megaphone-outline",
                  Article: "newspaper-outline", Community: "people-outline", Creator: "videocam-outline",
                } as Record<string, keyof typeof Ionicons.glyphMap>)[o.label] || "add-circle-outline";
                const subtitle = o.label === "Post" ? "Share something with your feed"
                  : o.label === "Track" ? "Open Music and its track tools"
                  : o.label === "Film" ? "Open Cinema"
                  : o.label === "Job" ? "Open Jobs"
                  : o.label === "Market" ? "Open Market"
                  : o.label === "Event" ? "Open Events"
                  : o.label === "Article" ? "Open Media publishing tools"
                  : o.label === "Community" ? "Open Communities"
                  : o.label === "Creator" ? "Open Creator tools"
                  : "Open Ads and campaign tools";
                return (
                  <TouchableOpacity key={o.label} accessibilityRole="button" accessibilityLabel={`${o.label}. ${subtitle}`}
                    style={[s.createActionRow, !allowed && { opacity: 0.45 }]}
                    onPress={() => {
                      if (!allowed) { show(`Your account type cannot ${o.label.toLowerCase()} yet.`); return; }
                      if (o.label === "Post") { setCreateOpen(false); setComposeOpen(true); return; }
                      setCreateOpen(false); go(o.tab);
                    }}>
                    <View style={s.createActionIcon}><Ionicons name={iconName} size={21} color={C.accent} /></View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>{o.label}</Text>
                      <Text numberOfLines={1} style={{ color: C.text2, fontSize: 11, marginTop: 3 }}>{subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.text3} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
      <CommentsSheet visible={!!commentTake} onClose={() => setCommentTake(null)} takeId={commentTake?.id || ""} takeAuthor={commentTake?.name || ""} takeText={commentTake?.text || ""} token={session.token} userId={session.userId} C={C} isDark={isDark} show={show} />
      {toast ? <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View> : null}
    </SafeAreaView>
  );
}

export function KilodeRoot() {
  return <AuthProvider><KilodeApp /></AuthProvider>;
}
